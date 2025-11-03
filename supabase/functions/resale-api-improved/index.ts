// 转售业务逻辑并发控制改进方案
// 文件路径: /workspace/supabase/functions/resale-api-improved/index.ts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// 类型定义
interface CORSHeaders {
  'Access-Control-Allow-Origin': string
  'Access-Control-Allow-Headers': string
  'Access-Control-Allow-Methods': string
}

interface SupabaseClient {
  from(table: string): any
  rpc(functionName: string, params: Record<string, any>): any
}

interface RequestData {
  resale_id?: string
  shares_to_buy?: number
  buyer_id?: string
  participation_id?: string
  shares_to_sell?: number
  price_per_share?: number
  seller_id?: string
}

interface ResaleRecord {
  id: string
  seller_id: string
  participation_id: string
  lottery_round_id: string
  shares_to_sell: number
  price_per_share: number
  total_amount: number
  status: string
  is_resaleable?: boolean
  user_id?: string
  shares_count?: number
  lottery_round?: {
    status: string
    product?: {
      name: string
      currency: string
    }
  }
}

const corsHeaders: CORSHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

Deno.serve(async (req: Request): Promise<Response> => {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    // 验证环境变量
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: { 
            code: 'CONFIG_ERROR',
            message: 'Service configuration error',
            timestamp: new Date().toISOString()
          } 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // 创建标准的Supabase客户端
    const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey)
    
    const url = new URL(req.url)
    const action = url.searchParams.get('action')
    
    // GET 操作处理
    if (req.method === 'GET') {
      if (action === 'list') {
        return await handleListResales(supabase)
      }
      
      if (action === 'market') {
        return await handleMarketList(supabase)
      }
    }
    
    // POST 操作处理
    if (req.method === 'POST') {
      const requestData: RequestData = await req.json()
      
      if (action === 'create') {
        return await handleCreateResale(supabase, requestData)
      }
      
      if (action === 'purchase') {
        return await handlePurchaseResale(supabase, requestData)
      }
      
      if (action === 'cancel') {
        return await handleCancelResale(supabase, requestData)
      }
    }
    
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Resale API error:', {
      action: new URL(req.url).searchParams.get('action'),
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Internal server error',
          timestamp: new Date().toISOString()
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// 改进的购买处理函数 - 使用数据库事务
async function handlePurchaseResale(supabase: SupabaseClient, requestData: RequestData): Promise<Response> {
  const { resale_id, shares_to_buy, buyer_id } = requestData
  
  // 输入验证
  if (!resale_id || !shares_to_buy || !buyer_id) {
    return createErrorResponse('INVALID_INPUT', 'Missing required fields: resale_id, shares_to_buy, buyer_id')
  }
  
  if (shares_to_buy <= 0) {
    return createErrorResponse('INVALID_INPUT', 'shares_to_buy must be greater than 0')
  }
  
  // 使用V2存储过程执行原子性购买操作
  const { data, error } = await supabase.rpc('execute_resale_purchase_v2', {
    p_resale_id: resale_id,
    p_buyer_id: buyer_id,
    p_shares_to_buy: shares_to_buy
  })
  
  if (error) {
    console.error('Purchase RPC error:', error)
    
    // 解析错误类型并返回相应信息
    const { errorCode, errorMessage } = parsePurchaseError(error.message)
    
    return createErrorResponse(errorCode, errorMessage)
  }
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      data: {
        transaction_id: data.transaction_id,
        new_participation: data.new_participation,
        remaining_shares: data.remaining_shares
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// 创建转售单处理函数（添加输入验证）
async function handleCreateResale(supabase: SupabaseClient, requestData: RequestData): Promise<Response> {
  const { participation_id, shares_to_sell, price_per_share } = requestData
  
  // 输入验证
  if (!participation_id || !shares_to_sell || !price_per_share) {
    return createErrorResponse('INVALID_INPUT', 'Missing required fields')
  }
  
  if (shares_to_sell <= 0 || price_per_share <= 0) {
    return createErrorResponse('INVALID_INPUT', 'shares_to_sell and price_per_share must be greater than 0')
  }
  
  // 获取转售权限和验证
  const { data: participation, error: partError } = await supabase
    .from('participations')
    .select(`
      *,
      lottery_round:lottery_rounds!participations_lottery_round_id_fkey(
        status,
        product:products(name, currency)
      )
    `)
    .eq('id', participation_id)
    .single()
  
  if (partError || !participation) {
    return createErrorResponse('PARTICIPATION_NOT_FOUND', 'Participation not found', 404)
  }
  
  // 检查是否可转售
  if (!participation.is_resaleable) {
    return createErrorResponse('NOT_RESALEABLE', 'This participation is not resaleable')
  }
  
  // 检查彩票轮状态
  if (participation.lottery_round.status !== 'active') {
    return createErrorResponse('LOTTERY_NOT_ACTIVE', 'Cannot create resale for inactive lottery')
  }
  
  // 检查是否已经创建过转售单
  const { data: existingResale } = await supabase
    .from('resales')
    .select('id, status')
    .eq('participation_id', participation_id)
    .eq('status', 'active')
    .single()
  
  if (existingResale && existingResale.status === 'active') {
    return createErrorResponse('RESALE_EXISTS', 'Already created active resale for this participation')
  }
  
  // 计算可用份额
  const { data: soldShares } = await supabase
    .from('resales')
    .select('shares_to_sell')
    .eq('participation_id', participation_id)
    .eq('status', 'active')
  
  const totalSoldShares = soldShares?.reduce((sum: number, item: any) => sum + item.shares_to_sell, 0) || 0
  const availableShares = participation.shares_count - totalSoldShares
  
  if (shares_to_sell > availableShares) {
    return createErrorResponse('INSUFFICIENT_SHARES', `Not enough shares available. Available: ${availableShares}, Requested: ${shares_to_sell}`)
  }
  
  const totalAmount = shares_to_sell * price_per_share
  
  const { data: resale, error: createError } = await supabase
    .from('resales')
    .insert({
      seller_id: participation.user_id,
      participation_id,
      lottery_round_id: participation.lottery_round_id,
      shares_to_sell,
      price_per_share,
      total_amount: totalAmount
    })
    .select()
    .single()
  
  if (createError) {
    console.error('Create resale error:', createError)
    return createErrorResponse('CREATE_FAILED', 'Failed to create resale')
  }
  
  return new Response(
    JSON.stringify({ success: true, data: resale }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// 改进的取消处理函数 - 完善的份额返还逻辑
async function handleCancelResale(supabase: SupabaseClient, requestData: RequestData): Promise<Response> {
  const { resale_id, seller_id } = requestData
  
  // 输入验证
  if (!resale_id || !seller_id) {
    return createErrorResponse('INVALID_INPUT', 'Missing required fields: resale_id, seller_id')
  }
  
  try {
    // 使用V2存储过程处理取消操作，包含完善的份额返还逻辑
    const { data, error } = await supabase.rpc('cancel_resale_with_refund_v2', {
      p_resale_id: resale_id,
      p_seller_id: seller_id
    })
    
    if (error) {
      console.error('Cancel RPC error:', error)
      
      const { errorCode, errorMessage } = parseCancelError(error.message)
      return createErrorResponse(errorCode, errorMessage)
    }
    
    // 成功取消，返回详细信息
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          cancelled_shares: data.cancelled_shares,
          refundable_shares: data.refundable_shares,
          refund_amount: data.refund_amount,
          status: data.status,
          message: data.status === 'fully_cancelled' 
            ? 'Resale cancelled successfully, all shares released'
            : 'Resale partially cancelled, remaining shares still active'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error in cancel handler:', error)
    
    return createErrorResponse('INTERNAL_ERROR', 'An unexpected error occurred during cancellation')
  }
}

// 获取转售单列表处理函数
async function handleListResales(supabase: SupabaseClient): Promise<Response> {
  try {
    const { data: resales, error } = await supabase
      .from('resales')
      .select(`
        *,
        seller:users!resales_seller_id_fkey(email, full_name),
        participation:participations(
          shares_count,
          lottery_round:lottery_rounds(
            status,
            product:products(name, currency)
          )
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('List resales error:', error)
      return createErrorResponse('FETCH_FAILED', 'Failed to fetch resales')
    }
    
    return new Response(
      JSON.stringify({ success: true, data: resales }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error in list handler:', error)
    return createErrorResponse('INTERNAL_ERROR', 'Failed to fetch resales')
  }
}

// 获取转售市场处理函数
async function handleMarketList(supabase: SupabaseClient): Promise<Response> {
  try {
    const { data: market, error } = await supabase
      .from('resales')
      .select(`
        *,
        seller:users!resales_seller_id_fkey(email),
        participation:participations(
          shares_count,
          lottery_round:lottery_rounds(
            status,
            end_date,
            product:products(name, currency, image_url)
          )
        )
      `)
      .eq('status', 'active')
      .gte('lottery_round:end_date', new Date().toISOString())
      .order('price_per_share', { ascending: true })
    
    if (error) {
      console.error('Market list error:', error)
      return createErrorResponse('FETCH_FAILED', 'Failed to fetch market data')
    }
    
    return new Response(
      JSON.stringify({ success: true, data: market }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Unexpected error in market handler:', error)
    return createErrorResponse('INTERNAL_ERROR', 'Failed to fetch market data')
  }
}

// 辅助函数：创建标准错误响应
function createErrorResponse(code: string, message: string, status: number = 400): Response {
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: { 
        code,
        message,
        timestamp: new Date().toISOString()
      }
    }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// 辅助函数：解析购买错误
function parsePurchaseError(errorMessage: string): { errorCode: string, errorMessage: string } {
  if (errorMessage.includes('Insufficient shares available')) {
    return { errorCode: 'INSUFFICIENT_SHARES', errorMessage: 'Not enough shares available' }
  } else if (errorMessage.includes('Insufficient buyer balance')) {
    return { errorCode: 'INSUFFICIENT_BALANCE', errorMessage: 'Insufficient balance' }
  } else if (errorMessage.includes('Resale not active')) {
    return { errorCode: 'RESALE_NOT_ACTIVE', errorMessage: 'Resale is not active' }
  } else if (errorMessage.includes('resale_not_found')) {
    return { errorCode: 'RESALE_NOT_FOUND', errorMessage: 'Resale not found' }
  } else if (errorMessage.includes('Cannot buy your own resale')) {
    return { errorCode: 'CANNOT_BUY_OWN', errorMessage: 'You cannot buy your own resale' }
  }
  
  return { errorCode: 'PURCHASE_ERROR', errorMessage: 'Purchase failed' }
}

// 辅助函数：解析取消错误
function parseCancelError(errorMessage: string): { errorCode: string, errorMessage: string } {
  if (errorMessage.includes('RESALE_NOT_FOUND')) {
    return { errorCode: 'RESALE_NOT_FOUND', errorMessage: 'Resale not found' }
  } else if (errorMessage.includes('NOT_OWNER')) {
    return { errorCode: 'NOT_OWNER', errorMessage: 'You can only cancel your own resales' }
  } else if (errorMessage.includes('NOT_ACTIVE')) {
    return { errorCode: 'NOT_ACTIVE', errorMessage: 'Can only cancel active resales' }
  } else if (errorMessage.includes('RESALE_CANCEL_FAILED')) {
    return { errorCode: 'SYSTEM_ERROR', errorMessage: 'Failed to cancel resale due to system error' }
  }
  
  return { errorCode: 'CANCEL_ERROR', errorMessage: 'Cancel failed' }
}