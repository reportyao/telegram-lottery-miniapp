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
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        
        const url = new URL(req.url);
        const action = url.searchParams.get('action');
        
        const headers = {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey,
            'Content-Type': 'application/json'
        };
        
        if (req.method === 'GET') {
            if (action === 'list') {
                // 获取转售市场列表
                const response = await fetch(`${supabaseUrl}/rest/v1/resales?status=eq.active&order=created_at.desc&select=*,seller:users!resales_seller_id_fkey(id, username, full_name)`, {
                    headers
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch resale list');
                }
                
                const resales = await response.json();
                
                return new Response(
                    JSON.stringify({ success: true, data: resales }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }
            
            if (action === 'my_resales') {
                // 获取当前用户的转售列表
                const userId = url.searchParams.get('user_id');
                if (!userId) {
                    return new Response(
                        JSON.stringify({ success: false, error: 'User ID required' }),
                        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                    );
                }
                
                const response = await fetch(`${supabaseUrl}/rest/v1/resales?seller_id=eq.${userId}&order=created_at.desc`, {
                    headers
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch user resales');
                }
                
                const resales = await response.json();
                
                return new Response(
                    JSON.stringify({ success: true, data: resales }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }
        }
        
        if (req.method === 'POST') {
            const requestData = await req.json();
            
            if (action === 'create') {
                // 创建转售单
                const { participation_id, shares_to_sell, price_per_share, user_id } = requestData;
                
                // 验证参与记录
                const participationResponse = await fetch(`${supabaseUrl}/rest/v1/participations?id=eq.${participation_id}`, {
                    headers
                });
                
                if (!participationResponse.ok) {
                    throw new Error('Participation not found');
                }
                
                const participations = await participationResponse.json();
                if (!participations || participations.length === 0) {
                    throw new Error('Participation not found');
                }
                
                const participation = participations[0];
                
                // 检查是否已经创建过转售单
                const existingResponse = await fetch(`${supabaseUrl}/rest/v1/resales?participation_id=eq.${participation_id}&status=eq.active`, {
                    headers
                });
                
                const existingResales = await existingResponse.json();
                if (existingResales && existingResales.length > 0) {
                    return new Response(
                        JSON.stringify({ success: false, error: 'Already created resale for this participation' }),
                        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                    );
                }
                
                const totalAmount = shares_to_sell * price_per_share;
                
                const createResponse = await fetch(`${supabaseUrl}/rest/v1/resales`, {
                    method: 'POST',
                    headers: {
                        ...headers,
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        seller_id: user_id,
                        participation_id,
                        lottery_round_id: participation.lottery_round_id,
                        shares_to_sell,
                        price_per_share,
                        total_amount: totalAmount,
                        status: 'active'
                    })
                });
                
                if (!createResponse.ok) {
                    const errorText = await createResponse.text();
                    throw new Error(`Create resale failed: ${errorText}`);
                }
                
                const resale = await createResponse.json();
                
                return new Response(
                    JSON.stringify({ success: true, data: resale[0] }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }
            
            if (action === 'purchase') {
                // 购买转售份额
                const { resale_id, shares_to_buy, buyer_id } = requestData;
                
                // 获取转售信息
                const resaleResponse = await fetch(`${supabaseUrl}/rest/v1/resales?id=eq.${resale_id}`, {
                    headers
                });
                
                if (!resaleResponse.ok) {
                    throw new Error('Resale not found');
                }
                
                const resales = await resaleResponse.json();
                if (!resales || resales.length === 0) {
                    throw new Error('Resale not found');
                }
                
                const resale = resales[0];
                
                if (resale.status !== 'active') {
                    return new Response(
                        JSON.stringify({ success: false, error: 'Resale is not active' }),
                        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                    );
                }
                
                if (shares_to_buy > resale.shares_to_sell) {
                    return new Response(
                        JSON.stringify({ success: false, error: 'Not enough shares available' }),
                        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                    );
                }
                
                // 检查用户余额
                const userResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${buyer_id}`, {
                    headers
                });
                
                if (!userResponse.ok) {
                    throw new Error('User not found');
                }
                
                const users = await userResponse.json();
                if (!users || users.length === 0) {
                    throw new Error('User not found');
                }
                
                const user = users[0];
                const totalCost = shares_to_buy * resale.price_per_share;
                
                if (parseFloat(user.balance) < totalCost) {
                    return new Response(
                        JSON.stringify({ success: false, error: 'Insufficient balance' }),
                        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                    );
                }
                
                // 计算手续费
                const buyerFeeRate = 0.01; // 1%
                const sellerFeeRate = 0.02; // 2%
                const buyerFee = totalCost * buyerFeeRate;
                const sellerAmount = totalCost - (totalCost * sellerFeeRate);
                
                // 扣除买家余额
                const newBuyerBalance = parseFloat(user.balance) - totalCost;
                const updateBuyerResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${buyer_id}`, {
                    method: 'PATCH',
                    headers: {
                        ...headers,
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({ balance: newBuyerBalance })
                });
                
                if (!updateBuyerResponse.ok) {
                    throw new Error('Failed to update buyer balance');
                }
                
                // 获取卖家当前余额
                const sellerResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${resale.seller_id}`, {
                    headers
                });
                
                if (!sellerResponse.ok) {
                    throw new Error('Seller not found');
                }
                
                const sellers = await sellerResponse.json();
                const seller = sellers[0];
                
                // 增加卖家余额
                const newSellerBalance = parseFloat(seller.balance) + sellerAmount;
                const updateSellerResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${resale.seller_id}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({ balance: newSellerBalance })
                });
                
                if (!updateSellerResponse.ok) {
                    throw new Error('Failed to update seller balance');
                }
                
                // 创建新的参与记录
                const newParticipationResponse = await fetch(`${supabaseUrl}/rest/v1/participations`, {
                    method: 'POST',
                    headers: {
                        ...headers,
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        user_id: buyer_id,
                        lottery_round_id: resale.lottery_round_id,
                        shares_count: shares_to_buy,
                        amount_paid: totalCost,
                        is_resaleable: false
                    })
                });
                
                if (!newParticipationResponse.ok) {
                    throw new Error('Failed to create new participation');
                }
                
                const newParticipation = await newParticipationResponse.json();
                
                // 创建交易记录
                const transactionResponse = await fetch(`${supabaseUrl}/rest/v1/resale_transactions`, {
                    method: 'POST',
                    headers: {
                        ...headers,
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        resale_id,
                        buyer_id,
                        seller_id: resale.seller_id,
                        participation_id: resale.participation_id,
                        shares_count: shares_to_buy,
                        price_per_share: resale.price_per_share,
                        total_amount: totalCost,
                        buyer_fee: buyerFee,
                        transaction_fee: totalCost * sellerFeeRate,
                        status: 'completed'
                    })
                });
                
                if (!transactionResponse.ok) {
                    throw new Error('Failed to create transaction record');
                }
                
                const transaction = await transactionResponse.json();
                
                // 更新转售单状态
                const remainingShares = resale.shares_to_sell - shares_to_buy;
                const newStatus = remainingShares > 0 ? 'active' : 'sold';
                
                const updateResaleResponse = await fetch(`${supabaseUrl}/rest/v1/resales?id=eq.${resale_id}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({
                        shares_to_sell: remainingShares,
                        total_amount: remainingShares * resale.price_per_share,
                        status: newStatus,
                        updated_at: new Date().toISOString()
                    })
                });
                
                if (!updateResaleResponse.ok) {
                    throw new Error('Failed to update resale');
                }
                
                return new Response(
                    JSON.stringify({ 
                        success: true, 
                        data: { 
                            transaction_id: transaction[0].id,
                            new_participation_id: newParticipation[0].id,
                            buyer_fee: buyerFee,
                            seller_amount: sellerAmount
                        }
                    }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }
            
            if (action === 'cancel') {
                // 取消转售单
                const { resale_id, seller_id } = requestData;
                
                const cancelResponse = await fetch(`${supabaseUrl}/rest/v1/resales?id=eq.${resale_id}&seller_id=eq.${seller_id}&status=eq.active`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({ 
                        status: 'cancelled',
                        updated_at: new Date().toISOString()
                    })
                });
                
                if (!cancelResponse.ok) {
                    throw new Error('Failed to cancel resale');
                }
                
                return new Response(
                    JSON.stringify({ success: true }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }
        }
        
        return new Response(
            JSON.stringify({ success: false, error: 'Invalid action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
        
    } catch (error) {
        console.error('Resale API error:', error);
        
        const errorResponse = {
            success: false, 
            error: error.message || 'Internal server error'
        };
        
        return new Response(
            JSON.stringify(errorResponse),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});