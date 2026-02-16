import { useState, useEffect } from 'react';
import { FileUpload } from '@/app/components/FileUpload';
import { StoryList } from '@/app/components/StoryList';
import { StoryMap } from '@/app/components/StoryMap';
import { FigmaAudit } from '@/app/components/FigmaAudit';
import { APIGenerator } from '@/app/components/APIGenerator';
import { LLMConfigPanel } from '@/app/components/LLMConfigPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Card } from '@/app/components/ui/card';
import { Sparkles, FileText, BarChart3, Upload, Map, Search, Code2, Settings } from 'lucide-react';
import { Toaster } from '@/app/components/ui/sonner';

import { Priority, StoryStatus } from '@/types/storyweaver';
import { Story } from '@/types/storyweaver';
import { LLMConfig, LLMModel } from '@/services/LLMService';

export default function App() {
  const [stories, setStories] = useState<Story[]>([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [llmConfig, setLLMConfig] = useState<LLMConfig>({
    model: LLMModel.GPT4oMini,
    apiKey: '',
    temperature: 0.3,
    maxTokens: 2000,
    requestTimeout: 30000,
  });
  const [isTesting, setIsTesting] = useState(false);

  // 从localStorage加载配置
  useEffect(() => {
    const savedConfig = localStorage.getItem('llm-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setLLMConfig({ ...llmConfig, ...parsed });
      } catch (error) {
        console.error('Failed to parse LLM config:', error);
      }
    }
  }, []);

  // 保存配置到localStorage
  useEffect(() => {
    localStorage.setItem('llm-config', JSON.stringify(llmConfig));
  }, [llmConfig]);

  // 测试LLM连接
  const handleTestConnection = async (): Promise<boolean> => {
    if (!llmConfig.apiKey.trim()) {
      throw new Error('请输入API Key');
    }

    setIsTesting(true);

    try {
      const { LLMServiceFactory } = await import('@/services/LLMOptimizer');
      const service = LLMServiceFactory.createService(llmConfig);
      
      const testPrompt = 'Hi';
      const response = await service.callAPI(testPrompt);
      
      setIsTesting(false);
      
      return !!(response && response.length > 0);
    } catch (error: any) {
      setIsTesting(false);
      console.error('LLM connection test failed:', error);
      
      // 错误信息已经在 LLMOptimizer 中格式化，直接传递
      if (error.message?.includes('API_KEY_MISSING')) {
        throw new Error('API Key 不能为空');
      } else if (error.message?.includes('LLM_003')) {
        throw new Error('连接超时，请检查网络或 API 地址');
      } else if (error.message?.includes('LLM_004')) {
        throw new Error('API 响应无效');
      } else if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
        throw new Error('网络错误：无法连接到 API 服务器。如果是浏览器环境，可能是 CORS 跨域限制，请使用代理服务器或后端中转');
      } else {
        // 直接传递已格式化的错误信息
        throw error;
      }
    }
  };

  const handleFileProcessed = (newStories: Story[]) => {
    setStories(newStories);
    setActiveTab('stories');
  };

  const handleUpdateStory = (id: string, updates: Partial<Story>) => {
    setStories(prev => prev.map(story => 
      story.id === id ? { ...story, ...updates } : story
    ));
  };

  const handleDeleteStory = (id: string) => {
    setStories(prev => prev.filter(story => story.id !== id));
  };

  const handleAddStory = (newStory: Omit<Story, 'id'>) => {
    const story: Story = {
      ...newStory,
      id: Date.now().toString()
    };
    setStories(prev => [...prev, story]);
  };

  const stats = {
    total: stories.length,
    highPriority: stories.filter(s => s.priority === Priority.P0).length,
    avgConfidence: stories.length > 0 
      ? (stories.reduce((sum, s) => sum + s.confidence.overall, 0) / stories.length * 100).toFixed(0)
      : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  智语拆解 StoryWeaver AI
                </h1>
                <p className="text-sm text-gray-600">智能需求拆解平台 · Phase 2 - 全流程自动化</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-xs text-gray-600">总故事数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
                <div className="text-xs text-gray-600">高优先级</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.avgConfidence}%</div>
                <div className="text-xs text-gray-600">平均置信度</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-5xl mx-auto grid-cols-7">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              上传
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center gap-2" disabled={stories.length === 0}>
              <FileText className="h-4 w-4" />
              故事
            </TabsTrigger>
            <TabsTrigger value="storymap" className="flex items-center gap-2" disabled={stories.length === 0}>
              <Map className="h-4 w-4" />
              地图
            </TabsTrigger>
            <TabsTrigger value="figma" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              审计
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              API
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2" disabled={stories.length === 0}>
              <BarChart3 className="h-4 w-4" />
              分析
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              配置
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3">上传 PRD 文档</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                支持 Word (.docx)、PDF (.pdf)、纯文本 (.txt) 和 Markdown (.md) 格式。
                系统将自动识别文档结构，提取功能点，生成标准化的敏捷用户故事。
              </p>
            </div>
            
            <FileUpload 
              onFileProcessed={handleFileProcessed} 
              llmConfig={llmConfig}
            />

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="p-6 text-center border-2 hover:border-blue-200 transition-colors">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">1. 上传文档</h3>
                <p className="text-sm text-gray-600">拖拽或选择 PRD 文档，最大支持 20MB</p>
              </Card>
              
              <Card className="p-6 text-center border-2 hover:border-purple-200 transition-colors">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">2. 智能解析</h3>
                <p className="text-sm text-gray-600">AI 自动识别需求并生成用户故事</p>
              </Card>
              
              <Card className="p-6 text-center border-2 hover:border-green-200 transition-colors">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">3. 导出结果</h3>
                <p className="text-sm text-gray-600">编辑故事并导出为 CSV 或 Markdown</p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stories">
            <StoryList
              stories={stories}
              onUpdateStory={handleUpdateStory}
              onDeleteStory={handleDeleteStory}
              onAddStory={handleAddStory}
            />
          </TabsContent>

          <TabsContent value="storymap">
            <StoryMap stories={stories} />
          </TabsContent>

          <TabsContent value="figma">
            <FigmaAudit />
          </TabsContent>

          <TabsContent value="api">
            <APIGenerator />
          </TabsContent>

          <TabsContent value="config">
            <LLMConfigPanel
              config={llmConfig}
              onConfigChange={setLLMConfig}
              onTestConnection={handleTestConnection}
              isTesting={isTesting}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="text-sm text-gray-600 mb-1">总故事数</div>
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              </Card>
              
              <Card className="p-6">
                <div className="text-sm text-gray-600 mb-1">高优先级</div>
                <div className="text-3xl font-bold text-red-600">{stats.highPriority}</div>
                <div className="text-xs text-gray-500 mt-1">
                  占比 {stats.total > 0 ? ((stats.highPriority / stats.total) * 100).toFixed(0) : 0}%
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="text-sm text-gray-600 mb-1">中优先级</div>
                <div className="text-3xl font-bold text-yellow-600">
                  {stories.filter(s => s.priority === Priority.P1).length}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  占比 {stats.total > 0 ? ((stories.filter(s => s.priority === Priority.P1).length / stats.total) * 100).toFixed(0) : 0}%
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="text-sm text-gray-600 mb-1">平均置信度</div>
                <div className="text-3xl font-bold text-green-600">{stats.avgConfidence}%</div>
                <div className="text-xs text-gray-500 mt-1">
                  基于 AI 解析准确度
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">功能模块分布</h3>
              <div className="space-y-3">
                {Array.from(new Set(stories.map(s => s.module))).map(module => {
                  const moduleStories = stories.filter(s => s.module === module);
                  const percentage = (moduleStories.length / stats.total) * 100;
                  return (
                    <div key={module}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{module}</span>
                        <span className="text-gray-600">{moduleStories.length} 个故事 ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">质量指标</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-2">置信度分布</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>高置信度 (≥90%)</span>
                      <span className="font-medium text-green-600">
                        {stories.filter(s => s.confidence.overall >= 0.9).length} 个
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>中等置信度 (80-90%)</span>
                      <span className="font-medium text-yellow-600">
                        {stories.filter(s => s.confidence.overall >= 0.8 && s.confidence.overall < 0.9).length} 个
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>需人工审核 (&lt;80%)</span>
                      <span className="font-medium text-orange-600">
                        {stories.filter(s => s.confidence.overall < 0.8).length} 个
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">关键建议</div>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>已识别 {stats.total} 个功能点</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span>标准化模板应用率 100%</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500">ℹ</span>
                      <span>建议审核低置信度故事</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              <strong>StoryWeaver AI (SW-Core)</strong> - 智能需求拆解平台 Phase 2
            </p>
            <p className="text-xs text-gray-500">
              需求-设计-开发自动化闭环 · 故事地图规划 · Figma 审计 · API 文档生成
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}