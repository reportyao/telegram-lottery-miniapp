Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
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
        const { user_id, lottery_round_id, shares_count } = await req.json();

        if (!user_id || !lottery_round_id || !shares_count) {
            throw new Error('Missing required parameters');
        }

        if (shares_count < 1) {
            throw new Error('Shares count must be at least 1');
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

        // 获取夺宝轮次信息
        const roundResponse = await fetch(`${supabaseUrl}/rest/v1/lottery_rounds?id=eq.${lottery_round_id}`, {
            headers
        });

        const rounds = await roundResponse.json();
        if (!rounds || rounds.length === 0) {
            throw new Error('Lottery round not found');
        }

        const round = rounds[0];

        if (round.status !== 'active') {
            throw new Error('Lottery round is not active');
        }

        const availableShares = round.total_shares - round.sold_shares;
        if (shares_count > availableShares) {
            throw new Error(`Only ${availableShares} shares available`);
        }

        const totalAmount = shares_count * parseFloat(round.price_per_share);

        // 获取用户余额
        const userResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user_id}`, {
            headers
        });

        const users = await userResponse.json();
        if (!users || users.length === 0) {
            throw new Error('User not found');
        }

        const user = users[0];
        if (parseFloat(user.balance) < totalAmount) {
            throw new Error('Insufficient balance');
        }

        // 扣除余额
        const newBalance = parseFloat(user.balance) - totalAmount;
        const updateBalanceResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user_id}`, {
            method: 'PATCH',
            headers: {
                ...headers,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ balance: newBalance })
        });

        if (!updateBalanceResponse.ok) {
            throw new Error('Failed to update balance');
        }

        // 创建交易记录
        const transactionResponse = await fetch(`${supabaseUrl}/rest/v1/transactions`, {
            method: 'POST',
            headers: {
                ...headers,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                user_id,
                type: 'participate_lottery',
                amount: -totalAmount,
                description: `Participated in lottery round ${lottery_round_id}`,
                reference_id: lottery_round_id
            })
        });

        if (!transactionResponse.ok) {
            throw new Error('Failed to create transaction record');
        }

        // 创建参与记录
        const participationResponse = await fetch(`${supabaseUrl}/rest/v1/participations`, {
            method: 'POST',
            headers: {
                ...headers,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                user_id,
                lottery_round_id,
                shares_count,
                amount_paid: totalAmount
            })
        });

        if (!participationResponse.ok) {
            throw new Error('Failed to create participation record');
        }

        const participation = await participationResponse.json();

        // 更新夺宝轮次的已售份数
        const newSoldShares = round.sold_shares + shares_count;
        const updateRoundResponse = await fetch(`${supabaseUrl}/rest/v1/lottery_rounds?id=eq.${lottery_round_id}`, {
            method: 'PATCH',
            headers: {
                ...headers,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                sold_shares: newSoldShares,
                status: newSoldShares >= round.total_shares ? 'ready_to_draw' : 'active'
            })
        });

        if (!updateRoundResponse.ok) {
            throw new Error('Failed to update lottery round');
        }

        const updatedRound = await updateRoundResponse.json();

        return new Response(JSON.stringify({
            data: {
                participation: participation[0],
                new_balance: newBalance,
                lottery_round: updatedRound[0]
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Participate lottery error:', error);

        const errorResponse = {
            error: {
                code: 'PARTICIPATE_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
