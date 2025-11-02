import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  console.log('🚀 商品列表API被调用');
  
  try {
    // 从请求中获取参数
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'active';

    // 调用Supabase Edge Function获取产品
    const { data, error } = await supabase.functions.invoke('get-products', {
      headers: {
        'X-Client-Info': 'telegram-lottery-miniapp',
        'X-Request-ID': Date.now().toString(),
      },
      body: { category, status }
    });

    if (error) {
      console.error('Supabase Edge Function错误:', error);
      return NextResponse.json({
        success: false,
        error: {
          code: 'SUPABASE_ERROR',
          message: error.message || '获取产品列表失败'
        },
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    const products = data?.data?.products || [];
    
    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
      message: '商品列表获取成功',
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('API错误:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || '服务器内部错误'
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
