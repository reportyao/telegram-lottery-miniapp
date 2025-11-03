// 测试管理后台功能
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your_anon_key'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAdminFunctionality() {
    console.log('🔧 测试管理后台功能...')
    
    try {
        // 1. 测试管理员权限检查
        console.log('1. 测试管理员权限检查...')
        const { data: admins, error: adminError } = await supabase
            .from('admins')
            .select('*')
        
        if (adminError) {
            console.error('❌ 管理员权限检查失败:', adminError)
            return false
        }
        console.log(`✅ 管理员数据: ${admins?.length || 0} 个管理员`)
        
        // 2. 测试产品数据加载
        console.log('2. 测试产品数据加载...')
        const { data: products, error: productError } = await supabase
            .from('products')
            .select('id, name_zh, name_en, market_price, status')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
        
        if (productError) {
            console.error('❌ 产品数据加载失败:', productError)
            return false
        }
        console.log(`✅ 活跃产品: ${products?.length || 0} 个`)
        
        // 3. 测试参与记录查询
        console.log('3. 测试参与记录查询...')
        const { data: participations, error: participationError } = await supabase
            .from('participations')
            .select('id, user_id, lottery_round_id, shares_count, amount_paid, is_resaleable')
            .limit(5)
        
        if (participationError) {
            console.error('❌ 参与记录查询失败:', participationError)
            return false
        }
        console.log(`✅ 参与记录: ${participations?.length || 0} 条`)
        
        // 4. 测试多语言字段访问
        console.log('4. 测试多语言字段访问...')
        if (products && products.length > 0) {
            const product = products[0]
            const displayName = product.name_zh || product.name_en || 'Unknown Product'
            console.log(`✅ 产品显示名: ${displayName}`)
            console.log(`✅ 市场价格: ${product.market_price}`)
        }
        
        // 5. 测试所有关键字段存在性
        console.log('5. 验证关键字段存在性...')
        const { data: schema, error: schemaError } = await supabase
            .from('information_schema.columns')
            .select('column_name')
            .eq('table_name', 'participations')
        
        if (schemaError) {
            console.error('❌ 字段验证失败:', schemaError)
            return false
        }
        
        const requiredFields = ['amount_paid', 'is_resaleable']
        const hasAllFields = requiredFields.every(field => 
            schema?.some(col => col.column_name === field)
        )
        
        if (hasAllFields) {
            console.log('✅ 所有必需字段存在')
        } else {
            console.error('❌ 缺少必需字段')
            return false
        }
        
        console.log('\n🎉 管理后台功能测试全部通过！')
        return true
        
    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error)
        return false
    }
}

// 运行测试
testAdminFunctionality().then(success => {
    if (success) {
        console.log('\n✅ 管理后台现在可以正常打开和操作！')
    } else {
        console.log('\n❌ 管理后台仍有问题需要解决')
    }
})