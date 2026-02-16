import {
  DocumentStatus,
  SectionType,
  Priority,
  StoryStatus,
  ConfidenceLevel,
  ErrorCode,
  type ConfidenceScore,
  type SourceReference,
  type DocumentSection,
  type Story,
  type ParsedDocument,
  generateUUID,
  generateTraceId
} from '@/types/storyweaver';
import { LLMOptimizer } from './LLMOptimizer';
import { LLMModel, LLMConfig } from './LLMService';

export class StoryGenerator {
  private llmOptimizer: LLMOptimizer | null = null;
  private llmConfig: LLMConfig | null = null;

  // 初始化LLM优化器
  initLLMOptimizer(config: LLMConfig) {
    this.llmConfig = config;
    this.llmOptimizer = new LLMOptimizer(config);
  }

  // 检查LLM优化是否已初始化
  isLLMEnabled(): boolean {
    return !!this.llmOptimizer && !!this.llmConfig?.apiKey?.trim();
  }
  extractRole(text: string): { role: string; confidence: number } {
    const explicitPatterns = [
      /作为[了一个个名]*\s*([^，,]+?)(?:，|,|我|可以|能够|需要|想要)/i,
      /(?:^|\n)([^，,]{2,20}?)可以/,
      /(?:^|\n)([^，,]{2,20}?)能够/
    ];
    
    for (const pattern of explicitPatterns) {
      const match = text.match(pattern);
      if (match) {
        const extractedRole = match[1]?.trim();
        if (extractedRole && extractedRole.length >= 2) {
          return { role: extractedRole, confidence: 0.9 };
        }
      }
    }
    
    const roleKeywords: Record<string, string[]> = {
      '用户': ['用户', '使用者', '终端用户', '普通用户'],
      '管理员': ['管理员', '超级管理员', '系统管理员', 'admin'],
      '访客': ['访客', '游客', '未登录用户', '临时用户']
    };
    
    for (const [role, keywords] of Object.entries(roleKeywords)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          return { role, confidence: 0.8 };
        }
      }
    }
    
    return { role: '用户', confidence: 0.5 };
  }
  
  extractAction(text: string): { action: string | null; confidence: number } {
    const actionPatterns = [
      /(?:可以|能够|支持|允许)\s*(.+?)(?:以便|从而|为了|so\s*that|$)/i,
      /(?:需要|要求|必须)\s*(.+?)(?:，|,|$)/i,
      /(?:想要|希望|期望)\s*(.+?)(?:，|,|$)/i
    ];
    
    for (const pattern of actionPatterns) {
      const match = text.match(pattern);
      if (match) {
        let action = match[1]?.trim();
        if (action && action.length >= 5) {
          return { action, confidence: 0.85 };
        }
      }
    }
    
    return { action: null, confidence: 0 };
  }
  
  extractValue(text: string): { value: string | null; confidence: number } {
    const valuePatterns = [
      /(?:以便|从而|为了|so\s*that)\s*(.+?)(?:。|$)/i
    ];
    
    for (const pattern of valuePatterns) {
      const match = text.match(pattern);
      if (match) {
        const value = match[1]?.trim();
        if (value && value.length >= 3) {
          return { value, confidence: 0.9 };
        }
      }
    }
    
    return { value: null, confidence: 0.3 };
  }
  
  calculateOverallConfidence(factors: {
    templateMatch: number;
    roleClarity: number;
    actionClarity: number;
    valueClarity: number;
    sourceLength: number;
    languageClarity: number;
  }): ConfidenceScore {
    const weights = {
      templateMatch: 0.25,
      roleClarity: 0.15,
      actionClarity: 0.25,
      valueClarity: 0.15,
      sourceLength: 0.10,
      languageClarity: 0.10
    };
    
    let overall = 0;
    for (const [key, weight] of Object.entries(weights)) {
      overall += factors[key as keyof typeof factors] * weight;
    }
    
    let level: ConfidenceLevel;
    if (overall >= 0.8) level = ConfidenceLevel.HIGH;
    else if (overall >= 0.5) level = ConfidenceLevel.MEDIUM;
    else level = ConfidenceLevel.LOW;
    
    const reasons: string[] = [];
    if (factors.templateMatch >= 0.8) reasons.push('符合标准模板');
    if (factors.roleClarity >= 0.8) reasons.push('角色定义明确');
    else if (factors.roleClarity < 0.5) reasons.push('角色不够明确');
    if (factors.actionClarity < 0.8) reasons.push('功能描述可能需要细化');
    if (factors.valueClarity < 0.5) reasons.push('缺少明确的商业价值');
    
    return {
      overall: Math.min(overall, 1.0),
      level,
      factors,
      reasons,
      needsReview: overall < 0.7
    };
  }
  
  inferPriority(text: string): Priority {
    const highKeywords = ['必须', '一定', '关键', '核心', '重要', 'P0', '高优先级'];
    const lowKeywords = ['可选', '未来', '暂缓', 'P2', '低优先级', 'nice to have'];
    
    const lowerText = text.toLowerCase();
    
    if (highKeywords.some(kw => lowerText.includes(kw))) return Priority.P0;
    if (lowKeywords.some(kw => lowerText.includes(kw))) return Priority.P2;
    return Priority.P1;
  }
  
  calculateTemplateMatch(text: string): number {
    const patterns = [
      /As a\s+.+?\s*,?\s*I want(?: to)?\s+.+?\s*,?\s*So that\s+.+?/i,
      /作为[了一个个名]*\s*.+?\s*[,，]?\s*(?:我)?(?:想|希望|需要|想要|可以|能够)/,
      /.+?可以.+?以便.+/,
      /.+?能够.+?从而.+/
    ];
    
    for (const pattern of patterns) {
      if (pattern.test(text)) return 0.9;
    }
    
    if (/作为|As a/.test(text)) return 0.6;
    if (/可以|能够|want|need/.test(text)) return 0.4;
    
    return 0.2;
  }
  
  calculateSourceLength(text: string): number {
    const length = text.length;
    if (length >= 20 && length <= 200) return 0.9;
    if (length >= 10 && length < 20) return 0.7;
    if (length > 200 && length <= 500) return 0.6;
    if (length < 10) return 0.3;
    return 0.4;
  }
  
  calculateLanguageClarity(text: string): number {
    const ambiguousWords = ['等等', '之类', '相关', '其他', '某些'];
    let penalty = 0;
    
    for (const word of ambiguousWords) {
      if (text.includes(word)) penalty += 0.1;
    }
    
    return Math.max(0.9 - penalty, 0.3);
  }
  
  async generateFromSentence(
    sentence: string,
    section: { id: string; title: string }
  ): Promise<Story | null> {
    const { role, confidence: roleConf } = this.extractRole(sentence);
    const { action, confidence: actionConf } = this.extractAction(sentence);
    
    if (!action) return null;
    
    const { value, confidence: valueConf } = this.extractValue(sentence);
    const finalValue = value || '（待补充）';
    const description = `As a ${role}, I want to ${action}, So that ${finalValue}`;
    const title = action.length <= 15 ? action : action.substring(0, 15) + '...';
    const templateMatch = this.calculateTemplateMatch(sentence);
    const sourceLength = this.calculateSourceLength(sentence);
    const languageClarity = this.calculateLanguageClarity(sentence);
    
    const confidence = this.calculateOverallConfidence({
      templateMatch,
      roleClarity: role !== '用户' ? 0.85 : 0.5,
      actionClarity: action.length >= 10 && action.length <= 100 ? 0.7 : 0.5,
      valueClarity: value && value !== '（待补充）' ? 0.85 : 0.3,
      sourceLength,
      languageClarity
    });
    
    let story: Story = {
      id: generateUUID(),
      documentId: '',
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
      },
      status: StoryStatus.DRAFT,
      isEdited: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      sortOrder: 0
    };

    // LLM优化
    if (this.isLLMEnabled() && this.llmOptimizer?.shouldOptimize(story)) {
      try {
        const optimizedResult = await this.llmOptimizer.optimizeStory({
          story,
          sourceContext: sentence,
          optimizationGoals: [
            '提升描述的清晰度',
            '补充缺失信息',
            '优化语言表达',
            '增强置信度'
          ]
        });
        
        // 更新成本监控
        const costMonitor = (await import('./LLMOptimizer')).CostMonitor.getInstance();
        costMonitor.trackUsage(
          this.llmConfig!.model,
          optimizedResult.cost.promptTokens,
          optimizedResult.cost.completionTokens,
          optimizedResult.timing.total
        );

        story = optimizedResult.optimizedStory;
      } catch (error) {
        console.warn('LLM优化失败，使用原始版本:', error);
      }
    }
    
    return story;
  }
}
