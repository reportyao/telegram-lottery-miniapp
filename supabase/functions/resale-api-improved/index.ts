// 转售业务逻辑并发控制改进方案
// 文件路径: /workspace/supabase/functions/resale-api-improved/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const url = new URL(req.url)
    const action = url.searchParams.get('action')
    
    // GET 操作处理（保持不变）
    if (req.method === 'GET') {
      // ... 现有的 GET 操作代码保持不变
    }
    
    // POST 操作处理
    if (req.method === 'POST') {
      const requestData = await req.json()
      
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
      action: url.searchParams.get('action'),
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    })
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR',
          message: error.message || 'Internal server error',
          timestamp: new Date().toISOString()
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// 改进的购买处理函数 - 使用数据库事务
async function handlePurchaseResale(supabase: any, requestData: any) {
  const { resale_id, shares_to_buy, buyer_id } = requestData
  
  // 输入验证
  if (!resale_id || !shares_to_buy || !buyer_id) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { 
          code: 'INVALID_INPUT',
          message: 'Missing required fields: resale_id, shares_to_buy, buyer_id'
        }
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
  
  if (shares_to_buy <= 0) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { 
          code: 'INVALID_INPUT',
          message: 'shares_to_buy must be greater than 0'
        }
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
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
    let errorMessage = 'Purchase failed'
    let errorCode = 'PURCHASE_ERROR'
    
    if (error.message.includes('Insufficient shares available')) {
      errorMessage = 'Not enough shares available'
      errorCode = 'INSUFFICIENT_SHARES'
    } else if (error.message.includes('Insufficient buyer balance')) {
      errorMessage = 'Insufficient balance'
      errorCode = 'INSUFFICIENT_BALANCE'
    } else if (error.message.includes('Resale not active')) {
      errorMessage = 'Resale is not active'
      errorCode = 'RESALE_NOT_ACTIVE'
    } else if (error.message.includes('resale_not_found')) {
      errorMessage = 'Resale not found'
      errorCode = 'RESALE_NOT_FOUND'
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { 
          code: errorCode,
          message: errorMessage,
          timestamp: new Date().toISOString()
        }
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
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
async function handleCreateResale(supabase: any, requestData: any) {
  const { participation_id, shares_to_sell, price_per_share } = requestData
  
  // 输入验证
  if (!participation_id || !shares_to_sell || !price_per_share) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { 
          code: 'INVALID_INPUT',
          message: 'Missing required fields'
        }
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
  
  if (shares_to_sell <= 0 || price_per_share <= 0) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { 
          code: 'INVALID_INPUT',
          message: 'shares_to_sell and price_per_share must be greater than 0'
        }
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
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
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { 
          code: 'PARTICIPATION_NOT_FOUND',
          message: 'Participation not found'
        }
      }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
  
  // 检查是否可转售
  if (!participation.is_resaleable) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { 
          code: 'NOT_RESALEABLE',
          message: 'This participation is not resaleable'
        }
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
  
  // 检查彩票轮状态
  if (participation.lottery_round.status !== 'active') {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { 
          code: 'LOTTERY_NOT_ACTIVE',
          message: 'Cannot create resale for inactive lottery'
        }
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
  
  // 检查是否已经创建过转售单
  const { data: existingResale } = await supabase
    .from('resales')
    .select('id, status')
    .eq('participation_id', participation_id)
    .single()
  
  if (existingResale && existingResale.status === 'active') {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { 
          code: 'RESALE_EXISTS',
          message: 'Already created active resale for this participation'
        }
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
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
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { 
          code: 'INSUFFICIENT_SHARES',
          message: `Not enough shares available. Available: ${availableShares}, Requested: ${shares_to_sell}`
        }
      }),
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
  
  if (createError) {
    console.error('Create resale error:', createError)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { 
          code: 'CREATE_FAILED',
          message: 'Failed to create resale'
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
  
  return new Response(
    JSON.stringify({ success: true, data: resale }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// 改进的取消处理函数 - 完善的份额返还逻辑
async function handleCancelResale(supabase: any, requestData: any) {
  const { resale_id, seller_id } = requestData
  
  // 输入验证
  if (!resale_id || !seller_id) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { 
          code: 'INVALID_INPUT',
          message: 'Missing required fields: resale_id, seller_id'
        }
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
  
  try {
    // 使用V2存储过程处理取消操作，包含完善的份额返还逻辑
    const { data, error } = await supabase.rpc('cancel_resale_with_refund_v2', {
      p_resale_id: resale_id,
      p_seller_id: seller_id
    })
    
    if (error) {
      console.error('Cancel RPC error:', error)
      
      let errorMessage = 'Cancel failed'
      let errorCode = 'CANCEL_ERROR'
      
      if (error.message.includes('RESALE_NOT_FOUND')) {
        errorMessage = 'Resale not found'
        errorCode = 'RESALE_NOT_FOUND'
      } else if (error.message.includes('NOT_OWNER')) {
        errorMessage = 'You can only cancel your own resales'
        errorCode = 'NOT_OWNER'
      } else if (error.message.includes('NOT_ACTIVE')) {
        errorMessage = 'Can only cancel active resales'
        errorCode = 'NOT_ACTIVE'
      } else if (error.message.includes('RESALE_CANCEL_FAILED')) {
        errorMessage = 'Failed to cancel resale due to system error'
        errorCode = 'SYSTEM_ERROR'
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: { 
            code: errorCode,
            message: errorMessage,
            timestamp: new Date().toISOString()
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred during cancellation',
          timestamp: new Date().toISOString()
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

// 数据库存储过程 SQL
/*
-- 创建原子性购买存储过程
CREATE OR REPLACE FUNCTION execute_resale_purchase(
    p_resale_id UUID,
    p_buyer_id UUID,
    p_shares_to_buy INTEGER
) RETURNS JSON AS $$
DECLARE
    v_seller_id UUID;
    v_price_per_share DECIMAL(10,2);
    v_total_cost DECIMAL(10,2);
    v_transaction_fee DECIMAL(10,2);
    v_seller_amount DECIMAL(10,2);
    v_resale_record RECORD;
    v_seller_balance DECIMAL(10,2);
    v_buyer_balance DECIMAL(10,2);
    v_new_participation_id UUID;
    v_transaction_id UUID;
    v_remaining_shares INTEGER;
BEGIN
    -- 获取转售信息并锁定记录（防止并发修改）
    SELECT * INTO v_resale_record 
    FROM resales 
    WHERE id = p_resale_id AND status = 'active'
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'resale_not_found';
    END IF;
    
    -- 验证份额可用性
    IF v_resale_record.shares_to_sell < p_shares_to_buy THEN
        RAISE EXCEPTION 'Insufficient shares available';
    END IF;
    
    v_seller_id := v_resale_record.seller_id;
    v_price_per_share := v_resale_record.price_per_share;
    v_total_cost := p_shares_to_buy * v_price_per_share;
    v_transaction_fee := v_total_cost * 0.02;
    v_seller_amount := v_total_cost - v_transaction_fee;
    
    -- 验证买家身份（不能购买自己的转售单）
    IF v_seller_id = p_buyer_id THEN
        RAISE EXCEPTION 'Cannot buy your own resale';
    END IF;
    
    -- 获取并锁定买家余额记录
    SELECT balance INTO v_buyer_balance
    FROM users 
    WHERE id = p_buyer_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Buyer not found';
    END IF;
    
    -- 验证买家余额充足
    IF v_buyer_balance < v_total_cost THEN
        RAISE EXCEPTION 'Insufficient buyer balance';
    END IF;
    
    -- 获取并锁定卖家余额记录
    SELECT balance INTO v_seller_balance
    FROM users 
    WHERE id = v_seller_id
    FOR UPDATE;
    
    -- 开始事务操作
    
    -- 1. 扣除买家余额
    UPDATE users 
    SET balance = balance - v_total_cost 
    WHERE id = p_buyer_id;
    
    -- 2. 增加卖家余额
    UPDATE users 
    SET balance = balance + v_seller_amount 
    WHERE id = v_seller_id;
    
    -- 3. 创建新的参与记录（转给买家）
    INSERT INTO participations (
        user_id, 
        lottery_round_id, 
        shares_count, 
        amount_paid, 
        is_resaleable,
        original_participation_id
    ) VALUES (
        p_buyer_id,
        v_resale_record.lottery_round_id,
        p_shares_to_buy,
        p_shares_to_buy * v_price_per_share,
        false, -- 转售的份额不能再转售
        v_resale_record.participation_id
    ) RETURNING id INTO v_new_participation_id;
    
    -- 4. 创建交易记录
    INSERT INTO resale_transactions (
        resale_id,
        buyer_id,
        seller_id,
        participation_id,
        shares_count,
        price_per_share,
        total_amount,
        transaction_fee,
        status
    ) VALUES (
        p_resale_id,
        p_buyer_id,
        v_seller_id,
        v_new_participation_id,
        p_shares_to_buy,
        v_price_per_share,
        v_total_cost,
        v_transaction_fee,
        'completed'
    ) RETURNING id INTO v_transaction_id;
    
    -- 5. 更新转售单状态
    v_remaining_shares := v_resale_record.shares_to_sell - p_shares_to_buy;
    
    UPDATE resales
    SET 
        shares_to_sell = v_remaining_shares,
        total_amount = v_remaining_shares * v_price_per_share,
        status = CASE 
            WHEN v_remaining_shares = 0 THEN 'sold'
            ELSE 'active'
        END,
        updated_at = NOW()
    WHERE id = p_resale_id;
    
    -- 返回成功结果
    RETURN JSON_BUILD_OBJECT(
        'success', TRUE,
        'transaction_id', v_transaction_id,
        'new_participation', v_new_participation_id,
        'remaining_shares', v_remaining_shares
    );
    
EXCEPTION
    WHEN OTHERS THEN
        -- 任何异常都会导致自动回滚
        RAISE EXCEPTION 'Purchase failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 创建取消转售存储过程
CREATE OR REPLACE FUNCTION cancel_resale_with_refund(
    p_resale_id UUID,
    p_seller_id UUID
) RETURNS JSON AS $$
DECLARE
    v_resale_record RECORD;
    v_cancelled_shares INTEGER;
    v_refund_amount DECIMAL(10,2);
BEGIN
    -- 获取转售信息并锁定
    SELECT * INTO v_resale_record
    FROM resales
    WHERE id = p_resale_id
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Resale not found';
    END IF;
    
    -- 验证所有权
    IF v_resale_record.seller_id != p_seller_id THEN
        RAISE EXCEPTION 'Not owner';
    END IF;
    
    -- 验证状态
    IF v_resale_record.status != 'active' THEN
        RAISE EXCEPTION 'Not active';
    END IF;
    
    v_cancelled_shares := v_resale_record.shares_to_sell;
    v_refund_amount := v_cancelled_shares * v_resale_record.price_per_share;
    
    -- 取消转售单
    UPDATE resales
    SET 
        status = 'cancelled',
        updated_at = NOW()
    WHERE id = p_resale_id;
    
    RETURN JSON_BUILD_OBJECT(
        'success', TRUE,
        'cancelled_shares', v_cancelled_shares,
        'refund_amount', v_refund_amount
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Cancel failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;
*/
