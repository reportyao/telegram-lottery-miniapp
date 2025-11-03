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
        const url = new URL(req.url);
        const userId = url.searchParams.get('user_id');
        const telegramId = url.searchParams.get('telegram_id');

        if (!userId && !telegramId) {
            throw new Error('User ID or Telegram ID is required');
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

        // 获取用户信息
        let userQuery = `${supabaseUrl}/rest/v1/users?`;
        if (userId) {
            userQuery += `id=eq.${userId}`;
        } else {
            userQuery += `telegram_id=eq.${telegramId}`;
        }

        const userResponse = await fetch(userQuery, { headers });

        if (!userResponse.ok) {
            throw new Error('Failed to fetch user');
        }

        const users = await userResponse.json();

        if (!users || users.length === 0) {
            throw new Error('User not found');
        }

        const user = users[0];

        // 获取用户的参与记录统计
        const participationsQuery = `${supabaseUrl}/rest/v1/participations?user_id=eq.${user.id}&select=*`;
        const participationsResponse = await fetch(participationsQuery, { headers });

        let participations = [];
        if (participationsResponse.ok) {
            participations = await participationsResponse.json();
        }

        // 获取用户赢得的夺宝
        const winsQuery = `${supabaseUrl}/rest/v1/lottery_rounds?winner_id=eq.${user.id}&status=eq.completed&select=*`;
        const winsResponse = await fetch(winsQuery, { headers });

        let wins = [];
        if (winsResponse.ok) {
            wins = await winsResponse.json();
        }

        // 获取用户的推荐统计
        const referralsQuery = `${supabaseUrl}/rest/v1/referrals?referrer_id=eq.${user.id}&select=*`;
        const referralsResponse = await fetch(referralsQuery, { headers });

        let referrals = [];
        if (referralsResponse.ok) {
            referrals = await referralsResponse.json();
        }

        // 计算总消费
        const totalSpent = participations.reduce((sum, p) => sum + parseFloat(p.amount_paid || 0), 0);

        // 计算推荐奖励总额
        const totalReferralRewards = referrals.reduce((sum, r) => sum + parseFloat(r.reward_amount || 0), 0);

        return new Response(JSON.stringify({
            data: {
                user,
                stats: {
                    total_participations: participations.length,
                    total_wins: wins.length,
                    total_spent: totalSpent,
                    total_referrals: referrals.length,
                    total_referral_rewards: totalReferralRewards
                },
                recent_participations: participations.slice(0, 5),
                wins: wins
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get user profile error:', error);

        const errorResponse = {
            error: {
                code: 'GET_PROFILE_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
