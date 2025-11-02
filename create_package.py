#!/usr/bin/env python3
import os
import zipfile
import shutil

def create_project_package():
    source_dir = "/workspace/telegram-lottery-miniapp"
    zip_path = "/workspace/telegram-lottery-miniapp.zip"
    
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
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # 检查是否应该排除当前目录
            skip = False
            for pattern in exclude_patterns:
                if pattern in root.split('/'):
                    skip = True
                    break
            
            if skip:
                continue
                
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
    
    print(f"压缩包创建成功: {zip_path}")
    
    # 显示压缩包信息
    size = os.path.getsize(zip_path) / (1024 * 1024)  # MB
    print(f"压缩包大小: {size:.2f} MB")

if __name__ == "__main__":
    create_project_package()