import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🚀 商品列表API被调用');
  const products = [
    { 
      id: '1', 
      title: 'iPhone 15 Pro Max', 
      price: 9999, 
      description: '最新款苹果手机',
      image: '/api/placeholder/300/200'
    },
    { 
      id: '2', 
      title: 'MacBook Air M3', 
      price: 8999, 
      description: '轻薄便携笔记本',
      image: '/api/placeholder/300/200'
    },
    { 
      id: '3', 
      title: 'AirPods Pro 3', 
      price: 1899, 
      description: '主动降噪无线耳机',
      image: '/api/placeholder/300/200'
    }
  ];
  
  return NextResponse.json({
    success: true,
    data: products,
    message: '商品列表获取成功',
    count: products.length,
    timestamp: new Date().toISOString()
  }, { status: 200 });
}
