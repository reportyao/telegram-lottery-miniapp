import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'


        // 简单的内存速率限制（生产环境建议使用Redis）
        const rateLimitStore = new Map();
        const checkRateLimit = (clientId: string, maxRequests = 60, windowMs = 60000) => {
            const now = Date.now();
            const clientRequests = rateLimitStore.get(clientId) || [];
            
            // 清理过期的请求
            const validRequests = clientRequests.filter(time => now - time < windowMs);
            
            if (validRequests.length >= maxRequests) {
                throw new Error('Rate limit exceeded');
            }
            
            validRequests.push(now);
            rateLimitStore.set(clientId, validRequests);
        };
        


        // 输入验证函数
        const validateInput = (data: any, schema: any) => {
            for (const [key, validator] of Object.entries(schema)) {
                const value = data[key];
                if (value === undefined || value === null) {
                    if (validator.required) {
                        throw new Error(`${key} is required`);
                    }
                    continue;
                }
                
                if (validator.type === 'string' && typeof value !== 'string') {
                    throw new Error(`${key} must be a string`);
                }
                
                if (validator.type === 'number' && typeof value !== 'number') {
                    throw new Error(`${key} must be a number`);
                }
                
                if (validator.maxLength && value.length > validator.maxLength) {
                    throw new Error(`${key} exceeds maximum length`);
                }
            }
        };
        
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

serve(async (req) => {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  
        // 验证必需的环境变量
        const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
        for (const envVar of requiredEnvVars) {
            if (!Deno.env.get(envVar)) {
                throw new Error(`Missing required environment variable: ${envVar}`);
            }
        }
    
    try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const url = new URL(req.url)
    const action = url.searchParams.get('action')
    
    if (req.method === 'GET') {
      if (action === 'list') {
        // 获取转售市场列表
        const { data: resales, error } = await supabase
          .from('resales')
          .select(`
            *,
            seller:users!resales_seller_id_fkey(id, username, avatar_url),
            lottery_round:lottery_rounds!resales_lottery_round_id_fkey(
              id, 
              status,
              product:products(name, image_url, price)
            )
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        return new Response(
          JSON.stringify({ success: true, data: resales }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      if (action === 'my_resales') {
        // 获取当前用户的转售列表
        const userId = url.searchParams.get('user_id')
        if (!userId) {
          return new Response(
            JSON.stringify({ success: false, error: 'User ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        const { data: resales, error } = await supabase
          .from('resales')
          .select(`
            *,
            lottery_round:lottery_rounds!resales_lottery_round_id_fkey(
              id,
              status,
              product:products(name, image_url, price)
            )
          `)
          .eq('seller_id', userId)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        return new Response(
          JSON.stringify({ success: true, data: resales }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
    
    if (req.method === 'POST') {
      const requestData = await req.json()
      
      if (action === 'create') {
        // 创建转售单
        const { participation_id, shares_to_sell, price_per_share } = requestData
        
        // 验证参与记录
        const { data: participation, error: partError } = await supabase
          .from('participations')
          .select('*')
          .eq('id', participation_id)
          .single()
        
        if (partError) throw partError
        
        // 检查是否已经创建过转售单
        const { data: existingResale } = await supabase
          .from('resales')
          .select('id')
          .eq('participation_id', participation_id)
          .single()
        
        if (existingResale) {
          return new Response(
            JSON.stringify({ success: false, error: 'Already created resale for this participation' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // 检查是否还有剩余份额可以转售
        const { data: soldShares } = await supabase
          .from('resales')
          .select('shares_to_sell')
          .eq('participation_id', participation_id)
          .eq('status', 'active')
        
        const totalSoldShares = soldShares?.reduce((sum, item) => sum + item.shares_to_sell, 0) || 0
        const availableShares = participation.shares_count - totalSoldShares
        
        if (shares_to_sell > availableShares) {
          return new Response(
            JSON.stringify({ success: false, error: 'Not enough shares available for resale' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
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
        
        if (createError) throw createError
        
        return new Response(
          JSON.stringify({ success: true, data: resale }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      if (action === 'purchase') {
        // 购买转售份额
        const { resale_id, shares_to_buy, buyer_id } = requestData
        
        // 获取转售信息
        const { data: resale, error: resaleError } = await supabase
          .from('resales')
          .select(`
            *,
            participation:participations!resales_participation_id_fkey(*),
            lottery_round:lottery_rounds!resales_lottery_round_id_fkey(*)
          `)
          .eq('id', resale_id)
          .single()
        
        if (resaleError) throw resaleError
        
        if (resale.status !== 'active') {
          return new Response(
            JSON.stringify({ success: false, error: 'Resale is not active' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        if (shares_to_buy > resale.shares_to_sell) {
          return new Response(
            JSON.stringify({ success: false, error: 'Not enough shares available' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // 检查用户余额
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('balance')
          .eq('id', buyer_id)
          .single()
        
        if (userError) throw userError
        
        const totalCost = shares_to_buy * resale.price_per_share
        
        if (user.balance < totalCost) {
          return new Response(
            JSON.stringify({ success: false, error: 'Insufficient balance' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        // 开始事务：扣除买家余额，增加卖家余额，更新转售状态，创建交易记录
        const transaction_fee = totalCost * 0.02 // 2%手续费
        const seller_amount = totalCost - transaction_fee
        
        // 1. 扣除买家余额
        const { error: buyerUpdateError } = await supabase
          .from('users')
          .update({ balance: user.balance - totalCost })
          .eq('id', buyer_id)
        
        if (buyerUpdateError) throw buyerUpdateError
        
        // 2. 获取卖家当前余额
        const { data: seller, error: sellerError } = await supabase
          .from('users')
          .select('balance')
          .eq('id', resale.seller_id)
          .single()
        
        if (sellerError) throw sellerError
        
        // 3. 增加卖家余额
        const { error: sellerUpdateError } = await supabase
          .from('users')
          .update({ balance: seller.balance + seller_amount })
          .eq('id', resale.seller_id)
        
        if (sellerUpdateError) throw sellerUpdateError
        
        // 4. 创建新的参与记录（转给买家）
        const { data: newParticipation, error: partCreateError } = await supabase
          .from('participations')
          .insert({
            user_id: buyer_id,
            lottery_round_id: resale.lottery_round_id,
            shares_count: shares_to_buy,
            amount_paid: shares_to_buy * resale.lottery_round.price_per_share,
            is_resaleable: false // 转售的份额不能再转售
          })
          .select()
          .single()
        
        if (partCreateError) throw partCreateError
        
        // 5. 创建交易记录
        const { data: transactionData, error: transactionError } = await supabase
          .from('resale_transactions')
          .insert({
            resale_id,
            buyer_id,
            seller_id: resale.seller_id,
            participation_id: resale.participation_id,
            shares_count: shares_to_buy,
            price_per_share: resale.price_per_share,
            total_amount: totalCost,
            transaction_fee
          })
          .select()
          .single()
        
        if (transactionError) throw transactionError
        
        // 6. 更新转售单状态
        const remainingShares = resale.shares_to_sell - shares_to_buy
        const newStatus = remainingShares > 0 ? 'active' : 'sold'
        
        const { error: updateResaleError } = await supabase
          .from('resales')
          .update({
            shares_to_sell: remainingShares,
            total_amount: remainingShares * resale.price_per_share,
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', resale_id)
        
        if (updateResaleError) throw updateResaleError
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: { 
              transaction_id: transactionData.id,
              new_participation: newParticipation 
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      if (action === 'cancel') {
        // 取消转售单
        const { resale_id, seller_id } = requestData
        
        const { error: cancelError } = await supabase
          .from('resales')
          .update({ 
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', resale_id)
          .eq('seller_id', seller_id)
          .eq('status', 'active') // 只有活跃的转售单可以取消
        
        if (cancelError) throw cancelError
        
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
    
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Resale API error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})