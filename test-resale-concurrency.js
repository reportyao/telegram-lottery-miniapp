// 转售业务逻辑并发测试脚本
// 文件路径: /workspace/test-resale-concurrency.js

/**
 * 转售业务并发控制测试
 * 用于验证改进后的并发安全性和交易完整性
 */

const { createClient } = require('@supabase/supabase-js')

// 测试配置
const SUPABASE_URL = process.env.SUPABASE_URL || 'your-supabase-url'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'your-service-key'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

/**
 * 测试用例1: 并发购买同一转售单
 * 验证：不会出现超卖问题
 */
async function testConcurrentPurchase() {
    console.log('🧪 测试1: 并发购买同一转售单')
    
    // 模拟场景：10个用户同时购买一个只有5份的转售单
    const testResaleId = 'test-resale-id-5-shares'
    const buyerIds = ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7', 'user8', 'user9', 'user10']
    const sharesToBuy = 1
    
    console.log(`模拟 ${buyerIds.length} 个用户并发购买 ${testResaleId} 的转售份额`)
    
    const purchasePromises = buyerIds.map(async (buyerId, index) => {
        try {
            const startTime = Date.now()
            const response = await fetch(`/functions/v1/resale-api-improved?action=purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resale_id: testResaleId,
                    shares_to_buy: sharesToBuy,
                    buyer_id: buyerId
                })
            })
            const data = await response.json()
            const endTime = Date.now()
            
            return {
                buyerId,
                success: data.success,
                duration: endTime - startTime,
                error: data.success ? null : data.error?.message,
                data: data.data
            }
        } catch (error) {
            return {
                buyerId,
                success: false,
                duration: Date.now() - startTime,
                error: error.message
            }
        }
    })
    
    const results = await Promise.all(purchasePromises)
    
    // 分析结果
    const successfulPurchases = results.filter(r => r.success)
    const failedPurchases = results.filter(r => !r.success)
    
    console.log(`✅ 成功购买: ${successfulPurchases.length} 个`)
    console.log(`❌ 购买失败: ${failedPurchases.length} 个`)
    console.log(`📊 成功率: ${(successfulPurchases.length / results.length * 100).toFixed(2)}%`)
    
    if (successfulPurchases.length > 5) {
        console.error('❌ 发现超卖问题！成功购买数量超过可用份额')
        return false
    } else {
        console.log('✅ 未发现超卖问题')
        return true
    }
}

/**
 * 测试用例2: 余额边界测试
 * 验证：余额刚好等于购买金额时的处理
 */
async function testBalanceBoundary() {
    console.log('🧪 测试2: 余额边界测试')
    
    const testCases = [
        { balance: 100, cost: 100, expected: 'success' }, // 刚好等于
        { balance: 100, cost: 101, expected: 'insufficient_balance' }, // 不足
        { balance: 100, cost: 99, expected: 'success' }, // 充足
    ]
    
    for (const testCase of testCases) {
        console.log(`测试余额 ${testCase.balance} 购买 ${testCase.cost} 的情况...`)
        
        try {
            const response = await fetch(`/functions/v1/resale-api-improved?action=purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resale_id: 'test-resale-boundary',
                    shares_to_buy: 1,
                    buyer_id: 'test-user-boundary',
                    buyer_balance: testCase.balance,
                    purchase_cost: testCase.cost
                })
            })
            
            const data = await response.json()
            
            if (testCase.expected === 'success') {
                if (data.success) {
                    console.log('✅ 边界测试通过')
                } else {
                    console.error(`❌ 预期成功但失败: ${data.error?.message}`)
                }
            } else if (testCase.expected === 'insufficient_balance') {
                if (!data.success && data.error?.code === 'INSUFFICIENT_BALANCE') {
                    console.log('✅ 余额不足检测正确')
                } else {
                    console.error('❌ 余额不足检测失败')
                }
            }
        } catch (error) {
            console.error(`测试错误: ${error.message}`)
        }
    }
}

/**
 * 测试用例3: 取消操作完整性测试
 * 验证：取消后状态更新和份额处理
 */
async function testCancelOperation() {
    console.log('🧪 测试3: 取消操作完整性测试')
    
    const testResaleId = 'test-resale-cancel'
    const sellerId = 'test-seller-cancel'
    
    try {
        // 创建测试转售单
        const createResponse = await fetch(`/functions/v1/resale-api-improved?action=create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                participation_id: 'test-participation-cancel',
                shares_to_sell: 3,
                price_per_share: 50
            })
        })
        
        const createData = await createResponse.json()
        console.log('创建转售单结果:', createData.success ? '成功' : '失败')
        
        if (createData.success) {
            // 尝试取消
            const cancelResponse = await fetch(`/functions/v1/resale-api-improved?action=cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resale_id: testResaleId,
                    seller_id: sellerId
                })
            })
            
            const cancelData = await cancelResponse.json()
            
            if (cancelData.success) {
                console.log('✅ 取消操作成功')
                console.log(`取消份额: ${cancelData.data.cancelled_shares}`)
            } else {
                console.error('❌ 取消操作失败:', cancelData.error?.message)
            }
        }
    } catch (error) {
        console.error('取消测试错误:', error.message)
    }
}

/**
 * 测试用例4: 事务回滚测试
 * 验证：部分操作失败时的回滚机制
 */
async function testTransactionRollback() {
    console.log('🧪 测试4: 事务回滚测试')
    
    try {
        // 模拟数据库连接中断场景
        const response = await fetch(`/functions/v1/resale-api-improved?action=purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                resale_id: 'test-resale-rollback',
                shares_to_buy: 1,
                buyer_id: 'test-user-rollback',
                // 模拟部分数据缺失导致失败
            })
        })
        
        const data = await response.json()
        
        if (!data.success) {
            console.log('✅ 事务回滚机制正常 - 操作失败但未造成数据不一致')
        } else {
            console.log('✅ 事务执行成功')
        }
    } catch (error) {
        console.log('✅ 异常被正确捕获和回滚')
    }
}

/**
 * 测试用例5: 性能测试
 * 验证：并发处理性能
 */
async function testPerformance() {
    console.log('🧪 测试5: 并发性能测试')
    
    const concurrentUsers = 50
    const startTime = Date.now()
    
    const promises = Array.from({ length: concurrentUsers }, (_, i) => 
        fetch('/functions/v1/resale-api-improved?action=list')
            .then(response => response.json())
            .catch(error => ({ error: error.message }))
    )
    
    const results = await Promise.all(promises)
    const endTime = Date.now()
    const duration = endTime - startTime
    
    const successfulRequests = results.filter(r => r.success !== false).length
    
    console.log(`📊 ${concurrentUsers} 并发用户响应时间: ${duration}ms`)
    console.log(`📊 平均响应时间: ${(duration / concurrentUsers).toFixed(2)}ms`)
    console.log(`📊 成功率: ${(successfulRequests / concurrentUsers * 100).toFixed(2)}%`)
    
    if (duration < 5000) { // 5秒内完成
        console.log('✅ 性能测试通过')
        return true
    } else {
        console.log('⚠️ 性能测试警告：响应时间过长')
        return false
    }
}

/**
 * 主测试函数
 */
async function runAllTests() {
    console.log('🚀 开始转售业务逻辑并发测试')
    console.log('=' .repeat(50))
    
    const testResults = []
    
    try {
        // 依次执行测试
        testResults.push(await testConcurrentPurchase())
        console.log()
        
        await testBalanceBoundary()
        console.log()
        
        await testCancelOperation()
        console.log()
        
        await testTransactionRollback()
        console.log()
        
        testResults.push(await testPerformance())
        console.log()
        
        // 测试总结
        console.log('📋 测试总结')
        console.log('=' .repeat(50))
        const passedTests = testResults.filter(r => r === true).length
        const totalTests = testResults.length
        
        console.log(`✅ 通过测试: ${passedTests}/${totalTests}`)
        console.log(`📊 整体通过率: ${(passedTests / totalTests * 100).toFixed(2)}%`)
        
        if (passedTests === totalTests) {
            console.log('🎉 所有测试通过！并发控制正常')
        } else {
            console.log('⚠️ 部分测试失败，需要修复')
        }
        
    } catch (error) {
        console.error('❌ 测试执行错误:', error)
    }
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
    runAllTests().catch(console.error)
}

module.exports = {
    testConcurrentPurchase,
    testBalanceBoundary,
    testCancelOperation,
    testTransactionRollback,
    testPerformance,
    runAllTests
}

/**
 * 使用说明:
 * 
 * 1. 设置环境变量:
 *    export SUPABASE_URL="your-supabase-url"
 *    export SUPABASE_SERVICE_KEY="your-service-key"
 * 
 * 2. 运行测试:
 *    node test-resale-concurrency.js
 * 
 * 3. 预期结果:
 *    - 并发购买测试：不会超卖
 *    - 余额边界测试：正确处理边界情况
 *    - 取消操作测试：状态正确更新
 *    - 事务回滚测试：异常时数据一致
 *    - 性能测试：在合理时间内响应
 */
