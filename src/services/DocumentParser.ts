import { marked } from 'marked';
import {
  DocumentStatus,
  SectionType,
  type ParsedDocument,
  type DocumentSection,
  generateUUID,
  generateTraceId
} from '@/types/storyweaver';
import { StoryGenerator } from './StoryGenerator';
import { LLMConfig, LLMModel } from './LLMService';

export class DocumentParser {
  private storyGenerator: StoryGenerator;
  private llmConfig: LLMConfig | null = null;
  
  constructor(llmConfig?: LLMConfig) {
    this.storyGenerator = new StoryGenerator();
    if (llmConfig) {
      this.llmConfig = llmConfig;
      this.storyGenerator.initLLMOptimizer(llmConfig);
    }
  }

  // 更新LLM配置
  updateLLMConfig(config: LLMConfig) {
    this.llmConfig = config;
    this.storyGenerator.initLLMOptimizer(config);
  }

  // 检查LLM优化是否启用
  isLLMEnabled(): boolean {
    return !!this.llmConfig?.apiKey?.trim() && this.storyGenerator.isLLMEnabled();
  }
  
  async parseFile(file: File): Promise<ParsedDocument> {
    const fileType = this.detectFileType(file);
    
    let content: string;
    try {
      switch (fileType) {
        case 'md':
        case 'txt':
          content = await this.parseText(file);
          break;
        case 'docx':
          content = await this.parseDOCX(file);
          break;
        case 'pdf':
          content = await this.parsePDF(file);
          break;
        default:
          throw new Error('不支持的文件格式');
      }
    } catch (error) {
      return {
        id: generateUUID(),
        fileName: file.name,
        fileType: fileType as any,
        fileSize: file.size,
        status: DocumentStatus.FAILED,
        progress: 0,
        errorMessage: error instanceof Error ? error.message : '解析失败',
        createdAt: new Date(),
        updatedAt: new Date(),
        sessionId: ''
      };
    }
    
    const sections = this.extractSections(content);
    const documentId = generateUUID();
    
    const doc: ParsedDocument = {
      id: documentId,
      fileName: file.name,
      fileType: fileType as any,
      fileSize: file.size,
      mimeType: file.type,
      status: DocumentStatus.COMPLETED,
      progress: 100,
      rawContent: content,
      totalChars: content.length,
      sections,
      sectionCount: sections.length,
      storyCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      sessionId: ''
    };
    
    const stories = await this.generateStories(sections, documentId);
    doc.stories = stories;
    doc.storyCount = stories.length;
    doc.averageConfidence = stories.length > 0
      ? stories.reduce((sum, s) => sum + s.confidence.overall, 0) / stories.length
      : undefined;
    
    return doc;
  }
  
  private detectFileType(file: File): string {
    const name = file.name.toLowerCase();
    
    if (name.endsWith('.docx')) return 'docx';
    if (name.endsWith('.pdf')) return 'pdf';
    if (name.endsWith('.md')) return 'md';
    if (name.endsWith('.txt')) return 'txt';
    
    return 'txt';
  }
  
  private async parseText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
  
  private async parseDOCX(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await this.parseDocxBuffer(arrayBuffer);
      return result;
    } catch {
      return 'DOCX解析需要后端支持，请使用纯文本或Markdown格式';
    }
  }
  
  private parseDocxBuffer(buffer: ArrayBuffer): Promise<string> {
    return Promise.resolve('DOCX文档内容（前端仅支持预览，完整解析需要后端）');
  }
  
  private async parsePDF(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await this.parsePdfBuffer(arrayBuffer);
      return result;
    } catch {
      return 'PDF解析需要后端支持，请使用纯文本或Markdown格式';
    }
  }
  
  private parsePdfBuffer(buffer: ArrayBuffer): Promise<string> {
    return Promise.resolve('PDF文档内容（前端仅支持预览，完整解析需要后端）');
  }
  
  private extractSections(text: string): DocumentSection[] {
    const sectionRegex = /^(#{1,6}\s+|\d+\.\s+)(.+)$/gm;
    const sections: DocumentSection[] = [];
    let match;
    let lastIndex = 0;
    
    const lines = text.split('\n');
    let currentSection: DocumentSection | null = null;
    let order = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      
      if (headerMatch) {
        if (currentSection) {
          sections.push(currentSection);
        }
        
        const level = headerMatch[1].length;
        const title = headerMatch[2].trim();
        
        currentSection = {
          id: generateUUID(),
          documentId: '',
          title,
          content: title,
          type: this.classifySection(title),
          level,
          order: order++,
          charCount: title.length
        };
      } else if (currentSection && line.trim()) {
        currentSection.content += '\n' + line;
        currentSection.charCount += line.length + 1;
      }
    }
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    if (sections.length === 0) {
      sections.push({
        id: generateUUID(),
        documentId: '',
        title: '文档内容',
        content: text,
        type: SectionType.FUNCTIONAL,
        level: 1,
        order: 0,
        charCount: text.length
      });
    }
    
    return sections;
  }
  
  private classifySection(title: string): SectionType {
    const titleLower = title.toLowerCase();
    
    const functionalKeywords = ['功能', '需求', 'feature', 'functionality', 'user story', 'requirement'];
    const nonFunctionalKeywords = ['非功能', '性能', '安全', 'security', 'performance', 'constraint'];
    const backgroundKeywords = ['背景', '概述', 'background', 'overview', 'introduction'];
    
    if (functionalKeywords.some(kw => titleLower.includes(kw))) return SectionType.FUNCTIONAL;
    if (nonFunctionalKeywords.some(kw => titleLower.includes(kw))) return SectionType.NON_FUNCTIONAL;
    if (backgroundKeywords.some(kw => titleLower.includes(kw))) return SectionType.BACKGROUND;
    
    return SectionType.FUNCTIONAL;
  }
  
  private async generateStories(
    sections: DocumentSection[],
    documentId: string
  ): Promise<any[]> {
    const stories: any[] = [];
    
    for (const section of sections) {
      if (section.type !== SectionType.FUNCTIONAL) continue;
      
      const sentences = this.splitSentences(section.content);
      
      for (const sentence of sentences) {
        const story = await this.storyGenerator.generateFromSentence(sentence, {
          id: section.id,
          title: section.title
        });
        
        if (story) {
          story.documentId = documentId;
          stories.push(story);
        }
      }
    }
    
    return this.deduplicateAndSort(stories);
  }
  
  private splitSentences(text: string): string[] {
    return text
      .replace(/([。！？；\n]+)/g, '$1|')
      .split('|')
      .map(s => s.trim())
      .filter(s => s.length >= 10);
  }
  
  private deduplicateAndSort(stories: any[]): any[] {
    const seen = new Set<string>();
    const unique = stories.filter(story => {
      const key = story.action.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    
    return unique.sort((a, b) => b.confidence.overall - a.confidence.overall);
  }
}

// 导出默认实例（无LLM配置）
export const documentParser = new DocumentParser();
