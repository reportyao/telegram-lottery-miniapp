// 简化的转售API

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: { 
            code: 'CONFIG_ERROR',
            message: 'Service configuration error'
          } 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const url = new URL(req.url)
    const action = url.searchParams.get('action')
    
    // GET 操作处理
    if (req.method === 'GET') {
      if (action === 'market') {
        // 获取转售市场数据 - 使用原生fetch
        const response = await fetch(`${supabaseUrl}/rest/v1/resales?status=eq.active&select=id,shares_to_sell,price_per_share,total_amount,status,created_at,seller_id,participation_id,lottery_round_id&order=created_at.desc`, {
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey,
          }
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          console.error('Market fetch error:', data)
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to fetch market data' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      if (action === 'list') {
        // 获取转售单列表 - 使用原生fetch
        const response = await fetch(`${supabaseUrl}/rest/v1/resales?status=eq.active&select=id,shares_to_sell,price_per_share,total_amount,status,created_at,seller_id,participation_id,lottery_round_id&order=created_at.desc`, {
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey,
          }
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          console.error('List fetch error:', data)
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to fetch list data' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }
    
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Resale API error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: { 
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Internal server error'
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
