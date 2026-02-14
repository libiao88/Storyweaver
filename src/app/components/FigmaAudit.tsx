import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { AlertCircle, CheckCircle2, AlertTriangle, ExternalLink, Search, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { toast } from 'sonner';

interface AuditIssue {
  id: string;
  type: 'missing' | 'redundant' | 'inconsistent';
  severity: 'high' | 'medium' | 'low';
  prdReference: string;
  figmaFrame?: string;
  description: string;
  confidence: number;
}

export function FigmaAudit() {
  const [figmaUrl, setFigmaUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);
  const [auditComplete, setAuditComplete] = useState(false);
  const [issues, setIssues] = useState<AuditIssue[]>([]);

  const mockAudit = async () => {
    setIsAuditing(true);
    setAuditProgress(0);

    // Simulate audit process
    const steps = [
      { progress: 20, message: '连接 Figma API...' },
      { progress: 40, message: '提取设计稿元数据...' },
      { progress: 60, message: '分析 PRD 文档...' },
      { progress: 80, message: '语义比对中...' },
      { progress: 100, message: '生成审计报告...' },
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setAuditProgress(step.progress);
      toast.info(step.message);
    }

    // Generate mock issues
    const mockIssues: AuditIssue[] = [
      {
        id: '1',
        type: 'missing',
        severity: 'high',
        prdReference: 'PRD 3.1 节 - 用户登录功能',
        figmaFrame: undefined,
        description: 'PRD 中描述的"记住我"功能在 Figma 设计稿中未找到对应的 Checkbox 组件',
        confidence: 0.92,
      },
      {
        id: '2',
        type: 'redundant',
        severity: 'medium',
        prdReference: undefined,
        figmaFrame: 'Dashboard / Settings Panel',
        description: 'Figma 中存在"高级设置"面板，但 PRD 中未提及此功能需求',
        confidence: 0.88,
      },
      {
        id: '3',
        type: 'inconsistent',
        severity: 'high',
        prdReference: 'PRD 2.4 节 - 搜索功能',
        figmaFrame: 'Home / Search Bar',
        description: 'PRD 描述"搜索框位于页面顶部右侧"，但 Figma 设计稿中搜索框在左侧导航栏',
        confidence: 0.95,
      },
      {
        id: '4',
        type: 'missing',
        severity: 'medium',
        prdReference: 'PRD 3.3 节 - 非功能需求',
        figmaFrame: undefined,
        description: 'PRD 提到的"加载状态骨架屏"在 Figma 设计中缺失',
        confidence: 0.85,
      },
      {
        id: '5',
        type: 'inconsistent',
        severity: 'low',
        prdReference: 'PRD 4.2 节 - 按钮样式',
        figmaFrame: 'Components / Primary Button',
        description: 'PRD 要求主按钮为蓝色，Figma 设计稿使用了紫色',
        confidence: 0.78,
      },
      {
        id: '6',
        type: 'missing',
        severity: 'high',
        prdReference: 'PRD 2.1 节 - 文件上传',
        figmaFrame: undefined,
        description: '文件上传的进度条 UI 在 Figma 中未找到',
        confidence: 0.90,
      },
    ];

    setIssues(mockIssues);
    setAuditComplete(true);
    setIsAuditing(false);
    toast.success('审计完成！');
  };

  const handleStartAudit = () => {
    if (!figmaUrl) {
      toast.error('请输入 Figma 文件 URL');
      return;
    }
    mockAudit();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'missing':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'redundant':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'inconsistent':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'missing':
        return '设计遗漏';
      case 'redundant':
        return '冗余设计';
      case 'inconsistent':
        return '逻辑不一致';
      default:
        return type;
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'missing':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'redundant':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inconsistent':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const stats = {
    total: issues.length,
    high: issues.filter((i) => i.severity === 'high').length,
    medium: issues.filter((i) => i.severity === 'medium').length,
    low: issues.filter((i) => i.severity === 'low').length,
    missing: issues.filter((i) => i.type === 'missing').length,
    redundant: issues.filter((i) => i.type === 'redundant').length,
    inconsistent: issues.filter((i) => i.type === 'inconsistent').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Figma 设计稿审计</h2>
        <p className="text-gray-600 mt-1">自动检测设计与需求的一致性，发现遗漏和冲突</p>
      </div>

      {!auditComplete ? (
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="figma-url">Figma 文件 URL</Label>
              <Input
                id="figma-url"
                value={figmaUrl}
                onChange={(e) => setFigmaUrl(e.target.value)}
                placeholder="https://www.figma.com/file/..."
                className="mt-2"
                disabled={isAuditing}
              />
              <p className="text-xs text-gray-500 mt-1">
                示例: https://www.figma.com/file/ABC123/My-Design
              </p>
            </div>

            <div>
              <Label htmlFor="access-token">Figma Personal Access Token (可选)</Label>
              <Input
                id="access-token"
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="figd_xxx..."
                className="mt-2"
                disabled={isAuditing}
              />
              <p className="text-xs text-gray-500 mt-1">
                用于访问私有文件。如何获取: Figma Settings → Personal Access Tokens
              </p>
            </div>

            {isAuditing && (
              <div className="space-y-2">
                <Progress value={auditProgress} className="h-2" />
                <p className="text-sm text-gray-600 text-center">{auditProgress}% 完成</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleStartAudit} disabled={isAuditing} className="flex-1">
                {isAuditing ? '审计中...' : '开始审计'}
              </Button>
              {isAuditing && (
                <Button variant="outline" onClick={() => setIsAuditing(false)}>
                  取消
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-sm text-gray-600 mb-1">总问题数</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600 mb-1">高优先级</div>
              <div className="text-3xl font-bold text-red-600">{stats.high}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600 mb-1">中优先级</div>
              <div className="text-3xl font-bold text-yellow-600">{stats.medium}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600 mb-1">低优先级</div>
              <div className="text-3xl font-bold text-green-600">{stats.low}</div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">问题类型分布</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-700">{stats.missing}</div>
                <div className="text-sm text-red-600 mt-1">设计遗漏</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-700">{stats.redundant}</div>
                <div className="text-sm text-yellow-600 mt-1">冗余设计</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-700">{stats.inconsistent}</div>
                <div className="text-sm text-orange-600 mt-1">逻辑不一致</div>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">全部问题 ({stats.total})</TabsTrigger>
              <TabsTrigger value="high">高优先级 ({stats.high})</TabsTrigger>
              <TabsTrigger value="missing">设计遗漏 ({stats.missing})</TabsTrigger>
              <TabsTrigger value="inconsistent">不一致 ({stats.inconsistent})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {issues.map((issue) => (
                <Card key={issue.id} className="p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getTypeIcon(issue.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className={getTypeBadgeClass(issue.type)}>
                            {getTypeLabel(issue.type)}
                          </Badge>
                          <Badge variant="outline" className={getSeverityBadgeClass(issue.severity)}>
                            {issue.severity === 'high' ? '高' : issue.severity === 'medium' ? '中' : '低'}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            置信度: {(issue.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-900 mb-3">{issue.description}</p>
                      <div className="space-y-2 text-sm">
                        {issue.prdReference && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <FileText className="h-4 w-4" />
                            <span className="font-medium">PRD 引用:</span>
                            <span>{issue.prdReference}</span>
                          </div>
                        )}
                        {issue.figmaFrame && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <ExternalLink className="h-4 w-4" />
                            <span className="font-medium">Figma 位置:</span>
                            <a
                              href="#"
                              className="text-blue-600 hover:underline"
                              onClick={(e) => {
                                e.preventDefault();
                                toast.info('在实际应用中会打开 Figma 并定位到该节点');
                              }}
                            >
                              {issue.figmaFrame}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="high" className="space-y-3">
              {issues
                .filter((i) => i.severity === 'high')
                .map((issue) => (
                  <Card key={issue.id} className="p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getTypeIcon(issue.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline" className={getTypeBadgeClass(issue.type)}>
                              {getTypeLabel(issue.type)}
                            </Badge>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              置信度: {(issue.confidence * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-900 mb-3">{issue.description}</p>
                        <div className="space-y-2 text-sm">
                          {issue.prdReference && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <FileText className="h-4 w-4" />
                              <span>{issue.prdReference}</span>
                            </div>
                          )}
                          {issue.figmaFrame && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <ExternalLink className="h-4 w-4" />
                              <a href="#" className="text-blue-600 hover:underline">
                                {issue.figmaFrame}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="missing" className="space-y-3">
              {issues
                .filter((i) => i.type === 'missing')
                .map((issue) => (
                  <Card key={issue.id} className="p-5 hover:shadow-md transition-shadow border-red-200">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getTypeIcon(issue.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline" className={getSeverityBadgeClass(issue.severity)}>
                              {issue.severity === 'high' ? '高' : issue.severity === 'medium' ? '中' : '低'}
                            </Badge>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              置信度: {(issue.confidence * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-900 mb-3">{issue.description}</p>
                        {issue.prdReference && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FileText className="h-4 w-4" />
                            <span>{issue.prdReference}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="inconsistent" className="space-y-3">
              {issues
                .filter((i) => i.type === 'inconsistent')
                .map((issue) => (
                  <Card key={issue.id} className="p-5 hover:shadow-md transition-shadow border-orange-200">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getTypeIcon(issue.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline" className={getSeverityBadgeClass(issue.severity)}>
                              {issue.severity === 'high' ? '高' : issue.severity === 'medium' ? '中' : '低'}
                            </Badge>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              置信度: {(issue.confidence * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-900 mb-3">{issue.description}</p>
                        <div className="space-y-2 text-sm">
                          {issue.prdReference && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <FileText className="h-4 w-4" />
                              <span>{issue.prdReference}</span>
                            </div>
                          )}
                          {issue.figmaFrame && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <ExternalLink className="h-4 w-4" />
                              <a href="#" className="text-blue-600 hover:underline">
                                {issue.figmaFrame}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </TabsContent>
          </Tabs>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setAuditComplete(false);
                setIssues([]);
                setFigmaUrl('');
                setAccessToken('');
              }}
            >
              重新审计
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
