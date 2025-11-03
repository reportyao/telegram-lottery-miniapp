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
        const url = new URL(req.url);
        const category = url.searchParams.get('category');
        const status = url.searchParams.get('status') || 'active';

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

        // 构建查询
        let query = `${supabaseUrl}/rest/v1/products?status=eq.${status}`;
        if (category) {
            query += `&category=eq.${category}`;
        }
        query += '&order=created_at.desc';

        const productsResponse = await fetch(query, { headers });

        if (!productsResponse.ok) {
            throw new Error('Failed to fetch products');
        }

        const products = await productsResponse.json();

        // 为每个商品获取活跃的夺宝轮次
        const productsWithRounds = await Promise.all(products.map(async (product) => {
            const roundsQuery = `${supabaseUrl}/rest/v1/lottery_rounds?product_id=eq.${product.id}&status=in.(active,ready_to_draw)&order=created_at.desc`;
            const roundsResponse = await fetch(roundsQuery, { headers });
            
            let activeRounds = [];
            if (roundsResponse.ok) {
                activeRounds = await roundsResponse.json();
            }

            return {
                ...product,
                active_rounds: activeRounds
            };
        }));

        return new Response(JSON.stringify({
            data: {
                products: productsWithRounds,
                count: productsWithRounds.length
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get products error:', error);

        const errorResponse = {
            error: {
                code: 'GET_PRODUCTS_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
