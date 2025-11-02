const fs = require('fs');
const path = require('path');

// 检查的文件列表
const files = [
  '/workspace/telegram-lottery-miniapp/hooks/useTelegram.ts',
  '/workspace/telegram-lottery-miniapp/lib/performance.ts',
  '/workspace/telegram-lottery-miniapp/lib/supabase.ts',
  '/workspace/telegram-lottery-miniapp/lib/telegram.ts',
  '/workspace/telegram-lottery-miniapp/lib/utils.ts'
];

console.log('=== 文件完整性验证 ===\n');

let allValid = true;

files.forEach(file => {
  try {
    // 检查文件是否存在
    if (!fs.existsSync(file)) {
      console.log(`❌ 文件不存在: ${file}`);
      allValid = false;
      return;
    }

    // 读取文件内容
    const content = fs.readFileSync(file, 'utf8');
    const stats = fs.statSync(file);

    // 基本结构检查
    const lines = content.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim() !== '').length;
    
    // 检查常见的TypeScript/JavaScript问题
    const hasSyntaxErrors = [
      // 检查未闭合的大括号
      (content.match(/\{/g) || []).length !== (content.match(/\}/g) || []).length,
      // 检查未闭合的圆括号
      (content.match(/\(/g) || []).length !== (content.match(/\)/g) || []).length,
      // 检查未闭合的方括号
      (content.match(/\[/g) || []).length !== (content.match(/\]/g) || []).length,
      // 检查未闭合的字符串
      (content.match(/"/g) || []).length % 2 !== 0,
      (content.match(/'/g) || []).length % 2 !== 0,
      (content.match(/`/g) || []).length % 2 !== 0
    ].some(Boolean);

    // 检查基本结构
    let structureValid = true;
    let issues = [];

    // 检查是否有导出语句
    const hasExports = content.includes('export ') || content.includes('module.exports');
    if (!hasExports && !file.includes('utils.ts')) { // utils.ts 可能只有函数定义
      // 检查是否有函数定义
      const hasFunctions = content.includes('function ') || content.includes('const ') || content.includes('class ');
      if (!hasFunctions) {
        issues.push('缺少导出或函数定义');
        structureValid = false;
      }
    }

    // 检查是否有import语句
    const hasImports = content.includes('import ');
    if (hasImports) {
      // 检查import语句是否闭合
      const importLines = lines.filter(line => line.trim().startsWith('import'));
      importLines.forEach(line => {
        if (!line.trim().endsWith(';') && !line.trim().endsWith(',') && !line.trim().endsWith('{')) {
          issues.push(`可能的import语法错误: ${line.trim()}`);
        }
      });
    }

    console.log(`✅ ${path.basename(file)}`);
    console.log(`   📄 大小: ${stats.size} bytes`);
    console.log(`   📝 行数: ${lines.length} (有效行: ${nonEmptyLines})`);
    
    if (hasSyntaxErrors) {
      console.log(`   ⚠️  语法检查: 可能存在语法错误`);
      allValid = false;
    } else {
      console.log(`   ✅ 语法检查: 通过`);
    }

    if (!structureValid) {
      console.log(`   ❌ 结构检查: 失败`);
      issues.forEach(issue => console.log(`      - ${issue}`));
      allValid = false;
    } else {
      console.log(`   ✅ 结构检查: 通过`);
    }

    // 检查关键特性
    const keyFeatures = [];
    
    if (content.includes('typescript') || content.includes('interface ') || content.includes('type ')) {
      keyFeatures.push('TypeScript类型定义');
    }
    if (content.includes('useState') || content.includes('useEffect')) {
      keyFeatures.push('React Hooks');
    }
    if (content.includes('async') || content.includes('await')) {
      keyFeatures.push('异步处理');
    }
    if (content.includes('try') && content.includes('catch')) {
      keyFeatures.push('错误处理');
    }
    if (content.includes('export ')) {
      keyFeatures.push('模块导出');
    }

    if (keyFeatures.length > 0) {
      console.log(`   🔧 关键特性: ${keyFeatures.join(', ')}`);
    }

    console.log('');

  } catch (error) {
    console.log(`❌ 文件检查失败: ${file}`);
    console.log(`   错误: ${error.message}`);
    allValid = false;
  }
});

console.log('=== 验证结果 ===');
if (allValid) {
  console.log('✅ 所有文件验证通过！');
  process.exit(0);
} else {
  console.log('❌ 发现问题，请检查上述输出');
  process.exit(1);
}
