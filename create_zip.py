#!/usr/bin/env python3
import os
import zipfile
import shutil

# 创建压缩包
source_dir = "/workspace/telegram-lottery-miniapp"
zip_path = "/workspace/telegram-lottery-miniapp.zip"

print(f"正在创建压缩包...")
print(f"源目录: {source_dir}")
print(f"目标: {zip_path}")

# 排除的文件夹和文件
exclude_patterns = [
    'node_modules',
    '.next', 
    '.git',
    '*.log',
    '*.cache',
    '__pycache__',
    '.DS_Store',
    'dist',
    'build'
]

try:
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # 检查是否应该排除当前目录
            dirs[:] = [d for d in dirs if d not in exclude_patterns]
            
            for file in files:
                # 检查是否应该排除文件
                skip_file = False
                for pattern in exclude_patterns:
                    if pattern.startswith('*') and file.endswith(pattern[1:]):
                        skip_file = True
                        break
                    elif pattern in file:
                        skip_file = True
                        break
                
                if skip_file:
                    continue
                    
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, source_dir)
                zipf.write(file_path, arcname)
    
    # 显示压缩包信息
    size = os.path.getsize(zip_path) / (1024 * 1024)  # MB
    print(f"✅ 压缩包创建成功!")
    print(f"📦 文件: {zip_path}")
    print(f"📏 大小: {size:.2f} MB")
    
    # 显示压缩包内容
    print("\n📋 压缩包内容预览:")
    with zipfile.ZipFile(zip_path, 'r') as zipf:
        file_list = zipf.namelist()[:20]  # 只显示前20个文件
        for file in file_list:
            print(f"  - {file}")
        if len(zipf.namelist()) > 20:
            print(f"  ... (还有 {len(zipf.namelist()) - 20} 个文件)")

except Exception as e:
    print(f"❌ 创建压缩包失败: {e}")
    import traceback
    traceback.print_exc()