import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🚀 健康检查API被调用');
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'API服务正常运行',
    port: '3000',
    version: '1.0.0'
  }, { status: 200 });
}
