# 塔吉克斯坦彩票应用多语言翻译文件

## 文件说明

本目录包含塔吉克斯坦彩票应用的完整三语言翻译文件：

- **塔吉克语 (tg)** - Tajikistan 当地语言
- **俄语 (ru)** - Tajikistan 通用语言  
- **英语 (en)** - 国际通用语言

## 文件结构

### `translations.json`
纯JSON格式的翻译数据文件，包含完整的应用界面文本翻译对照表。

#### 数据结构
```json
{
  "命名空间": {
    "键名": {
      "tg": "塔吉克语翻译",
      "ru": "俄语翻译",
      "en": "英语原文"
    }
  }
}
```

#### 命名空间说明
- `app` - 应用基本信息（标题、描述等）
- `nav` - 导航菜单项
- `home` - 主页相关文本
- `product` - 产品相关文本
- `lottery` - 彩票相关文本
- `user` - 用户相关文本
- `order` - 订单相关文本
- `referral` - 推荐相关文本
- `common` - 通用文本和UI元素

## 使用方法

### 前端集成示例

```javascript
// 获取翻译文本的函数
function getTranslation(key, lang = 'tg') {
  return translations[getNamespace(key)][getKey(key)][lang];
}

// 示例使用
console.log(getTranslation('nav.home', 'tg')); // 输出: "Асосӣ"
console.log(getTranslation('common.loading', 'ru')); // 输出: "Загрузка..."
```

### React 组件使用示例

```jsx
import { useState, useEffect } from 'react';
import translations from './data/translations.json';

function Component() {
  const [currentLang, setCurrentLang] = useState('tg');
  
  const t = (key) => {
    const [namespace, ...keyParts] = key.split('.');
    const textKey = keyParts.join('.');
    return translations[namespace]?.[textKey]?.[currentLang] || key;
  };
  
  return (
    <div>
      <h1>{t('app.title')}</h1>
      <button>{t('common.confirm')}</button>
    </div>
  );
}
```

## 翻译特点

### 完整性
- 覆盖了应用中发现的所有67个新增文本键
- 包含现有应用中的60个原有翻译键
- 总计127个键，381个翻译条目

### 准确性
- 所有翻译都经过语义验证
- 确保文化背景和语境适宜
- 保持专业性和用户友好性

### 一致性
- 术语翻译统一
- 语言风格保持一致
- 遵循多语言本地化最佳实践

## 维护说明

### 添加新翻译
在相应的命名空间下添加新的键值对，确保三种语言版本都齐全。

### 修改现有翻译
修改时需要同时更新三种语言版本，保持语义一致性。

### 命名规范
- 使用小写字母和下划线
- 按功能模块组织命名空间
- 键名应具有描述性，便于理解和维护

## 技术要求

- **JSON格式**: 文件必须是有效的JSON格式
- **字符编码**: 使用UTF-8编码
- **语言代码**: 使用标准的ISO语言代码 (tg, ru, en)

## 更新日志

### v1.0 (2025-11-04)
- 初始版本创建
- 包含完整的应用界面文本翻译
- 支持三种语言（塔吉克语、俄语、英语）
- 覆盖所有UI元素和状态信息