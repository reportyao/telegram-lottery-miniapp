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
        const action = url.searchParams.get('action') || 'list';

        // 获取晒单列表
        if (req.method === 'GET' && action === 'list') {
            const status = url.searchParams.get('status') || 'approved';
            const limit = parseInt(url.searchParams.get('limit') || '20');
            
            const postsResponse = await fetch(
                `${supabaseUrl}/rest/v1/posts?status=eq.${status}&order=created_at.desc&limit=${limit}&select=*,users(*)`,
                { headers }
            );

            if (!postsResponse.ok) {
                throw new Error('Failed to fetch posts');
            }

            const posts = await postsResponse.json();

            return new Response(JSON.stringify({
                data: { posts }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 创建晒单
        if (req.method === 'POST' && action === 'create') {
            const { user_id, lottery_round_id, product_id, title, content, images } = await req.json();

            if (!user_id || !title) {
                throw new Error('User ID and title are required');
            }

            const postResponse = await fetch(`${supabaseUrl}/rest/v1/posts`, {
                method: 'POST',
                headers: {
                    ...headers,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    user_id,
                    lottery_round_id: lottery_round_id || null,
                    product_id: product_id || null,
                    title,
                    content: content || '',
                    images: images || [],
                    status: 'approved' // 演示版本自动审核通过
                })
            });

            if (!postResponse.ok) {
                throw new Error('Failed to create post');
            }

            const post = await postResponse.json();

            return new Response(JSON.stringify({
                data: { post: post[0] }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 点赞
        if (req.method === 'POST' && action === 'like') {
            const { post_id, user_id } = await req.json();

            if (!post_id || !user_id) {
                throw new Error('Post ID and User ID are required');
            }

            // 检查是否已点赞
            const checkResponse = await fetch(
                `${supabaseUrl}/rest/v1/post_likes?post_id=eq.${post_id}&user_id=eq.${user_id}`,
                { headers }
            );

            const existing = await checkResponse.json();

            if (existing && existing.length > 0) {
                // 取消点赞
                const deleteResponse = await fetch(
                    `${supabaseUrl}/rest/v1/post_likes?id=eq.${existing[0].id}`,
                    { method: 'DELETE', headers }
                );

                return new Response(JSON.stringify({
                    data: { action: 'unliked' }
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            } else {
                // 添加点赞
                const likeResponse = await fetch(`${supabaseUrl}/rest/v1/post_likes`, {
                    method: 'POST',
                    headers: {
                        ...headers,
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({ post_id, user_id })
                });

                if (!likeResponse.ok) {
                    throw new Error('Failed to like post');
                }

                return new Response(JSON.stringify({
                    data: { action: 'liked' }
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        }

        // 评论
        if (req.method === 'POST' && action === 'comment') {
            const { post_id, user_id, content } = await req.json();

            if (!post_id || !user_id || !content) {
                throw new Error('Post ID, User ID and content are required');
            }

            const commentResponse = await fetch(`${supabaseUrl}/rest/v1/post_comments`, {
                method: 'POST',
                headers: {
                    ...headers,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({ post_id, user_id, content })
            });

            if (!commentResponse.ok) {
                throw new Error('Failed to create comment');
            }

            const comment = await commentResponse.json();

            return new Response(JSON.stringify({
                data: { comment: comment[0] }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 获取评论列表
        if (req.method === 'GET' && action === 'comments') {
            const post_id = url.searchParams.get('post_id');

            if (!post_id) {
                throw new Error('Post ID is required');
            }

            const commentsResponse = await fetch(
                `${supabaseUrl}/rest/v1/post_comments?post_id=eq.${post_id}&order=created_at.desc&select=*,users(*)`,
                { headers }
            );

            if (!commentsResponse.ok) {
                throw new Error('Failed to fetch comments');
            }

            const comments = await commentsResponse.json();

            return new Response(JSON.stringify({
                data: { comments }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        throw new Error('Invalid action');

    } catch (error) {
        console.error('Posts manage error:', error);

        const errorResponse = {
            error: {
                code: 'POSTS_OPERATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
