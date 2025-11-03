#!/usr/bin/env node

/**
 * Edge Functions 自动化检查脚本
 * 检查常见的代码问题和最佳实践违反
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const ISSUES = {
    EXTERNAL_IMPORTS: {
        pattern: /import\s+.*\s+from\s+['"]https?:\/\//,
        severity: 'error',
        message: '外部导入违规 - Deno Edge Functions不支持外部导入'
    },
    UNDEFINED_LOGGER: {
        pattern: /logger\.(error|warn|info|debug)/,
        severity: 'error',
        message: '未定义logger变量 - 应使用console替代'
    },
    CORS_WILDCARD: {
        pattern: /['"]Access-Control-Allow-Origin['"]\s*:\s*['"]\*['"]/,
        severity: 'warning',
        message: 'CORS配置过于宽松 - 建议限制特定域名'
    },
    ANY_TYPE_USAGE: {
        pattern: /:\s*any\b/,
        severity: 'warning',
        message: '使用any类型 - 建议定义具体类型'
    },
    CONSOLE_LOG_IN_PRODUCTION: {
        pattern: /console\.log\(/,
        severity: 'info',
        message: '生产环境包含调试代码 - 建议移除或使用条件编译'
    },
    MISSING_INPUT_VALIDATION: {
        pattern: /await\s+req\.json\(\)/,
        severity: 'warning',
        message: '缺少输入验证 - 建议添加参数验证'
    },
    THROW_ERROR_WITHOUT_CHECK: {
        pattern: /throw\s+new\s+Error\(['"].*['"]\)/,
        severity: 'info',
        message: '错误处理建议改进 - 考虑使用自定义错误类'
    }
};

async function scanDirectory(dirPath) {
    const files = [];
    const entries = await readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
        if (entry.isDirectory()) {
            const subDir = join(dirPath, entry.name);
            files.push(...await scanDirectory(subDir));
        } else if (entry.name === 'index.ts' && entry.isFile()) {
            files.push(join(dirPath, entry.name));
        }
    }
    
    return files;
}

async function analyzeFile(filePath) {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const issues = [];
    
    for (const [lineNum, line] of lines.entries()) {
        for (const [issueType, config] of Object.entries(ISSUES)) {
            if (config.pattern.test(line)) {
                issues.push({
                    type: issueType,
                    severity: config.severity,
                    message: config.message,
                    file: filePath,
                    line: lineNum + 1,
                    code: line.trim()
                });
            }
        }
    }
    
    return issues;
}

function formatIssue(issue) {
    const color = {
        error: '\x1b[31m', // 红
        warning: '\x1b[33m', // 黄
        info: '\x1b[36m' // 青
    }[issue.severity] || '\x1b[0m';
    
    const reset = '\x1b[0m';
    
    return `${color}[${issue.severity.toUpperCase()}]${reset} ${issue.file}:${issue.line}\n` +
           `  ${issue.message}\n` +
           `  代码: ${issue.code}\n`;
}

async function main() {
    const functionsDir = '/workspace/supabase/functions';
    
    try {
        console.log('🔍 开始检查 Edge Functions...\n');
        
        const files = await scanDirectory(functionsDir);
        console.log(`📁 找到 ${files.length} 个 Edge Functions\n`);
        
        const allIssues = [];
        
        for (const file of files) {
            const issues = await analyzeFile(file);
            allIssues.push(...issues);
        }
        
        // 统计问题
        const issueCount = {
            error: allIssues.filter(i => i.severity === 'error').length,
            warning: allIssues.filter(i => i.severity === 'warning').length,
            info: allIssues.filter(i => i.severity === 'info').length
        };
        
        console.log('📊 问题统计:');
        console.log(`   严重错误: ${issueCount.error}`);
        console.log(`   警告: ${issueCount.warning}`);
        console.log(`   建议: ${issueCount.info}`);
        console.log(`   总计: ${allIssues.length}\n`);
        
        if (allIssues.length > 0) {
            console.log('⚠️  发现的问题:\n');
            
            // 按严重程度排序显示
            const sortedIssues = allIssues.sort((a, b) => {
                const order = { error: 0, warning: 1, info: 2 };
                return order[a.severity] - order[b.severity];
            });
            
            for (const issue of sortedIssues) {
                console.log(formatIssue(issue));
            }
            
            // 给出修复建议
            console.log('\n💡 修复建议:');
            
            if (issueCount.error > 0) {
                console.log('  🚨 严重错误需要立即修复!');
                console.log('     - 外部导入违规可能导致部署失败');
                console.log('     - 未定义变量会导致运行时错误');
            }
            
            if (issueCount.warning > 0) {
                console.log('  ⚠️  警告需要尽快修复');
                console.log('     - CORS配置需要限制域名');
                console.log('     - 类型安全问题需要改进');
            }
            
            console.log('\n📝 详细报告请查看:');
            console.log('   - /workspace/edge_functions_audit_report.md');
            console.log('   - /workspace/edge_functions_fix_checklist.md');
            
        } else {
            console.log('✅ 未发现问题，代码质量良好!');
        }
        
    } catch (error) {
        console.error('❌ 检查过程中发生错误:', error.message);
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}