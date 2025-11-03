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

        console.log('Participate lottery request:', { user_id, lottery_round_id, shares_count });

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
        console.log('Fetching lottery round:', lottery_round_id);
        const roundResponse = await fetch(`${supabaseUrl}/rest/v1/lottery_rounds?id=eq.${lottery_round_id}`, {
            headers
        });

        if (!roundResponse.ok) {
            throw new Error(`Failed to fetch lottery round: ${roundResponse.status}`);
        }

        const rounds = await roundResponse.json();
        if (!rounds || rounds.length === 0) {
            throw new Error('Lottery round not found');
        }

        const round = rounds[0];
        console.log('Lottery round found:', { id: round.id, status: round.status, total_shares: round.total_shares, sold_shares: round.sold_shares });

        if (round.status !== 'active') {
            throw new Error('Lottery round is not active');
        }

        const availableShares = round.total_shares - round.sold_shares;
        if (shares_count > availableShares) {
            throw new Error(`Only ${availableShares} shares available`);
        }

        const totalAmount = shares_count * parseFloat(round.price_per_share);
        console.log('Total amount to pay:', totalAmount);

        // 获取用户信息 - 明确指定public schema
        console.log('Fetching user:', user_id);
        const userResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user_id}`, {
            headers: {
                ...headers,
                'Accept-Profile': 'public'
            }
        });

        if (!userResponse.ok) {
            throw new Error(`Failed to fetch user: ${userResponse.status}`);
        }

        const users = await userResponse.json();
        console.log('User response:', users);
        
        if (!users || users.length === 0) {
            throw new Error('User not found');
        }

        const user = users[0];
        console.log('User found:', { id: user.id, balance: user.balance });

        if (parseFloat(user.balance) < totalAmount) {
            throw new Error('Insufficient balance');
        }

        // 扣除余额
        const newBalance = parseFloat(user.balance) - totalAmount;
        console.log('Updating balance to:', newBalance);
        
        const updateBalanceResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user_id}`, {
            method: 'PATCH',
            headers: {
                ...headers,
                'Accept-Profile': 'public',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ balance: newBalance })
        });

        if (!updateBalanceResponse.ok) {
            const errorText = await updateBalanceResponse.text();
            console.error('Balance update failed:', errorText);
            throw new Error('Failed to update balance');
        }

        // 创建交易记录
        console.log('Creating transaction record');
        const transactionResponse = await fetch(`${supabaseUrl}/rest/v1/transactions`, {
            method: 'POST',
            headers: {
                ...headers,
                'Accept-Profile': 'public',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                user_id,
                type: 'purchase',
                amount: -totalAmount,
                description: `Participated in lottery round ${lottery_round_id}`,
                reference_id: lottery_round_id
            })
        });

        if (!transactionResponse.ok) {
            const errorText = await transactionResponse.text();
            console.error('Transaction creation failed:', errorText);
            throw new Error('Failed to create transaction record');
        }

        // 创建参与记录
        console.log('Creating participation record');
        const participationData = {
            user_id,
            lottery_round_id,
            shares_count,
            amount_paid: totalAmount
        };
        console.log('Participation data:', participationData);
        
        const participationResponse = await fetch(`${supabaseUrl}/rest/v1/participations`, {
            method: 'POST',
            headers: {
                ...headers,
                'Accept-Profile': 'public',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(participationData)
        });

        const participationResponseText = await participationResponse.text();
        console.log('Participation response:', participationResponse.status, participationResponseText);

        if (!participationResponse.ok) {
            console.error('Participation creation failed:', participationResponseText);
            throw new Error(`Failed to create participation record: ${participationResponseText}`);
        }

        let participation;
        try {
            participation = JSON.parse(participationResponseText);
        } catch (e) {
            console.error('Failed to parse participation response:', e);
            throw new Error('Invalid participation response format');
        }

        // 更新夺宝轮次的已售份数
        const newSoldShares = round.sold_shares + shares_count;
        console.log('Updating lottery round sold shares to:', newSoldShares);
        
        const updateRoundResponse = await fetch(`${supabaseUrl}/rest/v1/lottery_rounds?id=eq.${lottery_round_id}`, {
            method: 'PATCH',
            headers: {
                ...headers,
                'Accept-Profile': 'public',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                sold_shares: newSoldShares,
                status: newSoldShares >= round.total_shares ? 'ready_to_draw' : 'active'
            })
        });

        if (!updateRoundResponse.ok) {
            const errorText = await updateRoundResponse.text();
            console.error('Round update failed:', errorText);
            throw new Error('Failed to update lottery round');
        }

        const updatedRound = await updateRoundResponse.json();

        console.log('Participation successful');
        
        return new Response(JSON.stringify({
            data: {
                participation: Array.isArray(participation) ? participation[0] : participation,
                new_balance: newBalance,
                lottery_round: Array.isArray(updatedRound) ? updatedRound[0] : updatedRound
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