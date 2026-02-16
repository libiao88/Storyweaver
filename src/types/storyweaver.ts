// types/storyweaver.ts

// ============================================
// 核心数据模型定义
// 基于 PRD Data_Model_Specification.md
// ============================================

// 枚举定义

export enum DocumentStatus {
  UPLOADED = 'uploaded',
  PARSING = 'parsing',
  ANALYZING = 'analyzing',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

export enum SectionType {
  BACKGROUND = 'background',
  FUNCTIONAL = 'functional',
  NON_FUNCTIONAL = 'non-functional',
  FLOW = 'flow',
  UI = 'ui',
  API = 'api',
  ACCEPTANCE = 'acceptance',
  OTHER = 'other'
}

export enum Priority {
  P0 = 'P0',
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3'
}

export enum StoryStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IMPLEMENTED = 'implemented',
  ARCHIVED = 'archived'
}

export enum ConfidenceLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum ErrorCode {
  FILE_TOO_LARGE = 'FILE_001',
  FILE_EMPTY = 'FILE_002',
  FILE_TYPE_UNSUPPORTED = 'FILE_003',
  FILE_CORRUPTED = 'FILE_004',
  FILE_SCANNED_PDF = 'FILE_005',
  FILE_NOT_FOUND = 'FILE_006',
  PARSE_FAILED = 'PARSE_001',
  PARSE_TIMEOUT = 'PARSE_002',
  PARSE_PARTIAL = 'PARSE_003',
  GEN_FAILED = 'GEN_001',
  GEN_NO_CONTENT = 'GEN_002',
  GEN_EMPTY_RESULT = 'GEN_003'
}

// 置信度评分

export interface ConfidenceScore {
  overall: number;
  level: ConfidenceLevel;
  factors: {
    templateMatch: number;
    roleClarity: number;
    actionClarity: number;
    valueClarity: number;
    sourceLength: number;
    languageClarity: number;
  };
  reasons: string[];
  needsReview: boolean;
}

// 原文引用

export interface SourceReference {
  text: string;
  sectionId: string;
  sectionTitle: string;
  startPosition?: number;
  endPosition?: number;
  context?: {
    before: string;
    after: string;
  };
}

// 文档章节

export interface DocumentSection {
  id: string;
  documentId: string;
  title: string;
  content: string;
  type: SectionType;
  level: number;
  order: number;
  startPosition?: number;
  endPosition?: number;
  charCount: number;
  parentId?: string;
  childrenIds?: string[];
}

// 用户故事

export interface Story {
  id: string;
  documentId: string;
  title: string;
  description: string;
  role: string;
  action: string;
  value: string;
  module: string;
  priority: Priority;
  confidence: ConfidenceScore;
  sourceReference: SourceReference;
  acceptanceCriteria?: string[];
  storyPoints?: number;
  tags?: string[];
  status: StoryStatus;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
}

// 解析的文档

export interface ParsedDocument {
  id: string;
  fileName: string;
  fileType: 'docx' | 'pdf' | 'txt' | 'md';
  fileSize: number;
  mimeType?: string;
  status: DocumentStatus;
  progress: number;
  rawContent?: string;
  totalChars?: number;
  sections?: DocumentSection[];
  sectionCount?: number;
  stories?: Story[];
  storyCount?: number;
  averageConfidence?: number;
  errorMessage?: string;
  errorCode?: ErrorCode;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  sessionId: string;
  userId?: string;
}

// 编辑记录

export interface EditRecord {
  id: string;
  storyId: string;
  field: string;
  oldValue: string | string[] | number;
  newValue: string | string[] | number;
  editor: string;
  reason?: string;
  timestamp: Date;
}

// App错误

export interface AppError {
  code: string;
  message: string;
  data?: any;
  help?: string;
  action?: string;
  retryable?: boolean;
  retryAfter?: number;
  traceId: string;
  documentation?: string;
}

// 工具函数

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function generateTraceId(): string {
  return 'trace-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
}
