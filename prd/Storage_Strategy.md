# StoryWeaver AI - 存储策略设计规范

**版本**: v1.0  
**日期**: 2026-02-14  
**状态**: 设计完成  

---

## 📑 目录

1. [存储架构概览](#1-存储架构概览)
2. [文档存储策略](#2-文档存储策略)
3. [故事数据存储](#3-故事数据存储)
4. [会话管理策略](#4-会话管理策略)
5. [缓存策略](#5-缓存策略)
6. [数据保留与清理](#6-数据保留与清理)
7. [安全与加密](#7-安全与加密)
8. [存储选型对比](#8-存储选型对比)
9. [实施路线图](#9-实施路线图)

---

## 1. 存储架构概览

### 1.1 数据分类

| 数据类型 | 特点 | 存储位置 | 保留策略 |
|----------|------|----------|----------|
| **原始文档** | 大文件、二进制 | 临时文件系统 / 对象存储 | 临时，7天 |
| **解析内容** | 文本、结构化 | 内存 / IndexedDB | 临时，7天 |
| **用户故事** | 核心数据、结构化 | IndexedDB / 数据库 | 长期，用户控制 |
| **故事地图** | 配置数据 | IndexedDB / 数据库 | 长期，用户控制 |
| **审计结果** | 中等大小 | IndexedDB / 数据库 | 临时，30天 |
| **API规范** | 文本、结构化 | IndexedDB / 数据库 | 长期，用户控制 |
| **会话信息** | 元数据 | localStorage / Cookie | 临时，会话级 |
| **用户配置** | 小数据 | localStorage | 长期 |

### 1.2 架构演进路线

```
Phase 1 (MVP)
┌─────────────────────────────────────────────────────┐
│  Browser (Frontend)                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │ localStorage │  │  IndexedDB   │  │  Memory  │  │
│  │  (配置/会话)  │  │ (文档/故事)  │  │ (运行时) │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌──────────────────────┐
              │  Temporary File      │
              │  System (Server)     │
              │  (原始文档存储)       │
              └──────────────────────┘

Phase 2 (可选后端)
┌─────────────────────────────────────────────────────┐
│  Browser (Frontend)                                  │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │ localStorage │  │  IndexedDB   │                 │
│  │  (配置/缓存)  │  │   (缓存)     │                 │
│  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│  Backend (Node.js/FastAPI)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │   SQLite     │  │   Redis      │  │   S3     │  │
│  │   (主数据)    │  │   (缓存)     │  │ (文件)   │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 2. 文档存储策略

### 2.1 存储方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **A. 纯前端 (File API + ArrayBuffer)** | 无后端依赖、隐私性好 | 大文件处理困难、无法持久化 | 小文件、演示环境 |
| **B. 临时文件系统 (Server)** | 支持大文件、易于清理 | 需要后端、单点故障 | 生产环境、大文件 |
| **C. 对象存储 (S3/MinIO/OSS)** | 可扩展、持久化、CDN加速 | 成本高、配置复杂 | 大规模部署 |
| **D. 分片上传 (前端)** | 支持大文件、断点续传 | 实现复杂、需要后端配合 | 超大文件 |

### 2.2 推荐方案 (MVP)

**方案 B: 临时文件系统 + 内存处理**

**架构**:
```
用户上传文件
    │
    ▼
┌──────────────────┐
│ 前端: 文件校验    │ (大小、格式)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 后端: 临时存储    │ (UUID命名, 20MB限制)
│ /tmp/uploads/    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 后端: 异步解析    │ (提取文本, 生成故事)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ 后端: 返回结果    │ (故事JSON)
│ 清理临时文件      │ (延迟删除或立即)
└──────────────────┘
```

**详细设计**:

```typescript
// 临时文件存储配置
interface TempFileConfig {
  // 存储路径
  uploadDir: string;        // '/tmp/storyweaver/uploads/'
  
  // 文件命名策略
  namingStrategy: 'uuid';   // 使用UUID避免冲突
  
  // 文件大小限制
  maxFileSize: number;      // 20 * 1024 * 1024 (20MB)
  
  // 并发上传限制
  maxConcurrentUploads: number;  // 3
  
  // 清理策略
  cleanup: {
    enabled: boolean;       // true
    interval: number;       // 3600000 (1小时检查一次)
    maxAge: number;         // 604800000 (7天)
  };
}

// 文件存储流程
class DocumentStorageService {
  /**
   * 保存上传的文件
   */
  async saveFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<StoredFile> {
    const fileId = generateUUID();
    const fileName = `${fileId}-${sanitizeFilename(originalName)}`;
    const filePath = path.join(config.uploadDir, fileName);
    
    // 写入文件
    await fs.writeFile(filePath, fileBuffer);
    
    return {
      fileId,
      filePath,
      originalName,
      size: fileBuffer.length,
      mimeType,
      createdAt: new Date()
    };
  }
  
  /**
   * 读取文件内容
   */
  async readFile(filePath: string): Promise<Buffer> {
    return fs.readFile(filePath);
  }
  
  /**
   * 删除文件
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // 文件可能已被清理，忽略错误
      if (error.code !== 'ENOENT') throw error;
    }
  }
  
  /**
   * 清理过期文件
   */
  async cleanupExpiredFiles(): Promise<void> {
    const files = await fs.readdir(config.uploadDir);
    const now = Date.now();
    
    for (const file of files) {
      const filePath = path.join(config.uploadDir, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > config.cleanup.maxAge) {
        await this.deleteFile(filePath);
        console.log(`Cleaned up expired file: ${file}`);
      }
    }
  }
}
```

### 2.3 文件上传流程

```typescript
// 前端上传组件
class FileUploadService {
  async uploadFile(file: File): Promise<UploadResult> {
    // 1. 客户端校验
    this.validateFile(file);
    
    // 2. 创建 FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('autoProcess', 'true');
    
    // 3. 上传文件 (带进度)
    const response = await fetch('/api/v1/documents/upload', {
      method: 'POST',
      headers: {
        'X-Session-ID': this.sessionId
      },
      body: formData
    });
    
    // 4. 获取文档ID
    const result = await response.json();
    return result.data;
  }
  
  private validateFile(file: File): void {
    // 文件大小校验
    if (file.size > 20 * 1024 * 1024) {
      throw new Error('FILE_TOO_LARGE');
    }
    
    // 文件类型校验
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
      'application/pdf',
      'text/plain',
      'text/markdown'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      // 再检查扩展名
      const ext = file.name.split('.').pop()?.toLowerCase();
      const allowedExts = ['docx', 'pdf', 'txt', 'md'];
      if (!allowedExts.includes(ext || '')) {
        throw new Error('FILE_TYPE_UNSUPPORTED');
      }
    }
    
    // 空文件校验
    if (file.size === 0) {
      throw new Error('FILE_EMPTY');
    }
  }
}
```

---

## 3. 故事数据存储

### 3.1 浏览器端存储方案

#### 方案 A: IndexedDB (推荐)

**优点**:
- 存储容量大 (通常 50MB+)
- 支持结构化数据
- 支持索引和查询
- 异步操作，不阻塞UI

**缺点**:
- API较复杂
- 用户可清除

**适用**: 核心数据存储 (故事、地图、审计结果)

```typescript
// IndexedDB 数据库设计
const DB_NAME = 'StoryWeaverDB';
const DB_VERSION = 1;

// 存储对象 (Object Stores)
const STORES = {
  documents: 'documents',     // ParsedDocument
  sections: 'sections',       // DocumentSection
  stories: 'stories',         // Story
  storyMaps: 'storyMaps',     // StoryMap
  nodes: 'nodes',             // StoryMapNode
  dependencies: 'dependencies', // Dependency
  audits: 'audits',           // FigmaAudit
  apiSpecs: 'apiSpecs',       // APISpec
  editHistory: 'editHistory'  // EditRecord
};

// 数据库初始化
class IndexedDBService {
  private db: IDBDatabase | null = null;
  
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 1. Documents Store
        const docStore = db.createObjectStore(STORES.documents, { 
          keyPath: 'id' 
        });
        docStore.createIndex('sessionId', 'sessionId', { unique: false });
        docStore.createIndex('status', 'status', { unique: false });
        docStore.createIndex('createdAt', 'createdAt', { unique: false });
        docStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        
        // 2. Stories Store
        const storyStore = db.createObjectStore(STORES.stories, { 
          keyPath: 'id' 
        });
        storyStore.createIndex('documentId', 'documentId', { unique: false });
        storyStore.createIndex('priority', 'priority', { unique: false });
        storyStore.createIndex('module', 'module', { unique: false });
        storyStore.createIndex('status', 'status', { unique: false });
        storyStore.createIndex('confidence.overall', 'confidence.overall', { unique: false });
        
        // 3. StoryMaps Store
        const mapStore = db.createObjectStore(STORES.storyMaps, { 
          keyPath: 'id' 
        });
        mapStore.createIndex('documentId', 'documentId', { unique: true });
        
        // 4. Nodes Store
        const nodeStore = db.createObjectStore(STORES.nodes, { 
          keyPath: 'id' 
        });
        nodeStore.createIndex('storyMapId', 'storyMapId', { unique: false });
        nodeStore.createIndex('storyId', 'storyId', { unique: true });
        
        // 5. 其他 stores...
      };
    });
  }
  
  // CRUD 操作
  async add<T>(storeName: string, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  async get<T>(storeName: string, id: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async getAll<T>(
    storeName: string, 
    indexName?: string, 
    query?: IDBValidKey | IDBKeyRange
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const target = indexName ? store.index(indexName) : store;
      const request = target.getAll(query);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async put<T>(storeName: string, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  async delete(storeName: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  // 清空过期数据
  async cleanupExpired(documentIds: string[]): Promise<void> {
    const transaction = this.db!.transaction(
      [STORES.documents, STORES.stories, STORES.storyMaps], 
      'readwrite'
    );
    
    for (const docId of documentIds) {
      // 删除文档
      transaction.objectStore(STORES.documents).delete(docId);
      
      // 删除关联的故事
      const storyStore = transaction.objectStore(STORES.stories);
      const storyIndex = storyStore.index('documentId');
      const storyRequest = storyIndex.getAllKeys(docId);
      
      storyRequest.onsuccess = () => {
        for (const storyId of storyRequest.result) {
          storyStore.delete(storyId);
        }
      };
    }
  }
}
```

#### 方案 B: localStorage

**优点**:
- API简单
- 同步操作

**缺点**:
- 容量小 (5MB)
- 只能存字符串
- 同步阻塞UI

**适用**: 配置信息、会话ID

```typescript
// localStorage 封装
class LocalStorageService {
  private prefix = 'sw_';
  
  set<T>(key: string, value: T): void {
    const fullKey = this.prefix + key;
    const data = JSON.stringify({
      value,
      timestamp: Date.now()
    });
    localStorage.setItem(fullKey, data);
  }
  
  get<T>(key: string): T | null {
    const fullKey = this.prefix + key;
    const data = localStorage.getItem(fullKey);
    if (!data) return null;
    
    try {
      const parsed = JSON.parse(data);
      return parsed.value as T;
    } catch {
      return null;
    }
  }
  
  remove(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }
  
  // 会话管理
  getSessionId(): string {
    let sessionId = this.get<string>('sessionId');
    if (!sessionId) {
      sessionId = 'sess-' + generateUUID();
      this.set('sessionId', sessionId);
    }
    return sessionId;
  }
  
  // 用户配置
  getUserConfig(): UserConfig {
    return this.get<UserConfig>('userConfig') || {
      theme: 'light',
      language: 'zh-CN',
      defaultExportFormat: 'csv',
      autoSave: true
    };
  }
  
  setUserConfig(config: UserConfig): void {
    this.set('userConfig', config);
  }
}
```

### 3.2 数据同步策略

```typescript
// 数据同步服务
class DataSyncService {
  private db: IndexedDBService;
  private api: ApiService;
  
  // 乐观更新策略
  async updateStory(storyId: string, updates: Partial<Story>): Promise<void> {
    // 1. 先更新本地
    const story = await this.db.get<Story>(STORES.stories, storyId);
    if (!story) throw new Error('Story not found');
    
    const updatedStory = { ...story, ...updates, updatedAt: new Date() };
    await this.db.put(STORES.stories, updatedStory);
    
    // 2. 触发 UI 更新 (Optimistic UI)
    eventBus.emit('story:updated', updatedStory);
    
    // 3. 异步同步到服务器 (如果有后端)
    try {
      await this.api.put(`/stories/${storyId}`, updates);
    } catch (error) {
      // 4. 同步失败，回滚本地数据
      await this.db.put(STORES.stories, story);
      eventBus.emit('story:updateFailed', storyId, error);
      throw error;
    }
  }
  
  // 离线支持 (PWA)
  async queueOfflineOperation(
    operation: 'create' | 'update' | 'delete',
    entity: string,
    data: any
  ): Promise<void> {
    const queue = await this.db.get<any[]>('syncQueue', 'main') || [];
    queue.push({
      id: generateUUID(),
      operation,
      entity,
      data,
      timestamp: Date.now(),
      retryCount: 0
    });
    await this.db.put('syncQueue', { id: 'main', queue });
  }
  
  // 恢复同步
  async processSyncQueue(): Promise<void> {
    const queueData = await this.db.get<{ queue: any[] }>('syncQueue', 'main');
    if (!queueData || queueData.queue.length === 0) return;
    
    const failed: any[] = [];
    
    for (const item of queueData.queue) {
      try {
        switch (item.operation) {
          case 'create':
            await this.api.post(`/${item.entity}`, item.data);
            break;
          case 'update':
            await this.api.put(`/${item.entity}/${item.data.id}`, item.data);
            break;
          case 'delete':
            await this.api.delete(`/${item.entity}/${item.data.id}`);
            break;
        }
      } catch (error) {
        item.retryCount++;
        if (item.retryCount < 3) {
          failed.push(item);
        }
      }
    }
    
    // 更新队列
    await this.db.put('syncQueue', { id: 'main', queue: failed });
  }
}
```

---

## 4. 会话管理策略

### 4.1 会话标识

```typescript
// 会话管理服务
class SessionService {
  private sessionId: string | null = null;
  
  constructor() {
    this.initSession();
  }
  
  private initSession(): void {
    // 从 URL 参数获取 (分享链接)
    const urlParams = new URLSearchParams(window.location.search);
    const sharedSessionId = urlParams.get('session');
    
    if (sharedSessionId) {
      this.sessionId = sharedSessionId;
      localStorage.setItem('sw_sharedSession', sharedSessionId);
    } else {
      // 从 localStorage 获取或创建新会话
      this.sessionId = localStorage.getItem('sw_sessionId');
      if (!this.sessionId) {
        this.sessionId = this.generateSessionId();
        localStorage.setItem('sw_sessionId', this.sessionId);
      }
    }
  }
  
  private generateSessionId(): string {
    return 'sess-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
  
  getSessionId(): string {
    return this.sessionId!;
  }
  
  // 生成分享链接
  getShareUrl(): string {
    return `${window.location.origin}?session=${this.sessionId}`;
  }
  
  // 清除会话
  clearSession(): void {
    localStorage.removeItem('sw_sessionId');
    this.sessionId = this.generateSessionId();
    localStorage.setItem('sw_sessionId', this.sessionId);
  }
}
```

### 4.2 会话数据隔离

```typescript
// 所有数据操作都基于 sessionId
class DataService {
  private sessionId: string;
  
  constructor(sessionService: SessionService) {
    this.sessionId = sessionService.getSessionId();
  }
  
  // 获取当前会话的所有文档
  async getDocuments(): Promise<ParsedDocument[]> {
    return this.db.getAll<ParsedDocument>(
      'documents', 
      'sessionId', 
      this.sessionId
    );
  }
  
  // 保存文档时关联 sessionId
  async saveDocument(doc: ParsedDocument): Promise<void> {
    doc.sessionId = this.sessionId;
    await this.db.put('documents', doc);
  }
}
```

---

## 5. 缓存策略

### 5.1 多级缓存

```
┌─────────────────────────────────────────────┐
│  Level 1: Memory Cache (内存)               │
│  - 最近访问的故事                            │
│  - 当前文档内容                              │
│  - 生命周期: 页面会话                        │
├─────────────────────────────────────────────┤
│  Level 2: IndexedDB (浏览器数据库)           │
│  - 所有故事数据                              │
│  - 解析的文档内容                            │
│  - 生命周期: 长期                            │
├─────────────────────────────────────────────┤
│  Level 3: HTTP Cache (浏览器缓存)            │
│  - 静态资源 (JS/CSS)                         │
│  - API响应 (配置信息)                        │
│  - 生命周期: 按Cache-Control                 │
└─────────────────────────────────────────────┘
```

### 5.2 缓存服务实现

```typescript
// 内存缓存
class MemoryCache<T> {
  private cache = new Map<string, { data: T; expiry: number }>();
  private defaultTTL: number;
  
  constructor(defaultTTL: number = 5 * 60 * 1000) { // 默认5分钟
    this.defaultTTL = defaultTTL;
  }
  
  set(key: string, data: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, expiry });
  }
  
  get(key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.data;
  }
  
  invalidate(key: string): void {
    this.cache.delete(key);
  }
  
  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

// 使用示例
const storyCache = new MemoryCache<Story>(10 * 60 * 1000); // 10分钟
const documentCache = new MemoryCache<ParsedDocument>(30 * 60 * 1000); // 30分钟
```

### 5.3 缓存更新策略

| 策略 | 适用场景 | 实现方式 |
|------|----------|----------|
| **Cache-Aside** | 读多写少 | 先查缓存，无则查DB并写入缓存 |
| **Write-Through** | 数据一致性要求高 | 写DB同时写缓存 |
| **Write-Behind** | 写性能要求高 | 先写缓存，异步写DB |
| **Refresh-Ahead** | 热点数据 | 预加载即将过期的数据 |

---

## 6. 数据保留与清理

### 6.1 数据生命周期

| 数据类型 | 创建时 | 7天后 | 30天后 | 用户主动 |
|----------|--------|-------|--------|----------|
| 原始文档 | ✓ | ✗ 自动删除 | - | ✗ 可删除 |
| 解析内容 | ✓ | ✗ 自动删除 | - | ✗ 可删除 |
| 用户故事 | ✓ | ✓ | ✓ | ✗ 可删除 |
| 故事地图 | ✓ | ✓ | ✓ | ✗ 可删除 |
| 审计结果 | ✓ | ✓ | ✗ 自动删除 | ✗ 可删除 |
| API规范 | ✓ | ✓ | ✓ | ✗ 可删除 |

### 6.2 自动清理服务

```typescript
// 数据清理服务
class CleanupService {
  private db: IndexedDBService;
  private retentionDays = 7;
  
  constructor(db: IndexedDBService) {
    this.db = db;
    this.scheduleCleanup();
  }
  
  // 定期清理
  private scheduleCleanup(): void {
    // 页面加载时检查
    this.cleanup();
    
    // 每24小时检查一次
    setInterval(() => {
      this.cleanup();
    }, 24 * 60 * 60 * 1000);
  }
  
  async cleanup(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);
    
    console.log(`Running cleanup for data before ${cutoffDate.toISOString()}`);
    
    // 1. 清理过期文档
    await this.cleanupDocuments(cutoffDate);
    
    // 2. 清理孤立数据
    await this.cleanupOrphanData();
    
    // 3. 清理过期审计结果 (30天)
    await this.cleanupAudits();
  }
  
  private async cleanupDocuments(cutoffDate: Date): Promise<void> {
    const allDocs = await this.db.getAll<ParsedDocument>('documents');
    const expiredDocs = allDocs.filter(
      doc => new Date(doc.createdAt) < cutoffDate
    );
    
    for (const doc of expiredDocs) {
      await this.deleteDocumentAndRelated(doc.id);
    }
    
    console.log(`Cleaned up ${expiredDocs.length} expired documents`);
  }
  
  private async deleteDocumentAndRelated(documentId: string): Promise<void> {
    const transaction = this.db['db']!.transaction(
      ['documents', 'sections', 'stories', 'storyMaps'],
      'readwrite'
    );
    
    // 删除文档
    transaction.objectStore('documents').delete(documentId);
    
    // 删除章节
    const sectionStore = transaction.objectStore('sections');
    const sectionIndex = sectionStore.index('documentId');
    const sections = await this.db.getAll<DocumentSection>('sections', 'documentId', documentId);
    for (const section of sections) {
      sectionStore.delete(section.id);
    }
    
    // 删除故事
    const storyStore = transaction.objectStore('stories');
    const stories = await this.db.getAll<Story>('stories', 'documentId', documentId);
    for (const story of stories) {
      storyStore.delete(story.id);
    }
    
    // 删除故事地图
    const mapStore = transaction.objectStore('storyMaps');
    const maps = await this.db.getAll<StoryMap>('storyMaps', 'documentId', documentId);
    for (const map of maps) {
      mapStore.delete(map.id);
    }
  }
  
  // 清理孤立数据 (没有关联文档的数据)
  private async cleanupOrphanData(): Promise<void> {
    const allDocs = await this.db.getAll<ParsedDocument>('documents');
    const validDocIds = new Set(allDocs.map(d => d.id));
    
    // 检查并清理孤立的故事
    const allStories = await this.db.getAll<Story>('stories');
    const orphanStories = allStories.filter(s => !validDocIds.has(s.documentId));
    
    for (const story of orphanStories) {
      await this.db.delete('stories', story.id);
    }
    
    console.log(`Cleaned up ${orphanStories.length} orphan stories`);
  }
  
  // 清理过期审计结果
  private async cleanupAudits(): Promise<void> {
    const auditRetentionDays = 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - auditRetentionDays);
    
    const allAudits = await this.db.getAll<FigmaAudit>('audits');
    const expiredAudits = allAudits.filter(
      audit => new Date(audit.createdAt) < cutoffDate
    );
    
    for (const audit of expiredAudits) {
      await this.db.delete('audits', audit.id);
    }
    
    console.log(`Cleaned up ${expiredAudits.length} expired audits`);
  }
}
```

---

## 7. 安全与加密

### 7.1 敏感数据

| 数据类型 | 敏感级别 | 处理方式 |
|----------|----------|----------|
| Figma Token | 高 | AES-256加密存储 |
| Lark App Secret | 高 | AES-256加密存储 (飞书Wiki已移除) |
| PRD文档内容 | 中 | 临时存储，定期清理 |
| 用户故事 | 低 | 明文存储 |
| 会话ID | 中 | localStorage存储 |

### 7.2 客户端加密 (Figma Token)

```typescript
// 加密服务
class EncryptionService {
  private key: CryptoKey | null = null;
  
  // 从用户密码派生密钥
  async init(password: string): Promise<void> {
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    
    // 使用 PBKDF2 派生密钥
    const baseKey = await crypto.subtle.importKey(
      'raw',
      passwordData,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    this.key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('storyweaver-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  async encrypt(data: string): Promise<string> {
    if (!this.key) throw new Error('Encryption not initialized');
    
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.key,
      encoder.encode(data)
    );
    
    // 返回 base64 编码的 IV + ciphertext
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  }
  
  async decrypt(encryptedData: string): Promise<string> {
    if (!this.key) throw new Error('Encryption not initialized');
    
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(c => c.charCodeAt(0))
    );
    
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.key,
      ciphertext
    );
    
    return new TextDecoder().decode(decrypted);
  }
}

// 使用示例
class FigmaTokenService {
  private encryption: EncryptionService;
  
  async saveToken(token: string, password: string): Promise<void> {
    await this.encryption.init(password);
    const encrypted = await this.encryption.encrypt(token);
    localStorage.setItem('sw_figma_token', encrypted);
  }
  
  async getToken(password: string): Promise<string | null> {
    const encrypted = localStorage.getItem('sw_figma_token');
    if (!encrypted) return null;
    
    await this.encryption.init(password);
    return this.encryption.decrypt(encrypted);
  }
}
```

---

## 8. 存储选型对比

### 8.1 前端存储对比

| 特性 | localStorage | sessionStorage | IndexedDB | Cookies |
|------|--------------|----------------|-----------|---------|
| **容量** | 5MB | 5MB | 50MB+ | 4KB |
| **持久性** | 永久 | 标签页 | 永久 | 可配置 |
| **数据类型** | 字符串 | 字符串 | 结构化 | 字符串 |
| **同步/异步** | 同步 | 同步 | 异步 | 同步 |
| **索引支持** | ❌ | ❌ | ✅ | ❌ |
| **适用场景** | 配置 | 临时状态 | 核心数据 | 认证 |

### 8.2 后端存储对比

| 方案 | 成本 | 复杂度 | 可扩展性 | 适用阶段 |
|------|------|--------|----------|----------|
| **纯前端** | 免费 | 低 | 差 | MVP |
| **SQLite** | 低 | 中 | 差 | 小团队 |
| **PostgreSQL** | 中 | 高 | 好 | 生产环境 |
| **云数据库** | 中-高 | 中 | 很好 | 大规模 |

---

## 9. 实施路线图

### Phase 1 (MVP)

**Week 1**: 基础存储架构
- [ ] IndexedDB 数据库设计
- [ ] 基础 CRUD 封装
- [ ] localStorage 配置存储

**Week 2**: 文档存储
- [ ] 临时文件系统实现
- [ ] 上传/下载接口
- [ ] 文件清理任务

**Week 3**: 数据服务层
- [ ] DocumentService
- [ ] StoryService
- [ ] 缓存集成

**Week 4**: 会话管理
- [ ] SessionService
- [ ] 数据隔离
- [ ] 分享链接

### Phase 2 (扩展)

**Week 7**: 故事地图存储
- [ ] StoryMap 数据模型
- [ ] 节点存储优化
- [ ] 依赖关系存储

**Week 9**: Figma 审计存储
- [ ] 审计结果存储
- [ ] 大规模数据处理
- [ ] 结果缓存

**Week 11**: 后端集成 (可选)
- [ ] 数据库选型
- [ ] API 迁移
- [ ] 数据同步

---

## 附录: 存储配额估算

| 数据类型 | 单条大小 | 最大数量 | 总大小 |
|----------|----------|----------|--------|
| 文档元数据 | 2KB | 100 | 200KB |
| 章节数据 | 10KB | 1,000 | 10MB |
| 用户故事 | 5KB | 2,000 | 10MB |
| 故事地图 | 20KB | 50 | 1MB |
| 审计结果 | 50KB | 100 | 5MB |
| API规范 | 30KB | 100 | 3MB |
| **总计** | - | - | **~30MB** |

> 注: 现代浏览器 IndexedDB 配额通常在 50MB-250MB，满足需求。

---

**文档结束**

*本存储策略为 StoryWeaver AI 提供完整的数据持久化方案，确保数据安全、性能和可扩展性。*
