#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CSS语法检查工具
"""
import cssutils
import os
import sys
import logging

def validate_css_file(file_path):
    """验证CSS文件的语法"""
    print(f"\n🔍 检查文件: {file_path}")
    print("=" * 50)
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 禁用cssutils的日志输出
        cssutils.log.setLevel(logging.ERROR)
        
        # 直接检查CSS字符串中的语法错误
        try:
            # 解析CSS以检查语法
            sheet = cssutils.parseString(content)
            print("✅ CSS语法验证通过！")
            return True
        except Exception as e:
            print(f"❌ CSS语法错误: {str(e)}")
            return False
        
    except Exception as e:
        print(f"❌ 文件读取错误: {str(e)}")
        return False

def main():
    """主函数"""
    print("🎨 CSS语法验证工具")
    print("=" * 50)
    
    # CSS文件路径
    css_files = [
        "/workspace/telegram-lottery-miniapp/app/globals.css",
        "/workspace/telegram-lottery-miniapp/.next/static/css/6b1ea39076030e98.css"
    ]
    
    results = {}
    
    for css_file in css_files:
        if os.path.exists(css_file):
            results[css_file] = validate_css_file(css_file)
        else:
            print(f"❌ 文件不存在: {css_file}")
            results[css_file] = False
    
    # 总结
    print("\n" + "=" * 50)
    print("📊 检查结果总结:")
    print("=" * 50)
    
    for file_path, is_valid in results.items():
        status = "✅ 通过" if is_valid else "❌ 失败"
        print(f"{status} {os.path.basename(file_path)}")
    
    # 如果有错误，尝试修复
    failed_files = [f for f, valid in results.items() if not valid]
    if failed_files:
        print(f"\n🔧 需要修复的文件: {len(failed_files)}")
        return failed_files
    else:
        print("\n🎉 所有CSS文件语法正确！")
        return []

if __name__ == "__main__":
    failed_files = main()
    
    if failed_files:
        print(f"\n要修复的文件: {failed_files}")
        sys.exit(1)
    else:
        sys.exit(0)