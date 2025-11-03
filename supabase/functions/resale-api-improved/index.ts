// 转售业务逻辑并发控制改进方案
// 文件路径: /workspace/supabase/functions/resale-api-improved/index.ts

// 类型定义
interface CORSHeaders {
  'Access-Control-Allow-Origin': string
  'Access-Control-Allow-Headers': string
  'Access-Control-Allow-Methods': string
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
    
    const url = new URL(req.url)
    const action = url.searchParams.get('action')
    
    // GET 操作处理
    if (req.method === 'GET') {
      if (action === 'list') {
        return await handleListResales(supabaseUrl, supabaseServiceKey)
      }
      
      if (action === 'market') {
        return await handleMarketList(supabaseUrl, supabaseServiceKey)
      }
    }
    
    // POST 操作处理
    if (req.method === 'POST') {
      const requestData: RequestData = await req.json()
      
      if (action === 'create') {
        return await handleCreateResale(supabaseUrl, supabaseServiceKey, requestData)
      }
      
      if (action === 'purchase') {
        return await handlePurchaseResale(supabaseUrl, supabaseServiceKey, requestData)
      }
      
      if (action === 'cancel') {
        return await handleCancelResale(supabaseUrl, supabaseServiceKey, requestData)
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
async function handlePurchaseResale(supabaseUrl: string, supabaseServiceKey: string, requestData: RequestData): Promise<Response> {
  const { resale_id, shares_to_buy, buyer_id } = requestData
  
  // 输入验证
  if (!resale_id || !shares_to_buy || !buyer_id) {
    return createErrorResponse('INVALID_INPUT', 'Missing required fields: resale_id, shares_to_buy, buyer_id')
  }
  
  if (shares_to_buy <= 0) {
    return createErrorResponse('INVALID_INPUT', 'shares_to_buy must be greater than 0')
  }
  
  try {
    // 使用原生fetch调用数据库函数
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_resale_purchase`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
      },
      body: JSON.stringify({
        p_resale_id: resale_id,
        p_buyer_id: buyer_id,
        p_shares_to_buy: shares_to_buy
      })
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      console.error('Purchase RPC error:', result)
      
      // 解析错误类型并返回相应信息
      const { errorCode, errorMessage } = parsePurchaseError(result.message || result.error)
      
      return createErrorResponse(errorCode, errorMessage)
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          transaction_id: result.transaction_id,
          new_participation: result.new_participation,
          remaining_shares: result.remaining_shares
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Purchase error:', error)
    return createErrorResponse('INTERNAL_ERROR', 'Purchase failed')
  }
}

// 创建转售单处理函数
async function handleCreateResale(supabaseUrl: string, supabaseServiceKey: string, requestData: RequestData): Promise<Response> {
  const { participation_id, shares_to_sell, price_per_share } = requestData
  
  // 输入验证
  if (!participation_id || !shares_to_sell || !price_per_share) {
    return createErrorResponse('INVALID_INPUT', 'Missing required fields')
  }
  
  if (shares_to_sell <= 0 || price_per_share <= 0) {
    return createErrorResponse('INVALID_INPUT', 'shares_to_sell and price_per_share must be greater than 0')
  }
  
  try {
    // 检查参与记录
    const participationResponse = await fetch(`${supabaseUrl}/rest/v1/participations?id=eq.${participation_id}&select=*`, {
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
      }
    })
    
    const participations = await participationResponse.json()
    
    if (!participations || participations.length === 0) {
      return createErrorResponse('PARTICIPATION_NOT_FOUND', 'Participation not found', 404)
    }
    
    const participation = participations[0]
    
    // 检查是否可转售
    if (!participation.is_resaleable) {
      return createErrorResponse('NOT_RESALEABLE', 'This participation is not resaleable')
    }
    
    // 计算可用份额
    const soldSharesResponse = await fetch(`${supabaseUrl}/rest/v1/resales?participation_id=eq.${participation_id}&status=eq.active&select=shares_to_sell`, {
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
      }
    })
    
    const soldShares = await soldSharesResponse.json()
    const totalSoldShares = soldShares?.reduce((sum: number, item: any) => sum + item.shares_to_sell, 0) || 0
    const availableShares = participation.shares_count - totalSoldShares
    
    if (shares_to_sell > availableShares) {
      return createErrorResponse('INSUFFICIENT_SHARES', `Not enough shares available. Available: ${availableShares}, Requested: ${shares_to_sell}`)
    }
    
    const totalAmount = shares_to_sell * price_per_share
    
    // 创建转售单
    const createResponse = await fetch(`${supabaseUrl}/rest/v1/resales`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        seller_id: participation.user_id,
        participation_id,
        lottery_round_id: participation.lottery_round_id,
        shares_to_sell,
        price_per_share,
        total_amount: totalAmount
      })
    })
    
    const resale = await createResponse.json()
    
    if (!createResponse.ok) {
      console.error('Create resale error:', resale)
      return createErrorResponse('CREATE_FAILED', 'Failed to create resale')
    }
    
    return new Response(
      JSON.stringify({ success: true, data: resale }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Create resale error:', error)
    return createErrorResponse('INTERNAL_ERROR', 'Failed to create resale')
  }
}

// 改进的取消处理函数
async function handleCancelResale(supabaseUrl: string, supabaseServiceKey: string, requestData: RequestData): Promise<Response> {
  const { resale_id, seller_id } = requestData
  
  // 输入验证
  if (!resale_id || !seller_id) {
    return createErrorResponse('INVALID_INPUT', 'Missing required fields: resale_id, seller_id')
  }
  
  try {
    // 使用原生fetch调用取消函数
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/cancel_resale_with_refund`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
      },
      body: JSON.stringify({
        p_resale_id: resale_id,
        p_seller_id: seller_id
      })
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      console.error('Cancel RPC error:', result)
      
      const { errorCode, errorMessage } = parseCancelError(result.message || result.error)
      return createErrorResponse(errorCode, errorMessage)
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          cancelled_shares: result.cancelled_shares,
          refund_amount: result.refund_amount
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Cancel error:', error)
    return createErrorResponse('INTERNAL_ERROR', 'Cancel failed')
  }
}

// 获取转售单列表处理函数
async function handleListResales(supabaseUrl: string, supabaseServiceKey: string): Promise<Response> {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/resales?status=eq.active&select=*&order=created_at.desc`, {
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
      }
    })
    
    const resales = await response.json()
    
    if (!response.ok) {
      console.error('List resales error:', resales)
      return createErrorResponse('FETCH_FAILED', 'Failed to fetch resales')
    }
    
    return new Response(
      JSON.stringify({ success: true, data: resales }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('List resales error:', error)
    return createErrorResponse('INTERNAL_ERROR', 'Failed to fetch resales')
  }
}

// 获取转售市场处理函数
async function handleMarketList(supabaseUrl: string, supabaseServiceKey: string): Promise<Response> {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/resales?status=eq.active&select=*&order=price_per_share.asc`, {
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
      }
    })
    
    const market = await response.json()
    
    if (!response.ok) {
      console.error('Market list error:', market)
      return createErrorResponse('FETCH_FAILED', 'Failed to fetch market data')
    }
    
    return new Response(
      JSON.stringify({ success: true, data: market }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Market list error:', error)
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
