Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'true'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    
        // 验证必需的环境变量
        const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
        for (const envVar of requiredEnvVars) {
            if (!Deno.env.get(envVar)) {
                throw new Error(`Missing required environment variable: ${envVar}`);
            }
        }
    
    try {
        const { user_id, amount, payment_method } = await req.json();

        if (!user_id || !amount || amount <= 0) {
            throw new Error('Invalid parameters');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        const headers = {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        };

        // 创建订单
        const orderResponse = await fetch(`${supabaseUrl}/rest/v1/orders`, {
            method: 'POST',
            headers: {
                ...headers,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                user_id,
                total_amount: amount,
                status: 'pending',
                payment_method: payment_method || 'manual'
            })
        });

        if (!orderResponse.ok) {
            throw new Error('Failed to create order');
        }

        const order = await orderResponse.json();

        // 在真实场景中，这里应该调用支付网关API
        // 目前演示版本：直接模拟支付成功
        
        // 更新订单状态为已支付
        const updateOrderResponse = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${order[0].id}`, {
            method: 'PATCH',
            headers: {
                ...headers,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                status: 'completed'
            })
        });

        if (!updateOrderResponse.ok) {
            throw new Error('Failed to update order status');
        }

        // 更新用户余额
        const userResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user_id}`, {
            headers
        });

        const users = await userResponse.json();
        if (!users || users.length === 0) {
            throw new Error('User not found');
        }

        const newBalance = parseFloat(users[0].balance) + parseFloat(amount);

        const updateBalanceResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user_id}`, {
            method: 'PATCH',
            headers: {
                ...headers,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                balance: newBalance
            })
        });

        if (!updateBalanceResponse.ok) {
            throw new Error('Failed to update balance');
        }

        // 创建交易记录
        const transactionResponse = await fetch(`${supabaseUrl}/rest/v1/transactions`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                user_id,
                type: 'deposit',
                amount: amount,
                description: `Balance top-up via ${payment_method || 'manual'}`,
                reference_id: order[0].id
            })
        });

        if (!transactionResponse.ok) {
            throw new Error('Failed to create transaction record');
        }

        return new Response(JSON.stringify({
            data: {
                order: order[0],
                new_balance: newBalance,
                message: 'Payment successful'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Create order error:', error);

        const errorResponse = {
            error: {
                code: 'ORDER_CREATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
