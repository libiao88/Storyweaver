import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Download, Code, FileJson, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface APIEndpoint {
  path: string;
  method: string;
  summary: string;
  description: string;
  requestBody?: {
    fields: Array<{ name: string; type: string; required: boolean; description: string }>;
  };
  responses: {
    [code: string]: {
      description: string;
      fields?: Array<{ name: string; type: string; description: string }>;
    };
  };
  source: {
    prd: string;
    figma?: string;
  };
}

export function APIGenerator() {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [copiedYaml, setCopiedYaml] = useState(false);

  const generateAPIs = async () => {
    setGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockEndpoints: APIEndpoint[] = [
      {
        path: '/api/auth/login',
        method: 'POST',
        summary: '用户登录',
        description: '用户通过邮箱和密码登录系统',
        requestBody: {
          fields: [
            { name: 'email', type: 'string', required: true, description: '用户邮箱地址' },
            { name: 'password', type: 'string', required: true, description: '用户密码' },
            { name: 'remember_me', type: 'boolean', required: false, description: '记住我选项' },
          ],
        },
        responses: {
          '200': {
            description: '登录成功',
            fields: [
              { name: 'token', type: 'string', description: 'JWT 访问令牌' },
              { name: 'user', type: 'object', description: '用户信息对象' },
              { name: 'expires_at', type: 'string', description: '令牌过期时间 (ISO 8601)' },
            ],
          },
          '401': {
            description: '认证失败 - 邮箱或密码错误',
          },
        },
        source: {
          prd: 'PRD 3.1 节 - 用户登录功能',
          figma: 'Login Page / Login Form',
        },
      },
      {
        path: '/api/documents/upload',
        method: 'POST',
        summary: '上传 PRD 文档',
        description: '上传产品需求文档以进行智能解析',
        requestBody: {
          fields: [
            { name: 'file', type: 'file', required: true, description: '文档文件 (.docx, .pdf, .txt, .md)' },
            { name: 'project_id', type: 'string', required: false, description: '关联的项目 ID' },
          ],
        },
        responses: {
          '200': {
            description: '上传成功',
            fields: [
              { name: 'file_id', type: 'string', description: '文件唯一标识符' },
              { name: 'status', type: 'string', description: '处理状态: pending, processing, completed' },
              { name: 'uploaded_at', type: 'string', description: '上传时间' },
            ],
          },
          '400': {
            description: '请求错误 - 文件格式不支持或文件过大',
          },
        },
        source: {
          prd: 'PRD 2.1 节 - 文档上传模块',
          figma: 'Dashboard / Upload Area',
        },
      },
      {
        path: '/api/stories',
        method: 'GET',
        summary: '获取用户故事列表',
        description: '获取解析生成的所有用户故事',
        responses: {
          '200': {
            description: '成功返回故事列表',
            fields: [
              { name: 'stories', type: 'array', description: '用户故事数组' },
              { name: 'total', type: 'number', description: '总数量' },
              { name: 'page', type: 'number', description: '当前页码' },
            ],
          },
        },
        source: {
          prd: 'PRD 2.4 节 - 用户故事展示模块',
          figma: 'Story List View',
        },
      },
      {
        path: '/api/stories/{id}',
        method: 'PUT',
        summary: '更新用户故事',
        description: '编辑和更新指定的用户故事内容',
        requestBody: {
          fields: [
            { name: 'title', type: 'string', required: false, description: '故事标题' },
            { name: 'description', type: 'string', required: false, description: '故事描述' },
            { name: 'priority', type: 'string', required: false, description: '优先级: 高, 中, 低' },
          ],
        },
        responses: {
          '200': {
            description: '更新成功',
            fields: [
              { name: 'story', type: 'object', description: '更新后的故事对象' },
              { name: 'updated_at', type: 'string', description: '更新时间' },
            ],
          },
          '404': {
            description: '故事不存在',
          },
        },
        source: {
          prd: 'PRD 2.4 节 - 交互操作 - 编辑功能',
          figma: 'Story Card / Edit Mode',
        },
      },
      {
        path: '/api/stories/export',
        method: 'POST',
        summary: '导出用户故事',
        description: '将用户故事导出为 CSV 或 Markdown 格式',
        requestBody: {
          fields: [
            { name: 'format', type: 'string', required: true, description: '导出格式: csv, markdown' },
            { name: 'story_ids', type: 'array', required: false, description: '指定导出的故事 ID 列表' },
          ],
        },
        responses: {
          '200': {
            description: '导出成功',
            fields: [
              { name: 'download_url', type: 'string', description: '下载链接' },
              { name: 'expires_at', type: 'string', description: '链接过期时间' },
            ],
          },
        },
        source: {
          prd: 'PRD 2.4 节 - 导出功能',
        },
      },
      {
        path: '/api/figma/audit',
        method: 'POST',
        summary: 'Figma 设计审计',
        description: '对 Figma 设计稿进行自动审计，检测与 PRD 的一致性',
        requestBody: {
          fields: [
            { name: 'figma_url', type: 'string', required: true, description: 'Figma 文件 URL' },
            { name: 'access_token', type: 'string', required: false, description: 'Figma 访问令牌' },
            { name: 'prd_id', type: 'string', required: true, description: '对应的 PRD 文档 ID' },
          ],
        },
        responses: {
          '200': {
            description: '审计完成',
            fields: [
              { name: 'audit_id', type: 'string', description: '审计报告 ID' },
              { name: 'issues', type: 'array', description: '发现的问题列表' },
              { name: 'summary', type: 'object', description: '审计摘要统计' },
            ],
          },
        },
        source: {
          prd: 'Phase 2 - Section 3.2 - Figma 审计功能',
        },
      },
    ];

    setEndpoints(mockEndpoints);
    setGenerated(true);
    setGenerating(false);
    toast.success('API 文档生成成功！');
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'POST':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'DELETE':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const generateOpenAPIYAML = () => {
    const yaml = `openapi: 3.0.3
info:
  title: StoryWeaver AI API
  description: 智能需求拆解平台 API 文档
  version: 1.0.0
  contact:
    name: StoryWeaver Team
    email: support@storyweaver.ai

servers:
  - url: https://api.storyweaver.ai/v1
    description: Production server
  - url: https://staging.storyweaver.ai/v1
    description: Staging server

paths:
${endpoints
  .map(
    (endpoint) => `  ${endpoint.path}:
    ${endpoint.method.toLowerCase()}:
      summary: ${endpoint.summary}
      description: ${endpoint.description}
      tags:
        - ${endpoint.path.split('/')[2]}
${
  endpoint.requestBody
    ? `      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                ${endpoint.requestBody.fields.filter((f) => f.required).map((f) => `- ${f.name}`).join('\n                ')}
              properties:
${endpoint.requestBody.fields.map((f) => `                ${f.name}:\n                  type: ${f.type}\n                  description: ${f.description}`).join('\n')}`
    : ''
}
      responses:
${Object.entries(endpoint.responses)
  .map(
    ([code, response]) => `        '${code}':
          description: ${response.description}${
      response.fields
        ? `
          content:
            application/json:
              schema:
                type: object
                properties:
${response.fields.map((f) => `                  ${f.name}:\n                    type: ${f.type}\n                    description: ${f.description}`).join('\n')}`
        : ''
    }`
  )
  .join('\n')}`
  )
  .join('\n\n')}

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []
`;
    return yaml;
  };

  const handleCopyYAML = () => {
    const yaml = generateOpenAPIYAML();
    navigator.clipboard.writeText(yaml);
    setCopiedYaml(true);
    toast.success('OpenAPI YAML 已复制到剪贴板！');
    setTimeout(() => setCopiedYaml(false), 2000);
  };

  const handleDownloadYAML = () => {
    const yaml = generateOpenAPIYAML();
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `storyweaver-api-${new Date().toISOString().split('T')[0]}.yaml`;
    link.click();
    toast.success('OpenAPI YAML 文件已下载！');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">API 文档自动生成</h2>
          <p className="text-gray-600 mt-1">基于 PRD 与 Figma 设计稿自动推导 RESTful API</p>
        </div>
        {!generated && (
          <Button onClick={generateAPIs} disabled={generating}>
            {generating ? '生成中...' : '开始生成 API 文档'}
          </Button>
        )}
      </div>

      {!generated ? (
        <Card className="p-12 text-center">
          <Code className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">准备生成 API 文档</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            系统将分析 PRD 中的业务实体和 Figma 中的 UI 组件，
            自动推导出前后端交互所需的 API 接口规范
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="text-sm text-gray-600 mb-1">生成的端点数</div>
              <div className="text-3xl font-bold text-blue-600">{endpoints.length}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600 mb-1">覆盖率</div>
              <div className="text-3xl font-bold text-green-600">92%</div>
              <div className="text-xs text-gray-500 mt-1">基于 PRD 功能点</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-gray-600 mb-1">规范性</div>
              <div className="text-3xl font-bold text-purple-600">100%</div>
              <div className="text-xs text-gray-500 mt-1">符合 OpenAPI 3.0</div>
            </Card>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCopyYAML} variant="outline">
              {copiedYaml ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  复制 OpenAPI YAML
                </>
              )}
            </Button>
            <Button onClick={handleDownloadYAML}>
              <Download className="h-4 w-4 mr-2" />
              下载 YAML 文件
            </Button>
          </div>

          <Tabs defaultValue="endpoints" className="space-y-4">
            <TabsList>
              <TabsTrigger value="endpoints">API 端点 ({endpoints.length})</TabsTrigger>
              <TabsTrigger value="openapi">OpenAPI 预览</TabsTrigger>
            </TabsList>

            <TabsContent value="endpoints" className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <Card key={index} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={getMethodBadgeClass(endpoint.method)}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-lg font-mono font-semibold">{endpoint.path}</code>
                    </div>
                  </div>

                  <h4 className="font-semibold mb-2">{endpoint.summary}</h4>
                  <p className="text-sm text-gray-600 mb-4">{endpoint.description}</p>

                  <div className="space-y-4">
                    {endpoint.requestBody && (
                      <div>
                        <h5 className="font-medium mb-2 text-sm">Request Body</h5>
                        <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-300">
                                <th className="text-left pb-2">字段名</th>
                                <th className="text-left pb-2">类型</th>
                                <th className="text-left pb-2">必填</th>
                                <th className="text-left pb-2">说明</th>
                              </tr>
                            </thead>
                            <tbody>
                              {endpoint.requestBody.fields.map((field, i) => (
                                <tr key={i} className="border-b border-gray-200 last:border-0">
                                  <td className="py-2 font-mono text-blue-700">{field.name}</td>
                                  <td className="py-2 font-mono text-purple-700">{field.type}</td>
                                  <td className="py-2">
                                    {field.required ? (
                                      <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">
                                        必填
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs">
                                        可选
                                      </Badge>
                                    )}
                                  </td>
                                  <td className="py-2 text-gray-600">{field.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div>
                      <h5 className="font-medium mb-2 text-sm">Responses</h5>
                      <div className="space-y-2">
                        {Object.entries(endpoint.responses).map(([code, response]) => (
                          <div key={code} className="bg-gray-50 rounded-md p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                variant="outline"
                                className={
                                  code.startsWith('2')
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }
                              >
                                {code}
                              </Badge>
                              <span className="text-sm font-medium">{response.description}</span>
                            </div>
                            {response.fields && (
                              <table className="w-full text-sm mt-2">
                                <thead>
                                  <tr className="border-b border-gray-300">
                                    <th className="text-left pb-1">字段名</th>
                                    <th className="text-left pb-1">类型</th>
                                    <th className="text-left pb-1">说明</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {response.fields.map((field, i) => (
                                    <tr key={i} className="border-b border-gray-200 last:border-0">
                                      <td className="py-1 font-mono text-blue-700">{field.name}</td>
                                      <td className="py-1 font-mono text-purple-700">{field.type}</td>
                                      <td className="py-1 text-gray-600">{field.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>
                          <span className="font-medium">PRD 来源:</span> {endpoint.source.prd}
                        </div>
                        {endpoint.source.figma && (
                          <div>
                            <span className="font-medium">Figma 参考:</span> {endpoint.source.figma}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="openapi">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">OpenAPI 3.0 Specification (YAML)</h3>
                  <div className="flex gap-2">
                    <Button onClick={handleCopyYAML} variant="outline" size="sm">
                      {copiedYaml ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button onClick={handleDownloadYAML} size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-[600px] w-full rounded-md border border-gray-300">
                  <pre className="p-4 text-xs font-mono bg-gray-900 text-green-400 overflow-x-auto">
                    {generateOpenAPIYAML()}
                  </pre>
                </ScrollArea>
                <p className="text-xs text-gray-500 mt-2">
                  ✓ 可直接导入 Swagger Editor / Postman / Apifox 等工具
                </p>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setGenerated(false);
                setEndpoints([]);
              }}
            >
              重新生成
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
