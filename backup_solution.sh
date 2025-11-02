=== 备用解决方案：检查Next.js版本和配置 ===

如果API仍然404，请执行以下检查：

# 1. 检查Next.js版本和配置
cd /root/telegram-lottery-miniapp/telegram-lottery-miniapp
echo "=== Next.js版本检查 ==="
node --version
npm --version
npm list next

echo ""
echo "=== package.json完整内容 ==="
cat package.json

echo ""
echo "=== 检查项目类型 ==="
ls -la ./
echo ""
echo "是否有tsconfig.json:"
ls -la tsconfig.json 2>/dev/null || echo "tsconfig.json不存在"

echo ""
echo "=== 检查pages目录（如果是旧Next.js） ==="
if [ -d "pages" ]; then
    echo "发现pages目录，这是一个旧版Next.js项目"
    echo "pages目录内容:"
    ls -la pages/
    echo ""
    echo "尝试创建pages API路由..."
    mkdir -p pages/api/products
    cat > pages/api/products.js << 'PAGEEF'
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Pages API working!',
    products: [
      { id: '1', title: 'iPhone 15', price: 999 },
      { id: '2', title: 'MacBook', price: 1299 }
    ]
  });
}
PAGEEF
    echo "创建了pages/api/products.js"
fi

echo ""
echo "=== 检查动态路由配置 ==="
echo "检查app目录结构："
find app -name "*.tsx" -o -name "*.ts" | head -10

echo ""
echo "=== 强制重新安装依赖 ==="
echo "清理node_modules..."
rm -rf node_modules
rm -rf package-lock.json
echo "重新安装依赖..."
npm install

echo ""
echo "=== 重新启动应用 ==="
pkill -f "npm"
sleep 3
npm run dev