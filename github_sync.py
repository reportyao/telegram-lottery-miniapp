#!/usr/bin/env python3
"""
GitHub文件同步脚本
将修复完成的代码同步到GitHub仓库
"""

import os
import json
import base64
import requests
from pathlib import Path
from typing import Dict, List

class GitHubSync:
    def __init__(self, token: str, owner: str, repo: str):
        self.token = token
        self.owner = owner
        self.repo = repo
        self.base_url = f"https://api.github.com/repos/{owner}/{repo}"
        self.headers = {
            'Authorization': f'token {token}',
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        }

    def get_file_content(self, path: str) -> Dict:
        """获取GitHub仓库中文件内容"""
        url = f"{self.base_url}/contents/{path}"
        response = requests.get(url, headers=self.headers)
        if response.status_code == 200:
            return response.json()
        return None

    def create_or_update_file(self, path: str, content: str, message: str, branch: str = "main") -> bool:
        """创建或更新文件"""
        url = f"{self.base_url}/contents/{path}"
        
        # 获取现有文件信息
        existing_file = self.get_file_content(path)
        
        payload = {
            'message': message,
            'content': base64.b64encode(content.encode('utf-8')).decode('utf-8'),
            'branch': branch
        }
        
        if existing_file:
            payload['sha'] = existing_file['sha']
        
        response = requests.put(url, headers=self.headers, json=payload)
        
        if response.status_code in [200, 201]:
            print(f"✅ 成功更新文件: {path}")
            return True
        else:
            print(f"❌ 更新文件失败: {path} - {response.status_code}")
            print(f"   错误信息: {response.text}")
            return False

    def upload_directory(self, local_dir: str, github_prefix: str = "", message: str = "代码同步更新") -> int:
        """上传整个目录到GitHub"""
        success_count = 0
        
        local_path = Path(local_dir)
        if not local_path.exists():
            print(f"❌ 目录不存在: {local_dir}")
            return 0
            
        print(f"📁 开始同步目录: {local_dir}")
        
        # 文件扩展名白名单
        allowed_extensions = {
            '.js', '.ts', '.tsx', '.jsx', '.json', '.md', '.css', '.html',
            '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
            '.yaml', '.yml', '.sql', '.sh', '.py', '.txt'
        }
        
        # 忽略的文件和目录
        ignore_patterns = {
            'node_modules', '.git', '.next', '__pycache__', '*.pyc',
            '*.log', '.DS_Store', 'Thumbs.db', 'tsconfig.tsbuildinfo'
        }
        
        for file_path in local_path.rglob('*'):
            if file_path.is_file():
                # 检查忽略模式
                should_ignore = False
                for pattern in ignore_patterns:
                    if pattern in str(file_path) or str(file_path).endswith(pattern):
                        should_ignore = True
                        break
                
                if should_ignore:
                    continue
                
                # 检查文件扩展名
                if not any(str(file_path).lower().endswith(ext) for ext in allowed_extensions):
                    continue
                
                # 计算GitHub路径
                rel_path = file_path.relative_to(local_path)
                github_path = f"{github_prefix}/{rel_path}" if github_prefix else str(rel_path)
                
                try:
                    # 读取文件内容
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    # 上传文件
                    if self.create_or_update_file(github_path, content, f"{message}: {rel_path}"):
                        success_count += 1
                        
                except Exception as e:
                    print(f"❌ 处理文件失败: {file_path} - {str(e)}")
        
        return success_count

    def sync_project(self, project_dir: str) -> Dict:
        """同步整个项目"""
        results = {
            'total_files': 0,
            'success_files': 0,
            'errors': []
        }
        
        print("🚀 开始GitHub代码同步...")
        print(f"📊 目标仓库: {self.owner}/{self.repo}")
        print(f"📁 本地项目: {project_dir}")
        
        # 同步核心文件
        core_files = [
            'package.json',
            'next.config.js', 
            'tsconfig.json',
            'tailwind.config.js',
            'jest.config.js',
            'README.md'
        ]
        
        for core_file in core_files:
            file_path = os.path.join(project_dir, core_file)
            if os.path.exists(file_path):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    if self.create_or_update_file(core_file, content, f"更新核心文件: {core_file}"):
                        results['success_files'] += 1
                    results['total_files'] += 1
                    
                except Exception as e:
                    results['errors'].append(f"核心文件 {core_file}: {str(e)}")
        
        # 同步目录
        directories = [
            ('app', 'app'),
            ('components', 'components'),
            ('lib', 'lib'),
            ('hooks', 'hooks'),
            ('types', 'types'),
            ('locales', 'locales'),
            ('public', 'public'),
            ('supabase', 'supabase'),
            ('docs', 'docs'),
            ('__tests__', '__tests__')
        ]
        
        for local_dir, github_dir in directories:
            dir_path = os.path.join(project_dir, local_dir)
            if os.path.exists(dir_path):
                print(f"\n📂 同步目录: {local_dir}")
                success = self.upload_directory(dir_path, github_dir, f"同步目录: {local_dir}")
                results['success_files'] += success
                results['total_files'] += success
        
        # 同步根目录其他重要文件
        other_files = [
            '.env.example',
            '.eslintrc.json',
            '.prettierrc',
            'babel.config.js',
            'postcss.config.js'
        ]
        
        for other_file in other_files:
            file_path = os.path.join(project_dir, other_file)
            if os.path.exists(file_path):
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    if self.create_or_update_file(other_file, content, f"更新配置: {other_file}"):
                        results['success_files'] += 1
                    results['total_files'] += 1
                    
                except Exception as e:
                    results['errors'].append(f"配置文件 {other_file}: {str(e)}")
        
        return results

if __name__ == "__main__":
    # GitHub配置
    GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
    OWNER = "reportyao"
    REPO = "telegram-lottery-miniapp"
    PROJECT_DIR = "/workspace/telegram-lottery-miniapp"
    
    if not GITHUB_TOKEN:
        print("❌ 错误: GITHUB_TOKEN环境变量未设置")
        exit(1)
    
    # 创建同步器
    sync = GitHubSync(GITHUB_TOKEN, OWNER, REPO)
    
    # 执行同步
    results = sync.sync_project(PROJECT_DIR)
    
    # 输出结果
    print(f"\n📊 同步完成统计:")
    print(f"   总文件数: {results['total_files']}")
    print(f"   成功同步: {results['success_files']}")
    print(f"   成功率: {results['success_files']/max(results['total_files'], 1)*100:.1f}%")
    
    if results['errors']:
        print(f"\n❌ 错误列表:")
        for error in results['errors']:
            print(f"   - {error}")
    
    print(f"\n🎉 GitHub同步任务完成!")
