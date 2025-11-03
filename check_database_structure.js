import { createClient } from '@supabase/supabase-js'

// 使用环境变量（如果存在）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your_anon_key'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabaseStructure() {
    try {
        console.log('检查数据库连接...')
        
        // 检查participations表结构
        const { data: participations, error: participationError } = await supabase
            .from('participations')
            .select('*')
            .limit(1)
        
        if (participationError) {
            console.error('获取participations表数据失败:', participationError)
            return
        }
        
        console.log('participations表结构检查成功')
        
        // 检查表结构信息
        const { data: tableInfo, error: tableError } = await supabase
            .rpc('get_table_columns', { table_name: 'participations' })
        
        if (tableError) {
            console.log('无法获取表结构信息，使用备用方法...')
            // 如果RPC不可用，尝试查询information_schema
            const { data: schemaData, error: schemaError } = await supabase
                .from('information_schema.columns')
                .select('column_name, data_type')
                .eq('table_name', 'participations')
                .eq('table_schema', 'public')
            
            if (schemaError) {
                console.error('获取表结构失败:', schemaError)
                return
            }
            
            console.log('participations表字段:', schemaData)
            const hasAmountPaid = schemaData?.some(col => col.column_name === 'amount_paid')
            console.log(`amount_paid字段存在: ${hasAmountPaid}`)
        } else {
            console.log('participations表字段:', tableInfo)
            const hasAmountPaid = tableInfo?.some(col => col.column_name === 'amount_paid')
            console.log(`amount_paid字段存在: ${hasAmountPaid}`)
        }
        
    } catch (error) {
        console.error('数据库检查失败:', error)
    }
}

checkDatabaseStructure()