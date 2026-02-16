# StoryWeaver AI - 认证与权限设计规范

**版本**: v1.0  
**日期**: 2026-02-14  
**状态**: 设计完成  

---

## 📑 目录

1. [认证策略概览](#1-认证策略概览)
2. [Phase 1: 匿名会话认证](#2-phase-1-匿名会话认证)
3. [Phase 2: 用户账号认证](#3-phase-2-用户账号认证)
4. [权限模型](#4-权限模型)
5. [第三方集成认证](#5-第三方集成认证)
6. [安全规范](#6-安全规范)
7. [实现示例](#7-实现示例)

---

## 1. 认证策略概览

### 1.1 演进路线

```
Phase 1 (MVP)
└── 匿名会话认证
    ├── 基于 Session ID
    ├── 浏览器本地存储
    └── 数据隔离但无需登录

Phase 2 (用户系统)
└── 账号认证
    ├── 邮箱/密码登录
    ├── OAuth (GitHub/Google)
    └── JWT Token

Phase 3 (企业版)
└── 企业认证
    ├── SSO (SAML/OIDC)
    ├── LDAP集成
    └── 角色权限管理
```

### 1.2 认证方式对比

| 方式 | 适用阶段 | 优点 | 缺点 | 实现复杂度 |
|------|----------|------|------|------------|
| **Session ID** | Phase 1 | 简单、无登录门槛 | 无法跨设备、数据易丢失 | ⭐ |
| **JWT Token** | Phase 2 | 无状态、可扩展 | Token管理复杂 | ⭐⭐⭐ |
| **OAuth 2.0** | Phase 2 | 用户体验好 | 依赖第三方 | ⭐⭐⭐ |
| **SSO** | Phase 3 | 企业友好 | 配置复杂 | ⭐⭐⭐⭐ |

---

## 2. Phase 1: 匿名会话认证

### 2.1 设计原则

- **零门槛**: 用户无需注册即可使用
- **数据隔离**: 不同用户数据完全隔离
- **临时性**: 数据可设置过期时间
- **可迁移**: 支持后续升级为正式账号

### 2.2 Session ID 机制

```typescript
// services/SessionManager.ts
class SessionManager {
  private SESSION_KEY = 'sw_session_id';
  private sessionId: string | null = null;
  
  /**
   * 获取或创建会话ID
   */
  getSessionId(): string {
    if (this.sessionId) return this.sessionId;
    
    // 1. 从 URL 参数获取 (分享链接)
    const urlParams = new URLSearchParams(window.location.search);
    const sharedSession = urlParams.get('session');
    
    if (sharedSession) {
      this.sessionId = sharedSession;
      // 保存到本地，但不覆盖原有的
      sessionStorage.setItem('sw_shared_session', sharedSession);
      return this.sessionId;
    }
    
    // 2. 从 sessionStorage 获取 (当前标签页)
    this.sessionId = sessionStorage.getItem(this.SESSION_KEY);
    if (this.sessionId) return this.sessionId;
    
    // 3. 从 localStorage 获取 (持久化)
    this.sessionId = localStorage.getItem(this.SESSION_KEY);
    if (this.sessionId) {
      // 同步到 sessionStorage
      sessionStorage.setItem(this.SESSION_KEY, this.sessionId);
      return this.sessionId;
    }
    
    // 4. 创建新会话
    this.sessionId = this.generateSessionId();
    this.saveSession(this.sessionId);
    return this.sessionId;
  }
  
  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `sess_${timestamp}_${random}`;
  }
  
  /**
   * 保存会话
   */
  private saveSession(sessionId: string): void {
    localStorage.setItem(this.SESSION_KEY, sessionId);
    sessionStorage.setItem(this.SESSION_KEY, sessionId);
  }
  
  /**
   * 生成分享链接
   */
  getShareUrl(): string {
    const sessionId = this.getSessionId();
    return `${window.location.origin}?session=${sessionId}`;
  }
  
  /**
   * 切换会话 (用于查看他人分享的数据)
   */
  switchSession(sessionId: string): void {
    sessionStorage.setItem('sw_viewing_session', sessionId);
    // 重新加载页面以新会话身份获取数据
    window.location.reload();
  }
  
  /**
   * 恢复原始会话
   */
  restoreOriginalSession(): void {
    sessionStorage.removeItem('sw_viewing_session');
    window.location.reload();
  }
  
  /**
   * 获取当前有效的会话ID (可能是查看模式)
   */
  getEffectiveSessionId(): string {
    // 优先使用查看模式会话
    const viewingSession = sessionStorage.getItem('sw_viewing_session');
    if (viewingSession) return viewingSession;
    
    return this.getSessionId();
  }
  
  /**
   * 迁移到用户账号
   */
  async migrateToUser(userId: string): Promise<void> {
    const anonymousSessionId = this.getSessionId();
    
    // 调用 API 迁移数据
    await api.post('/auth/migrate', {
      anonymousSessionId,
      userId
    });
    
    // 清除匿名会话
    this.clearSession();
  }
  
  /**
   * 清除会话
   */
  clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
    sessionStorage.removeItem(this.SESSION_KEY);
    this.sessionId = null;
  }
  
  /**
   * 是否处于查看他人数据模式
   */
  isViewingMode(): boolean {
    return !!sessionStorage.getItem('sw_viewing_session');
  }
}

export const sessionManager = new SessionManager();
```

### 2.3 数据隔离策略

```typescript
// 所有数据操作都基于 sessionId
class DataService {
  private sessionId: string;
  
  constructor() {
    this.sessionId = sessionManager.getEffectiveSessionId();
  }
  
  /**
   * 获取当前会话的所有文档
   */
  async getDocuments(): Promise<ParsedDocument[]> {
    return db.getAll('documents', 'sessionId', this.sessionId);
  }
  
  /**
   * 保存文档
   */
  async saveDocument(doc: ParsedDocument): Promise<void> {
    doc.sessionId = this.sessionId;
    await db.put('documents', doc);
  }
  
  /**
   * 检查是否有权限操作该资源
   */
  async hasPermission(resourceId: string, resourceType: string): Promise<boolean> {
    const resource = await db.get(resourceType, resourceId);
    if (!resource) return false;
    return resource.sessionId === this.sessionId;
  }
}
```

### 2.4 限制与配额

```typescript
// 匿名用户限制
const ANONYMOUS_LIMITS = {
  // 最大文档数
  maxDocuments: 10,
  
  // 最大故事数
  maxStories: 500,
  
  // 数据保留天数
  dataRetentionDays: 7,
  
  // 每日上传次数
  dailyUploadLimit: 20,
  
  // 单日导出次数
  dailyExportLimit: 50,
  
  // 不支持的功能
  unsupportedFeatures: [
    'collaboration',      // 协作编辑
    'advanced_analytics', // 高级分析
    'api_access',         // API访问
    'webhook',           // Webhook
    'custom_templates',   // 自定义模板
    'priority_support'    // 优先支持
  ]
};

// 检查限制
class QuotaService {
  async checkUploadQuota(): Promise<{ allowed: boolean; reason?: string }> {
    const documents = await dataService.getDocuments();
    
    if (documents.length >= ANONYMOUS_LIMITS.maxDocuments) {
      return {
        allowed: false,
        reason: `匿名用户最多只能保存 ${ANONYMOUS_LIMITS.maxDocuments} 个文档。请注册账号以获得更多空间。`
      };
    }
    
    // 检查每日上传限制
    const todayUploads = await this.getTodayUploadCount();
    if (todayUploads >= ANONYMOUS_LIMITS.dailyUploadLimit) {
      return {
        allowed: false,
        reason: `今日上传次数已达上限 (${ANONYMOUS_LIMITS.dailyUploadLimit}次)，请明天再试或注册账号。`
      };
    }
    
    return { allowed: true };
  }
}
```

---

## 3. Phase 2: 用户账号认证

### 3.1 认证方式

#### 3.1.1 邮箱/密码登录

**注册流程**:
```
1. 用户输入邮箱和密码
2. 前端校验密码强度
3. 发送注册请求
4. 后端发送验证邮件
5. 用户点击验证链接
6. 账号激活成功
```

**登录流程**:
```
1. 用户输入邮箱和密码
2. 后端验证凭据
3. 生成 JWT Token
4. 返回 Token 和用户信息
5. 前端存储 Token
6. 迁移匿名数据（如有）
```

#### 3.1.2 OAuth 登录

**支持平台**:
- GitHub
- Google
- 微信 (可选)

**流程**:
```
1. 用户点击 OAuth 登录按钮
2. 跳转到第三方授权页
3. 用户授权
4. 第三方回调到我们的页面
5. 后端验证并创建/绑定账号
6. 返回 JWT Token
```

### 3.2 JWT Token 设计

```typescript
// Token 结构
interface JWTPayload {
  // 用户ID
  sub: string;           // "user_550e8400-e29b-41d4-a716-446655440000"
  
  // 邮箱
  email: string;         // "user@example.com"
  
  // 用户类型
  type: 'free' | 'pro' | 'enterprise';
  
  // 权限列表
  permissions: string[]; // ['read', 'write', 'export']
  
  // 颁发时间
  iat: number;          // 1707912000
  
  // 过期时间 (24小时)
  exp: number;          // 1707998400
  
  // 令牌ID
  jti: string;          // 用于吊销
}

// Token 管理
class TokenManager {
  private ACCESS_TOKEN_KEY = 'sw_access_token';
  private REFRESH_TOKEN_KEY = 'sw_refresh_token';
  
  /**
   * 存储 Token
   */
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }
  
  /**
   * 获取 Access Token
   */
  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }
  
  /**
   * 获取 Refresh Token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }
  
  /**
   * 清除 Token
   */
  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
  
  /**
   * 检查 Token 是否即将过期
   */
  isTokenExpiringSoon(bufferTime: number = 5 * 60 * 1000): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expTime = payload.exp * 1000;
      return Date.now() + bufferTime >= expTime;
    } catch {
      return true;
    }
  }
  
  /**
   * 刷新 Token
   */
  async refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token');
    }
    
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    if (!response.ok) {
      throw new Error('Refresh failed');
    }
    
    const { accessToken, refreshToken: newRefreshToken } = await response.json();
    this.setTokens(accessToken, newRefreshToken);
    return accessToken;
  }
}

export const tokenManager = new TokenManager();
```

### 3.3 API 认证中间件

```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 需要认证的接口白名单
const PUBLIC_PATHS = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/refresh',
  '/api/v1/auth/oauth',
  '/api/v1/health'
];

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 公开接口放行
  if (PUBLIC_PATHS.includes(req.path)) {
    return next();
  }
  
  // 获取 Token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      code: 'AUTH_001',
      message: '缺少认证信息'
    });
  }
  
  const token = authHeader.substring(7);
  
  try {
    // 验证 Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // 检查 Token 是否被吊销
    if (isTokenRevoked(decoded.jti)) {
      return res.status(401).json({
        success: false,
        code: 'AUTH_003',
        message: 'Token 已失效'
      });
    }
    
    // 将用户信息附加到请求
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      type: decoded.type,
      permissions: decoded.permissions
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'AUTH_002',
        message: 'Token 已过期'
      });
    }
    
    return res.status(401).json({
      success: false,
      code: 'AUTH_003',
      message: 'Token 无效'
    });
  }
};
```

---

## 4. 权限模型

### 4.1 角色定义

| 角色 | 权限 | 适用对象 |
|------|------|----------|
| **anonymous** | 基础功能、有限配额 | 未登录用户 |
| **user** | 完整功能、标准配额 | 免费注册用户 |
| **pro** | 高级功能、更大配额 | 付费用户 |
| **admin** | 所有功能、管理权限 | 管理员 |

### 4.2 权限矩阵

| 功能 | anonymous | user | pro | admin |
|------|-----------|------|-----|-------|
| 文档上传 | ✅ (10) | ✅ (100) | ✅ (无限) | ✅ |
| 故事生成 | ✅ | ✅ | ✅ | ✅ |
| 故事编辑 | ✅ | ✅ | ✅ | ✅ |
| 导出 CSV | ✅ (50/日) | ✅ (500/日) | ✅ (无限) | ✅ |
| 故事地图 | ❌ | ✅ | ✅ | ✅ |
| Figma 审计 | ❌ | ✅ (10/月) | ✅ (100/月) | ✅ |
| API 生成 | ❌ | ✅ | ✅ | ✅ |
| 协作分享 | ❌ | ✅ | ✅ | ✅ |
| Webhook | ❌ | ❌ | ✅ | ✅ |
| 自定义模板 | ❌ | ❌ | ✅ | ✅ |
| 数据分析 | ❌ | ❌ | ✅ | ✅ |
| 用户管理 | ❌ | ❌ | ❌ | ✅ |

### 4.3 权限检查

```typescript
// services/PermissionService.ts
class PermissionService {
  /**
   * 检查用户是否有权限
   */
  hasPermission(
    user: User | null,
    permission: string,
    resource?: Resource
  ): boolean {
    // 未登录用户检查
    if (!user) {
      return this.checkAnonymousPermission(permission);
    }
    
    // 管理员拥有所有权限
    if (user.role === 'admin') return true;
    
    // 检查具体权限
    return user.permissions.includes(permission);
  }
  
  /**
   * 检查资源所有权
   */
  isOwner(user: User, resource: Resource): boolean {
    return resource.ownerId === user.id;
  }
  
  /**
   * 检查是否可以编辑资源
   */
  canEdit(user: User | null, resource: Resource): boolean {
    // 所有者可以编辑
    if (user && this.isOwner(user, resource)) return true;
    
    // 协作者可以编辑
    if (resource.collaborators?.includes(user?.id || '')) return true;
    
    return false;
  }
  
  private checkAnonymousPermission(permission: string): boolean {
    const anonymousPermissions = [
      'document:upload',
      'document:read',
      'story:read',
      'story:create',
      'story:update',
      'story:delete',
      'export:csv',
      'export:markdown'
    ];
    
    return anonymousPermissions.includes(permission);
  }
}

// React Hook
export const usePermission = () => {
  const { user } = useAuth();
  
  return {
    can: (permission: string) => permissionService.hasPermission(user, permission),
    isOwner: (resource: Resource) => user && permissionService.isOwner(user, resource),
    canEdit: (resource: Resource) => permissionService.canEdit(user, resource)
  };
};

// 组件中使用
const StoryCard = ({ story }: { story: Story }) => {
  const { canEdit } = usePermission();
  
  return (
    <div>
      <h3>{story.title}</h3>
      {canEdit(story) && (
        <button onClick={() => handleEdit(story)}>编辑</button>
      )}
    </div>
  );
};
```

---

## 5. 第三方集成认证

### 5.1 Figma Token 管理

```typescript
// services/FigmaAuthService.ts
class FigmaAuthService {
  private TOKEN_KEY = 'sw_figma_token';
  
  /**
   * 保存 Figma Token (加密存储)
   */
  async saveToken(token: string): Promise<void> {
    // 使用用户密码派生密钥加密
    const encrypted = await encryptionService.encrypt(token);
    localStorage.setItem(this.TOKEN_KEY, encrypted);
  }
  
  /**
   * 获取 Figma Token
   */
  async getToken(): Promise<string | null> {
    const encrypted = localStorage.getItem(this.TOKEN_KEY);
    if (!encrypted) return null;
    
    try {
      return await encryptionService.decrypt(encrypted);
    } catch {
      // 解密失败，清除Token
      this.clearToken();
      return null;
    }
  }
  
  /**
   * 清除 Token
   */
  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
  
  /**
   * 验证 Token 是否有效
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.figma.com/v1/me', {
        headers: { 'X-Figma-Token': token }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
```

### 5.2 第三方 OAuth 流程

```typescript
// OAuth 登录流程
class OAuthService {
  /**
   * 启动 GitHub OAuth 流程
   */
  async loginWithGitHub(): Promise<void> {
    const state = generateRandomState();
    sessionStorage.setItem('oauth_state', state);
    
    const params = new URLSearchParams({
      client_id: process.env.REACT_APP_GITHUB_CLIENT_ID!,
      redirect_uri: `${window.location.origin}/auth/callback/github`,
      scope: 'user:email',
      state
    });
    
    window.location.href = `https://github.com/login/oauth/authorize?${params}`;
  }
  
  /**
   * 处理 OAuth 回调
   */
  async handleCallback(provider: string, code: string, state: string): Promise<void> {
    // 验证 state
    const savedState = sessionStorage.getItem('oauth_state');
    if (state !== savedState) {
      throw new Error('Invalid state');
    }
    
    // 调用后端完成登录
    const response = await api.post('/auth/oauth/callback', {
      provider,
      code
    });
    
    // 保存 Token
    tokenManager.setTokens(response.accessToken, response.refreshToken);
    
    // 迁移匿名数据
    await sessionManager.migrateToUser(response.user.id);
  }
}
```

---

## 6. 安全规范

### 6.1 密码安全

```typescript
// 密码策略
const PASSWORD_POLICY = {
  // 最小长度
  minLength: 8,
  
  // 最大长度
  maxLength: 128,
  
  // 必须包含小写字母
  requireLowercase: true,
  
  // 必须包含大写字母
  requireUppercase: true,
  
  // 必须包含数字
  requireDigit: true,
  
  // 必须包含特殊字符
  requireSpecialChar: false,
  
  // 不能包含用户名
  noUsername: true,
  
  // 常用密码检查
  checkCommonPasswords: true
};

// 密码强度检查
export const checkPasswordStrength = (password: string): {
  score: number; // 0-4
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  let score = 0;
  
  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(`密码长度至少 ${PASSWORD_POLICY.minLength} 位`);
  } else {
    score++;
  }
  
  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('密码必须包含小写字母');
  } else {
    score++;
  }
  
  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('密码必须包含大写字母');
  } else {
    score++;
  }
  
  if (PASSWORD_POLICY.requireDigit && !/\d/.test(password)) {
    errors.push('密码必须包含数字');
  } else {
    score++;
  }
  
  return {
    score,
    isValid: errors.length === 0,
    errors
  };
};
```

### 6.2 安全措施清单

- [x] **密码加密**: 使用 bcrypt 存储密码哈希
- [x] **Token 过期**: JWT 设置合理的过期时间 (24小时)
- [x] **Token 刷新**: 使用 Refresh Token 机制
- [x] **Token 吊销**: 支持 Token 黑名单
- [x] **HTTPS 强制**: 所有 API 使用 HTTPS
- [x] **CORS 配置**: 限制跨域请求来源
- [x] **Rate Limiting**: 限制登录尝试次数
- [x] **敏感数据加密**: Figma Token 等加密存储
- [x] **审计日志**: 记录登录和敏感操作

---

## 7. 实现示例

### 7.1 登录页面

```typescript
// pages/Login.tsx
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      // 登录成功，跳转
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-page">
      <h1>登录 StoryWeaver</h1>
      
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
      
      <div className="oauth-buttons">
        <button onClick={() => oauthService.loginWithGitHub()}>
          使用 GitHub 登录
        </button>
        <button onClick={() => oauthService.loginWithGoogle()}>
          使用 Google 登录
        </button>
      </div>
      
      <p>
        还没有账号？<Link to="/register">立即注册</Link>
      </p>
      
      <p className="anonymous-tip">
        💡 提示：您也可以不登录直接使用，但数据仅在当前设备保存
      </p>
    </div>
  );
};
```

### 7.2 权限守卫组件

```typescript
// components/PermissionGuard.tsx
interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard = ({
  permission,
  children,
  fallback
}: PermissionGuardProps) => {
  const { can } = usePermission();
  
  if (!can(permission)) {
    return fallback || (
      <div className="permission-denied">
        <p>您没有权限访问此功能</p>
        <Link to="/pricing">升级账号</Link>
      </div>
    );
  }
  
  return <>{children}</>;
};

// 使用
<PermissionGuard permission="storymap:read">
  <StoryMapView />
</PermissionGuard>
```

---

**文档结束**

*本认证与权限设计规范为 StoryWeaver AI 提供完整的用户认证和权限管理方案，支持从匿名用户到企业用户的平滑演进。*
