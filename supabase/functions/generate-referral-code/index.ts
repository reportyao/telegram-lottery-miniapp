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

    try {
        const requestData = await req.json();
        const { telegram_id, user_id } = requestData;

        if (!telegram_id && !user_id) {
            return new Response(JSON.stringify({ 
                error: { 
                    code: 'INVALID_INPUT', 
                    message: 'telegram_id 或 user_id 是必需的' 
                } 
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            return new Response(JSON.stringify({ 
                error: { 
                    code: 'CONFIGURATION_ERROR', 
                    message: 'Supabase 配置错误' 
                } 
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 获取所有现有的推荐码
        const existingCodesResponse = await fetch(`${supabaseUrl}/rest/v1/users?select=referral_code&referral_code=not.is.null`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!existingCodesResponse.ok) {
            throw new Error('Failed to fetch existing referral codes');
        }

        const existingData = await existingCodesResponse.json();
        const existingCodes = existingData.map((user: any) => user.referral_code).filter((code: string) => code);

        // 生成唯一推荐码
        let referralCode = generateUniqueReferralCode(existingCodes, telegram_id);

        // 如果已存在用户，检查是否已有推荐码
        let updateQuery = '';
        if (user_id) {
            updateQuery = `id=eq.${user_id}`;
        } else {
            updateQuery = `telegram_id=eq.${telegram_id}`;
        }

        // 更新用户的推荐码
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/users?${updateQuery}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ referral_code: referralCode })
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to update user referral code');
        }

        const updatedUser = await updateResponse.json();

        return new Response(JSON.stringify({ 
            data: { 
                referral_code: referralCode,
                user: updatedUser[0] || null
            } 
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error generating referral code:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'REFERRAL_CODE_ERROR',
                message: error.message || '生成推荐码时发生错误'
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

/**
 * 生成随机推荐码
 */
function generateReferralCode(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * 生成用户唯一推荐码
 */
function generateUniqueReferralCode(existingCodes: string[] = [], telegramId?: number): string {
    let code: string;
    let attempts = 0;
    const maxAttempts = 100;

    do {
        // 基于telegram ID生成一部分代码，确保一致性
        const baseCode = telegramId ? telegramId.toString(36).toUpperCase().slice(-4) : '';
        const randomPart = generateReferralCode(8 - baseCode.length);
        code = baseCode + randomPart;
        attempts++;
    } while (existingCodes.includes(code) && attempts < maxAttempts);

    // 如果仍然冲突，使用完全随机码
    if (existingCodes.includes(code)) {
        do {
            code = generateReferralCode(8);
        } while (existingCodes.includes(code) && attempts < maxAttempts * 2);
    }

    return code;
}
