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

        const url = new URL(req.url);
        const resource = url.searchParams.get('resource') || 'stats';
        const action = url.searchParams.get('action') || 'list';

        // 获取统计数据
        if (resource === 'stats' && action === 'dashboard') {
            const [usersRes, productsRes, roundsRes, ordersRes] = await Promise.all([
                fetch(`${supabaseUrl}/rest/v1/users?select=count`, { headers: { ...headers, 'Prefer': 'count=exact' } }),
                fetch(`${supabaseUrl}/rest/v1/products?select=count`, { headers: { ...headers, 'Prefer': 'count=exact' } }),
                fetch(`${supabaseUrl}/rest/v1/lottery_rounds?select=count`, { headers: { ...headers, 'Prefer': 'count=exact' } }),
                fetch(`${supabaseUrl}/rest/v1/orders?select=count`, { headers: { ...headers, 'Prefer': 'count=exact' } })
            ]);

            const totalUsers = parseInt(usersRes.headers.get('content-range')?.split('/')[1] || '0');
            const totalProducts = parseInt(productsRes.headers.get('content-range')?.split('/')[1] || '0');
            const totalRounds = parseInt(roundsRes.headers.get('content-range')?.split('/')[1] || '0');
            const totalOrders = parseInt(ordersRes.headers.get('content-range')?.split('/')[1] || '0');

            // 获取总收入
            const ordersDataRes = await fetch(`${supabaseUrl}/rest/v1/orders?status=eq.paid&select=total_amount`, { headers });
            const ordersData = await ordersDataRes.json();
            const totalRevenue = ordersData.reduce((sum: number, order: any) => sum + parseFloat(order.total_amount || 0), 0);

            return new Response(JSON.stringify({
                data: {
                    total_users: totalUsers,
                    total_products: totalProducts,
                    total_lottery_rounds: totalRounds,
                    total_orders: totalOrders,
                    total_revenue: totalRevenue
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 商品管理
        if (resource === 'products') {
            if (action === 'list') {
                const productsRes = await fetch(`${supabaseUrl}/rest/v1/products?order=created_at.desc&select=*`, { headers });
                const products = await productsRes.json();
                return new Response(JSON.stringify({ data: { products } }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            if (action === 'create' && req.method === 'POST') {
                const productData = await req.json();
                const createRes = await fetch(`${supabaseUrl}/rest/v1/products`, {
                    method: 'POST',
                    headers: { ...headers, 'Prefer': 'return=representation' },
                    body: JSON.stringify(productData)
                });

                if (!createRes.ok) {
                    throw new Error('Failed to create product');
                }

                const product = await createRes.json();
                return new Response(JSON.stringify({ data: { product: product[0] } }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            if (action === 'update' && req.method === 'PATCH') {
                const { id, ...updateData } = await req.json();
                const updateRes = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${id}`, {
                    method: 'PATCH',
                    headers: { ...headers, 'Prefer': 'return=representation' },
                    body: JSON.stringify(updateData)
                });

                if (!updateRes.ok) {
                    throw new Error('Failed to update product');
                }

                const product = await updateRes.json();
                return new Response(JSON.stringify({ data: { product: product[0] } }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            if (action === 'delete' && req.method === 'DELETE') {
                const { id } = await req.json();
                await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${id}`, {
                    method: 'DELETE',
                    headers
                });

                return new Response(JSON.stringify({ data: { message: 'Product deleted' } }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        }

        // 用户管理
        if (resource === 'users') {
            if (action === 'list') {
                const limit = parseInt(url.searchParams.get('limit') || '50');
                const offset = parseInt(url.searchParams.get('offset') || '0');
                
                const usersRes = await fetch(
                    `${supabaseUrl}/rest/v1/users?order=created_at.desc&limit=${limit}&offset=${offset}&select=*`,
                    { headers }
                );
                const users = await usersRes.json();
                
                return new Response(JSON.stringify({ data: { users } }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            if (action === 'update_balance' && req.method === 'PATCH') {
                const { user_id, balance } = await req.json();
                
                const updateRes = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user_id}`, {
                    method: 'PATCH',
                    headers: { ...headers, 'Prefer': 'return=representation' },
                    body: JSON.stringify({ balance })
                });

                if (!updateRes.ok) {
                    throw new Error('Failed to update balance');
                }

                const user = await updateRes.json();
                return new Response(JSON.stringify({ data: { user: user[0] } }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        }

        // 夺宝轮次管理
        if (resource === 'lottery_rounds') {
            if (action === 'list') {
                const roundsRes = await fetch(
                    `${supabaseUrl}/rest/v1/lottery_rounds?order=created_at.desc&select=*,products(*)`,
                    { headers }
                );
                const rounds = await roundsRes.json();
                
                return new Response(JSON.stringify({ data: { rounds } }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            if (action === 'create' && req.method === 'POST') {
                const roundData = await req.json();
                const createRes = await fetch(`${supabaseUrl}/rest/v1/lottery_rounds`, {
                    method: 'POST',
                    headers: { ...headers, 'Prefer': 'return=representation' },
                    body: JSON.stringify(roundData)
                });

                if (!createRes.ok) {
                    throw new Error('Failed to create lottery round');
                }

                const round = await createRes.json();
                return new Response(JSON.stringify({ data: { round: round[0] } }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            if (action === 'manual_draw' && req.method === 'POST') {
                const { round_id } = await req.json();
                
                // 调用数据库函数进行开奖
                const drawRes = await fetch(`${supabaseUrl}/rest/v1/rpc/draw_lottery`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ p_lottery_round_id: round_id })
                });

                if (!drawRes.ok) {
                    throw new Error('Failed to draw lottery');
                }

                const winner_id = await drawRes.json();
                
                return new Response(JSON.stringify({ 
                    data: { winner_id, message: 'Lottery drawn successfully' } 
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        }

        // 晒单审核
        if (resource === 'posts') {
            if (action === 'pending') {
                const postsRes = await fetch(
                    `${supabaseUrl}/rest/v1/posts?status=eq.pending&order=created_at.desc&select=*,users(*)`,
                    { headers }
                );
                const posts = await postsRes.json();
                
                return new Response(JSON.stringify({ data: { posts } }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            if (action === 'approve' && req.method === 'PATCH') {
                const { post_id } = await req.json();
                
                await fetch(`${supabaseUrl}/rest/v1/posts?id=eq.${post_id}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({ status: 'approved' })
                });

                return new Response(JSON.stringify({ data: { message: 'Post approved' } }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            if (action === 'reject' && req.method === 'PATCH') {
                const { post_id } = await req.json();
                
                await fetch(`${supabaseUrl}/rest/v1/posts?id=eq.${post_id}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({ status: 'rejected' })
                });

                return new Response(JSON.stringify({ data: { message: 'Post rejected' } }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        }

        throw new Error('Invalid resource or action');

    } catch (error) {
        console.error('Admin API error:', error);

        const errorResponse = {
            error: {
                code: 'ADMIN_API_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
