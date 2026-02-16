# StoryWeaver AI - AI/算法策略规范

**版本**: v1.0  
**日期**: 2026-02-14  
**状态**: 策略完成  

---

## 📑 目录

1. [算法策略概览](#1-算法策略概览)
2. [Phase 1: 规则引擎](#2-phase-1-规则引擎)
3. [Phase 2: 混合策略](#3-phase-2-混合策略)
4. [置信度算法](#4-置信度算法)
5. [NLP处理流程](#5-nlp处理流程)
6. [故事生成算法](#6-故事生成算法)
7. [性能优化](#7-性能优化)

---

## 1. 算法策略概览

### 1.1 演进策略

```
Phase 1 (MVP)
└── 纯规则引擎 (Rule-Based)
    ├── 关键词匹配
    ├── 正则表达式
    ├── 模板匹配
    └── 启发式规则
    准确率目标: 60-70%

Phase 2 (增强)
└── 混合策略 (Rule-Based + ML)
    ├── 规则引擎 (基础)
    ├── 机器学习分类
    ├── NER命名实体识别
    └── 轻量级LLM辅助
    准确率目标: 75-85%

Phase 3 (智能)
└── 深度学习 (DL/LLM)
    ├── 预训练语言模型
    ├── Fine-tuning
    └── 完整LLM流水线
    准确率目标: 85-95%
```

### 1.2 算法选型对比

| 算法 | 优点 | 缺点 | 适用阶段 | 准确率 |
|------|------|------|----------|--------|
| **规则引擎** | 快速、可控、无依赖 | 维护困难、泛化差 | Phase 1 | 60-70% |
| **传统ML** | 中等复杂度、可解释 | 需标注数据 | Phase 2 | 70-80% |
| **BERT类** | 准确率高、语义理解 | 计算资源大 | Phase 2+ | 80-90% |
| **GPT/LLM** | 最准确、泛化强 | 成本高、延迟大 | Phase 3 | 85-95% |

---

## 2. Phase 1: 规则引擎

### 2.1 整体流程

```
输入: PRD文档文本
    │
    ▼
┌──────────────────────┐
│ 1. 文本预处理         │
│ - 分句                │
│ - 清洗                │
│ - 分词                │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 2. 章节分类           │
│ - 识别功能需求章节    │
│ - 过滤非功能描述      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 3. 功能点提取         │
│ - 动词识别            │
│ - 角色识别            │
│ - 动作识别            │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ 4. 故事组装           │
│ - 模板填充            │
│ - 置信度计算          │
│ - 后处理              │
└──────────┬───────────┘
           │
           ▼
输出: 用户故事列表
```

### 2.2 规则定义

#### 2.2.1 角色识别规则

```typescript
// 角色识别规则
const ROLE_RULES = {
  // 显式角色模式
  explicitPatterns: [
    /作为[了一个个名]*\s*([^，,]+?)(?:，|,|我|可以|能够|需要|想要)/i,
    /(?:^|\n)([^，,]{2,20}?)可以/,
    /(?:^|\n)([^，,]{2,20}?)能够/,
    /(?:用户|管理员|访客|会员|商家|买家|卖家|开发者|运营|客服)/
  ],
  
  // 角色关键词映射
  roleKeywords: {
    '用户': ['用户', '使用者', '终端用户', '普通用户'],
    '管理员': ['管理员', '超级管理员', '系统管理员', 'admin'],
    '访客': ['访客', '游客', '未登录用户', '临时用户'],
    '会员': ['会员', 'VIP', '付费用户', '订阅用户'],
    '商家': ['商家', '卖家', '店主', '供应商'],
    '买家': ['买家', '购买者', '消费者', '客户'],
    '开发者': ['开发者', '程序员', '工程师', '技术人员'],
    '运营': ['运营', '运营人员', '管理员'],
    '客服': ['客服', '客服人员', '售后', '技术支持']
  },
  
  // 默认角色
  defaultRole: '用户'
};

// 角色识别函数
function extractRole(text: string): { role: string; confidence: number } {
  // 1. 检查显式模式
  for (const pattern of ROLE_RULES.explicitPatterns) {
    const match = text.match(pattern);
    if (match) {
      const extractedRole = match[1]?.trim();
      if (extractedRole && extractedRole.length >= 2) {
        return { role: extractedRole, confidence: 0.9 };
      }
    }
  }
  
  // 2. 检查关键词
  for (const [role, keywords] of Object.entries(ROLE_RULES.roleKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return { role, confidence: 0.8 };
      }
    }
  }
  
  // 3. 默认角色
  return { role: ROLE_RULES.defaultRole, confidence: 0.5 };
}
```

#### 2.2.2 动作识别规则

```typescript
// 动作识别规则
const ACTION_RULES = {
  // 动作引导词
  actionIndicators: [
    '可以', '能够', '支持', '允许', '提供', '实现',
    '需要', '要求', '必须', '应该',
    '想要', '希望', '期望',
    '能够', '支持', '具备', '拥有'
  ],
  
  // 动作模式
  actionPatterns: [
    /(?:可以|能够|支持|允许)\s*(.+?)(?:以便|从而|为了|so\s*that|$)/i,
    /(?:需要|要求|必须)\s*(.+?)(?:，|,|$)/i,
    /(?:想要|希望|期望)\s*(.+?)(?:，|,|$)/i,
    /实现(.+?)(?:功能|需求|特性)/i,
    /提供(.+?)(?:功能|服务|能力)/i
  ],
  
  // 停用词 (动作中不应包含)
  stopWords: [
    '系统', '平台', '应用', '功能', '模块',
    '因此', '所以', '但是', '然而'
  ]
};

function extractAction(text: string): { action: string | null; confidence: number } {
  // 1. 匹配动作模式
  for (const pattern of ACTION_RULES.actionPatterns) {
    const match = text.match(pattern);
    if (match) {
      let action = match[1]?.trim();
      
      // 清理停用词
      for (const stopWord of ACTION_RULES.stopWords) {
        action = action.replace(stopWord, '').trim();
      }
      
      if (action && action.length >= 5) {
        return { action, confidence: 0.85 };
      }
    }
  }
  
  // 2. 基于动词提取
  const verbs = extractVerbs(text);
  if (verbs.length > 0) {
    const action = verbs.slice(0, 3).join('');
    return { action, confidence: 0.6 };
  }
  
  return { action: null, confidence: 0 };
}
```

#### 2.2.3 价值识别规则

```typescript
// 价值识别规则
const VALUE_RULES = {
  // 价值引导词
  valueIndicators: [
    '以便', '从而', '为了', 'so that', 'in order to',
    '实现', '达到', '获得', '提升', '优化', '改善',
    '确保', '保证', '维护', '避免'
  ],
  
  // 价值模式
  valuePatterns: [
    /(?:以便|从而|为了|so\s*that)\s*(.+?)(?:。|$)/i,
    /(?:实现|达到|获得|提升|优化|改善)(.+?)(?:。|$)/i,
    /(?:确保|保证|维护)(.+?)(?:。|$)/i
  ],
  
  // 默认价值模板
  defaultValues: [
    '完成任务',
    '提升效率',
    '改善体验',
    '满足需求',
    '实现目标'
  ]
};

function extractValue(text: string): { value: string | null; confidence: number } {
  // 1. 匹配价值模式
  for (const pattern of VALUE_RULES.valuePatterns) {
    const match = text.match(pattern);
    if (match) {
      const value = match[1]?.trim();
      if (value && value.length >= 3) {
        return { value, confidence: 0.9 };
      }
    }
  }
  
  // 2. 返回默认价值（置信度低）
  return { value: null, confidence: 0.3 };
}
```

### 2.3 完整生成流程

```typescript
// services/StoryGenerationService.ts
class StoryGenerationService {
  /**
   * 主生成函数
   */
  async generateStories(sections: DocumentSection[]): Promise<Story[]> {
    const stories: Story[] = [];
    
    for (const section of sections) {
      // 只处理功能需求章节
      if (!this.isFunctionalSection(section)) {
        continue;
      }
      
      // 分句
      const sentences = this.splitSentences(section.content);
      
      for (const sentence of sentences) {
        const story = await this.generateFromSentence(sentence, section);
        if (story) {
          stories.push(story);
        }
      }
    }
    
    // 去重和排序
    return this.deduplicateAndSort(stories);
  }
  
  /**
   * 从单句生成故事
   */
  private async generateFromSentence(
    sentence: string,
    section: DocumentSection
  ): Promise<Story | null> {
    // 1. 提取角色
    const { role, confidence: roleConf } = extractRole(sentence);
    
    // 2. 提取动作
    const { action, confidence: actionConf } = extractAction(sentence);
    if (!action) return null;
    
    // 3. 提取价值
    const { value, confidence: valueConf } = extractValue(sentence);
    const finalValue = value || '（待补充）';
    
    // 4. 生成标题
    const title = this.generateTitle(action);
    
    // 5. 组装故事
    const description = `As a ${role}, I want to ${action}, So that ${finalValue}`;
    
    // 6. 计算整体置信度
    const confidence = this.calculateOverallConfidence({
      role: roleConf,
      action: actionConf,
      value: valueConf,
      template: this.checkTemplateMatch(sentence),
      length: sentence.length
    });
    
    return {
      id: generateUUID(),
      title,
      description,
      role,
      action,
      value: finalValue,
      module: section.title,
      priority: this.inferPriority(sentence),
      confidence,
      sourceReference: {
        text: sentence,
        sectionId: section.id,
        sectionTitle: section.title
      }
    };
  }
  
  /**
   * 判断是否为功能需求章节
   */
  private isFunctionalSection(section: DocumentSection): boolean {
    const functionalKeywords = [
      '功能', '需求', 'feature', 'functionality',
      '用户故事', 'user story', 'requirement'
    ];
    
    const titleLower = section.title.toLowerCase();
    return functionalKeywords.some(kw => titleLower.includes(kw.toLowerCase()));
  }
  
  /**
   * 分句
   */
  private splitSentences(text: string): string[] {
    // 中文分句
    return text
      .replace(/([。！？；\n]+)/g, '$1|')
      .split('|')
      .map(s => s.trim())
      .filter(s => s.length >= 10);
  }
  
  /**
   * 生成标题
   */
  private generateTitle(action: string): string {
    // 取前15个字符 + 省略号
    if (action.length <= 15) return action;
    return action.substring(0, 15) + '...';
  }
  
  /**
   * 推断优先级
   */
  private inferPriority(text: string): Priority {
    const highKeywords = ['必须', '一定', '关键', '核心', '重要', 'P0', '高优先级'];
    const lowKeywords = ['可选', '未来', '暂缓', 'P2', '低优先级', 'nice to have'];
    
    const lowerText = text.toLowerCase();
    
    if (highKeywords.some(kw => lowerText.includes(kw))) return 'P0';
    if (lowKeywords.some(kw => lowerText.includes(kw))) return 'P2';
    return 'P1';
  }
  
  /**
   * 去重和排序
   */
  private deduplicateAndSort(stories: Story[]): Story[] {
    // 基于动作文本去重
    const seen = new Set<string>();
    const unique = stories.filter(story => {
      const key = story.action.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    // 按置信度排序
    return unique.sort((a, b) => b.confidence.overall - a.confidence.overall);
  }
}
```

---

## 3. Phase 2: 混合策略

### 3.1 架构

```
输入文本
    │
    ▼
┌──────────────────────┐
│ 预处理               │
└──────────┬───────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
┌────────┐  ┌────────┐
│ 规则引擎 │  │ ML模型  │
│ 快速路径 │  │ 精确路径│
└────┬───┘  └────┬───┘
     │           │
     └─────┬─────┘
           │
           ▼
    ┌──────────────┐
    │ 结果融合      │
    │ - 投票机制    │
    │ - 置信度加权  │
    └──────┬───────┘
           │
           ▼
    输出故事
```

### 3.2 ML模型选择

#### 方案1: 轻量级BERT (推荐)

```python
# 使用 transformers.js (浏览器端)
from transformers import pipeline

# 命名实体识别 (NER)
ner_pipeline = pipeline(
    "ner",
    model="dslim/bert-base-NER",
    aggregation_strategy="simple"
)

# 文本分类
classifier = pipeline(
    "text-classification",
    model="distilbert-base-uncased-finetuned-sst-2-english"
)
```

**优点**:
- 可在浏览器运行 (transformers.js)
- 准确率高
- 模型体积小 (~66MB)

**缺点**:
- 首次加载慢
- 内存占用大

#### 方案2: 调用云端LLM API

```typescript
// 使用 OpenAI API
async function generateWithLLM(text: string): Promise<Story[]> {
  const prompt = `
    从以下产品需求描述中提取用户故事。
    请使用标准格式: "As a [角色], I want to [功能], So that [价值]"
    
    需求描述:
    ${text}
    
    请返回JSON格式的故事列表:
    [
      {
        "role": "角色",
        "action": "功能描述",
        "value": "商业价值",
        "priority": "P0/P1/P2"
      }
    ]
  `;
  
  const response = await openai.createCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

**成本估算**:
- GPT-3.5: ~$0.002/1K tokens
- 平均文档: ~500 tokens
- 成本: ~$0.001/文档 (非常便宜)

### 3.3 融合策略

```typescript
// 融合规则引擎和ML结果
function fuseResults(
  ruleResults: Story[],
  mlResults: Story[]
): Story[] {
  const fused: Story[] = [];
  const seen = new Map<string, Story>();
  
  // 处理规则引擎结果
  for (const story of ruleResults) {
    const key = story.action.toLowerCase().trim();
    seen.set(key, story);
    fused.push(story);
  }
  
  // 处理ML结果
  for (const mlStory of mlResults) {
    const key = mlStory.action.toLowerCase().trim();
    
    if (seen.has(key)) {
      // 融合已有结果
      const existing = seen.get(key)!;
      existing.confidence.overall = Math.max(
        existing.confidence.overall,
        mlStory.confidence.overall
      );
      
      // 如果ML的价值更清晰，采用ML的价值
      if (mlStory.value && mlStory.value !== '（待补充）') {
        existing.value = mlStory.value;
      }
    } else {
      // 新增ML发现的故事
      fused.push(mlStory);
    }
  }
  
  return fused.sort((a, b) => b.confidence.overall - a.confidence.overall);
}
```

---

## 4. 置信度算法

### 4.1 置信度计算

```typescript
interface ConfidenceFactors {
  templateMatch: number;    // 模板匹配度
  roleClarity: number;      // 角色明确度
  actionClarity: number;    // 动作明确度
  valueClarity: number;     // 价值明确度
  sourceLength: number;     // 原文长度适宜度
  languageClarity: number;  // 语言清晰度
}

function calculateOverallConfidence(factors: ConfidenceFactors): ConfidenceScore {
  // 权重配置
  const weights = {
    templateMatch: 0.25,
    roleClarity: 0.15,
    actionClarity: 0.25,
    valueClarity: 0.15,
    sourceLength: 0.10,
    languageClarity: 0.10
  };
  
  // 计算加权平均分
  let overall = 0;
  for (const [key, weight] of Object.entries(weights)) {
    overall += factors[key as keyof ConfidenceFactors] * weight;
  }
  
  // 确定等级
  let level: ConfidenceLevel;
  if (overall >= 0.8) level = 'high';
  else if (overall >= 0.5) level = 'medium';
  else level = 'low';
  
  // 生成原因说明
  const reasons = generateConfidenceReasons(factors);
  
  return {
    overall: Math.min(overall, 1.0),
    level,
    factors,
    reasons,
    needsReview: overall < 0.7
  };
}

function generateConfidenceReasons(factors: ConfidenceFactors): string[] {
  const reasons: string[] = [];
  
  if (factors.templateMatch >= 0.8) {
    reasons.push('符合标准用户故事模板');
  }
  
  if (factors.roleClarity >= 0.8) {
    reasons.push('角色定义明确');
  } else if (factors.roleClarity < 0.5) {
    reasons.push('角色不够明确，使用了默认角色');
  }
  
  if (factors.actionClarity >= 0.8) {
    reasons.push('功能描述清晰');
  } else {
    reasons.push('功能描述可能需要细化');
  }
  
  if (factors.valueClarity < 0.5) {
    reasons.push('缺少明确的商业价值描述');
  }
  
  return reasons;
}
```

### 4.2 各维度计算方法

```typescript
// 1. 模板匹配度
function calculateTemplateMatch(text: string): number {
  const patterns = [
    /As a\s+.+?\s*,?\s*I want(?: to)?\s+.+?\s*,?\s*So that\s+.+?/i,
    /作为[了一个个名]*\s*.+?\s*[,，]?\s*(?:我)?(?:想|希望|需要|想要|可以|能够)/,
    /.+?可以.+?以便.+/,
    /.+?能够.+?从而.+/
  ];
  
  for (const pattern of patterns) {
    if (pattern.test(text)) return 0.9;
  }
  
  // 部分匹配
  if (/作为|As a/.test(text)) return 0.6;
  if (/可以|能够|want|need/.test(text)) return 0.4;
  
  return 0.2;
}

// 2. 角色明确度
function calculateRoleClarity(role: string, text: string): number {
  // 角色不是默认角色
  if (role !== '用户') return 0.85;
  
  // 从文本中推断出特定角色
  const specificRoles = ['管理员', '会员', '商家', '开发者'];
  for (const r of specificRoles) {
    if (text.includes(r)) return 0.7;
  }
  
  return 0.5;
}

// 3. 动作明确度
function calculateActionClarity(action: string): number {
  let score = 0.5;
  
  // 长度适宜 (10-100字符)
  if (action.length >= 10 && action.length <= 100) {
    score += 0.2;
  }
  
  // 包含动词
  if (/[做|进行|使用|查看|管理|创建|编辑|删除|上传|下载]/.test(action)) {
    score += 0.15;
  }
  
  // 包含对象
  if (action.length > 15) {
    score += 0.15;
  }
  
  return Math.min(score, 1.0);
}

// 4. 价值明确度
function calculateValueClarity(value: string | null): number {
  if (!value || value === '（待补充）') return 0.3;
  
  if (value.length >= 5 && value.length <= 100) {
    return 0.85;
  }
  
  return 0.6;
}

// 5. 原文长度适宜度
function calculateSourceLength(text: string): number {
  const length = text.length;
  
  if (length >= 20 && length <= 200) return 0.9;
  if (length >= 10 && length < 20) return 0.7;
  if (length > 200 && length <= 500) return 0.6;
  if (length < 10) return 0.3;
  return 0.4;
}

// 6. 语言清晰度
function calculateLanguageClarity(text: string): number {
  // 检查是否有歧义词汇
  const ambiguousWords = ['等等', '之类', '相关', '其他', '某些'];
  let penalty = 0;
  
  for (const word of ambiguousWords) {
    if (text.includes(word)) penalty += 0.1;
  }
  
  return Math.max(0.9 - penalty, 0.3);
}
```

---

## 5. NLP处理流程

### 5.1 文本预处理

```typescript
// NLP预处理管道
class NLPPipeline {
  /**
   * 清洗文本
   */
  cleanText(text: string): string {
    return text
      // 移除特殊字符
      .replace(/[\x00-\x08\x0b-\x0c\x0e-\x1f]/g, '')
      // 规范化空白
      .replace(/\s+/g, ' ')
      // 移除页眉页脚标记
      .replace(/第\s*\d+\s*页/g, '')
      .replace(/Page\s*\d+/gi, '')
      .trim();
  }
  
  /**
   * 分句
   */
  segmentSentences(text: string): string[] {
    // 中文分句
    const sentenceEndings = /([。！？；\n]+)/g;
    const parts = text.split(sentenceEndings);
    
    const sentences: string[] = [];
    for (let i = 0; i < parts.length; i += 2) {
      const sentence = parts[i] + (parts[i + 1] || '');
      if (sentence.trim().length >= 10) {
        sentences.push(sentence.trim());
      }
    }
    
    return sentences;
  }
  
  /**
   * 分词
   */
  tokenize(text: string): string[] {
    // 简单分词：基于空格和标点
    return text
      .split(/[\s,，.。!！?？;；:：""''（）()\[\]{}]+/)
      .filter(token => token.length > 0);
  }
  
  /**
   * 提取动词
   */
  extractVerbs(text: string): string[] {
    // 常见动词列表
    const commonVerbs = [
      '查看', '浏览', '搜索', '查询',
      '创建', '添加', '新建', '提交',
      '编辑', '修改', '更新', '更改',
      '删除', '移除', '清空',
      '上传', '下载', '导入', '导出',
      '登录', '注册', '退出',
      '购买', '支付', '下单', '退款',
      '分享', '收藏', '点赞', '评论'
    ];
    
    return commonVerbs.filter(verb => text.includes(verb));
  }
  
  /**
   * 提取名词
   */
  extractNouns(text: string): string[] {
    // 简单规则：2-4个字符的词可能是名词
    const tokens = this.tokenize(text);
    return tokens.filter(token => 
      token.length >= 2 && 
      token.length <= 4 &&
      !/^(可以|能够|需要|想要|以及|但是|因此)$/.test(token)
    );
  }
}
```

---

## 6. 故事生成算法

### 6.1 模板系统

```typescript
// 故事模板
const STORY_TEMPLATES = {
  // 标准敏捷模板
  standard: {
    pattern: 'As a {role}, I want to {action}, So that {value}',
    priority: 1
  },
  
  // 简化模板 (价值不明确时)
  simple: {
    pattern: 'As a {role}, I want to {action}',
    priority: 2
  },
  
  // 技术故事模板
  technical: {
    pattern: 'As a {role}, I need {action} to {value}',
    priority: 3
  }
};

// 模板填充
function fillTemplate(
  template: string,
  data: { role: string; action: string; value: string }
): string {
  return template
    .replace('{role}', data.role)
    .replace('{action}', data.action)
    .replace('{value}', data.value);
}
```

### 6.2 智能优化

```typescript
// 故事优化
class StoryOptimizer {
  /**
   * 优化动作描述
   */
  optimizeAction(action: string): string {
    let optimized = action;
    
    // 移除冗余词汇
    const redundantWords = ['功能', '模块', '系统', '可以', '能够'];
    for (const word of redundantWords) {
      optimized = optimized.replace(word, '').trim();
    }
    
    // 确保以动词开头
    const verbs = ['查看', '创建', '编辑', '删除', '管理', '使用'];
    const startsWithVerb = verbs.some(v => optimized.startsWith(v));
    
    if (!startsWithVerb && !optimized.startsWith('能够') && !optimized.startsWith('可以')) {
      // 尝试添加合适的动词
      optimized = '能够' + optimized;
    }
    
    return optimized;
  }
  
  /**
   * 优化价值描述
   */
  optimizeValue(value: string): string {
    if (!value || value === '（待补充）') {
      return '更好地完成工作';
    }
    
    // 确保价值描述完整
    if (!value.includes('我') && !value.includes('用户')) {
      value = '我可以' + value;
    }
    
    return value;
  }
}
```

---

## 7. 性能优化

### 7.1 计算优化

```typescript
// Web Worker 处理
class WorkerStoryGenerator {
  private worker: Worker;
  
  constructor() {
    this.worker = new Worker('/workers/story-generator.js');
  }
  
  async generate(text: string): Promise<Story[]> {
    return new Promise((resolve, reject) => {
      this.worker.onmessage = (e) => {
        if (e.data.error) {
          reject(e.data.error);
        } else {
          resolve(e.data.stories);
        }
      };
      
      this.worker.postMessage({ text });
    });
  }
}

// 批量处理
async function batchProcess(
  sections: DocumentSection[],
  batchSize: number = 5
): Promise<Story[]> {
  const allStories: Story[] = [];
  
  for (let i = 0; i < sections.length; i += batchSize) {
    const batch = sections.slice(i, i + batchSize);
    const promises = batch.map(section => 
      generateFromSection(section)
    );
    
    const results = await Promise.all(promises);
    allStories.push(...results.flat());
    
    // 每批处理后更新进度
    updateProgress((i + batchSize) / sections.length * 100);
  }
  
  return allStories;
}
```

### 7.2 缓存策略

```typescript
// 解析结果缓存
class ParseCache {
  private cache = new Map<string, { result: any; timestamp: number }>();
  private maxAge = 24 * 60 * 60 * 1000; // 24小时
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }
    
    return item.result;
  }
  
  set(key: string, result: any): void {
    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });
  }
  
  // 基于文件内容哈希的缓存键
  static generateKey(fileBuffer: ArrayBuffer): string {
    // 简单哈希：取前1KB + 文件大小
    const sample = new Uint8Array(fileBuffer.slice(0, 1024));
    let hash = 0;
    for (let i = 0; i < sample.length; i++) {
      const char = sample[i];
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `parse_${hash}_${fileBuffer.byteLength}`;
  }
}
```

---

## 算法性能基准

| 指标 | Phase 1 (规则) | Phase 2 (混合) | Phase 3 (LLM) |
|------|---------------|---------------|---------------|
| **准确率** | 60-70% | 75-85% | 85-95% |
| **处理速度** | <1秒 | 2-5秒 | 5-15秒 |
| **资源占用** | 低 | 中 | 高 |
| **成本** | 免费 | 低 | 中-高 |
| **延迟** | 极低 | 低 | 中 |

---

**文档结束**

*本AI/算法策略为 StoryWeaver AI 提供从规则引擎到深度学习的渐进式算法方案，确保在不同阶段都能获得最佳的故事生成效果。*
