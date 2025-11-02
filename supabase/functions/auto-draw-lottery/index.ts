Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
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

        // 获取所有ready_to_draw状态的夺宝轮次
        const roundsResponse = await fetch(
            `${supabaseUrl}/rest/v1/lottery_rounds?status=eq.ready_to_draw&select=*`,
            { headers }
        );

        if (!roundsResponse.ok) {
            throw new Error('Failed to fetch lottery rounds');
        }

        const rounds = await roundsResponse.json();
        const results = [];

        for (const round of rounds) {
            try {
                // 获取该轮次的所有参与记录
                const participationsResponse = await fetch(
                    `${supabaseUrl}/rest/v1/participations?lottery_round_id=eq.${round.id}&select=*`,
                    { headers }
                );

                if (!participationsResponse.ok) {
                    console.error(`Failed to fetch participations for round ${round.id}`);
                    continue;
                }

                const participations = await participationsResponse.json();

                if (participations.length === 0) {
                    console.error(`No participations found for round ${round.id}`);
                    continue;
                }

                // 随机选择中奖者
                const randomIndex = Math.floor(Math.random() * participations.length);
                const winner = participations[randomIndex];

                // 更新夺宝轮次
                const updateRoundResponse = await fetch(
                    `${supabaseUrl}/rest/v1/lottery_rounds?id=eq.${round.id}`,
                    {
                        method: 'PATCH',
                        headers: {
                            ...headers,
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify({
                            winner_id: winner.user_id,
                            status: 'completed',
                            draw_date: new Date().toISOString()
                        })
                    }
                );

                if (!updateRoundResponse.ok) {
                    console.error(`Failed to update round ${round.id}`);
                    continue;
                }

                // 获取当前商品库存
                const productResponse = await fetch(
                    `${supabaseUrl}/rest/v1/products?id=eq.${round.product_id}&select=stock`,
                    { headers }
                );

                if (!productResponse.ok) {
                    console.error(`Failed to fetch product ${round.product_id}`);
                    continue;
                }

                const products = await productResponse.json();
                if (!products || products.length === 0) {
                    console.error(`Product ${round.product_id} not found`);
                    continue;
                }

                const currentStock = parseInt(products[0].stock) || 0;
                const newStock = currentStock - 1;

                // 减少商品库存
                const updateProductResponse = await fetch(
                    `${supabaseUrl}/rest/v1/products?id=eq.${round.product_id}`,
                    {
                        method: 'PATCH',
                        headers,
                        body: JSON.stringify({
                            stock: newStock
                        })
                    }
                );

                // 创建中奖通知交易记录
                await fetch(`${supabaseUrl}/rest/v1/transactions`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        user_id: winner.user_id,
                        type: 'lottery_win',
                        amount: 0,
                        description: `Won lottery round ${round.id}`,
                        reference_id: round.id
                    })
                });

                results.push({
                    round_id: round.id,
                    winner_id: winner.user_id,
                    status: 'success'
                });

            } catch (error) {
                console.error(`Error processing round ${round.id}:`, error);
                results.push({
                    round_id: round.id,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        return new Response(JSON.stringify({
            data: {
                processed: rounds.length,
                results: results,
                message: `Processed ${rounds.length} lottery rounds`
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Auto draw lottery error:', error);

        const errorResponse = {
            error: {
                code: 'AUTO_DRAW_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
