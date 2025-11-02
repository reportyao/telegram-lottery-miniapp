Deno.serve(async (req) => {
    // 严格CORS配置，限制允许的域名
    const allowedOrigins = [
        'https://your-domain.vercel.app',
        'https://localhost:3000',
        'https://127.0.0.1:3000'
    ];
    
    const origin = req.headers.get('origin');
    const corsHeaders = {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : 'null',
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
        // 输入验证
        if (!req.headers.get('content-type')?.includes('application/json')) {
            return new Response(JSON.stringify({ 
                error: { code: 'INVALID_CONTENT_TYPE', message: 'Content-Type must be application/json' }
            }), {
                status: 400, 
                headers: corsHeaders 
            });
        }

        const { telegram_id, username, full_name, language } = await req.json();

        // 严格的输入验证
        if (!telegram_id) {
            return new Response(JSON.stringify({ 
                error: { code: 'MISSING_TELEGRAM_ID', message: 'Telegram ID is required' }
            }), {
                status: 400, 
                headers: corsHeaders 
            });
        }

        // 验证telegram_id格式（应该是数字）
        if (typeof telegram_id !== 'number' && (!telegram_id.toString().match(/^\d+$/))) {
            return new Response(JSON.stringify({ 
                error: { code: 'INVALID_TELEGRAM_ID', message: 'Invalid Telegram ID format' }
            }), {
                status: 400, 
                headers: corsHeaders 
            });
        }

        // 限制输入长度
        if (username && username.length > 50) {
            return new Response(JSON.stringify({ 
                error: { code: 'USERNAME_TOO_LONG', message: 'Username exceeds maximum length' }
            }), {
                status: 400, 
                headers: corsHeaders 
            });
        }

        if (full_name && full_name.length > 100) {
            return new Response(JSON.stringify({ 
                error: { code: 'FULL_NAME_TOO_LONG', message: 'Full name exceeds maximum length' }
            }), {
                status: 400, 
                headers: corsHeaders 
            });
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        // 检查用户是否已存在
        const checkResponse = await fetch(`${supabaseUrl}/rest/v1/users?telegram_id=eq.${telegram_id}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        const existingUsers = await checkResponse.json();

        let userData;

        if (existingUsers && existingUsers.length > 0) {
            // 用户已存在，更新信息
            const updateResponse = await fetch(`${supabaseUrl}/rest/v1/users?telegram_id=eq.${telegram_id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    username: username || null,
                    full_name: full_name || null,
                    language: language || 'en',
                    updated_at: new Date().toISOString()
                })
            });

            if (!updateResponse.ok) {
                const errorText = await updateResponse.text();
                throw new Error(`Update user failed: ${errorText}`);
            }

            const updatedData = await updateResponse.json();
            userData = updatedData[0];
        } else {
            // 创建新用户
            const insertResponse = await fetch(`${supabaseUrl}/rest/v1/users`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    telegram_id,
                    username: username || null,
                    full_name: full_name || null,
                    language: language || 'en',
                    balance: 0
                })
            });

            if (!insertResponse.ok) {
                const errorText = await insertResponse.text();
                throw new Error(`Create user failed: ${errorText}`);
            }

            const insertedData = await insertResponse.json();
            userData = insertedData[0];
        }

        return new Response(JSON.stringify({
            data: {
                user: userData,
                is_new: existingUsers.length === 0
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Telegram auth error:', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url
        });

        // 根据错误类型返回不同的状态码
        let statusCode = 500;
        let errorCode = 'INTERNAL_ERROR';

        if (error.message.includes('required') || 
            error.message.includes('Invalid') || 
            error.message.includes('format') ||
            error.message.includes('length')) {
            statusCode = 400;
            errorCode = 'VALIDATION_ERROR';
        } else if (error.message.includes('network') || 
                  error.message.includes('timeout')) {
            statusCode = 503;
            errorCode = 'SERVICE_UNAVAILABLE';
        }

        const errorResponse = {
            error: {
                code: errorCode,
                message: statusCode === 500 ? 'Authentication service temporarily unavailable' : error.message,
                timestamp: new Date().toISOString()
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: statusCode,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
