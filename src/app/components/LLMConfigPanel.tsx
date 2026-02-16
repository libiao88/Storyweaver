import { useState } from 'react';
import { Settings, Key, BrainCircuit, Thermometer, Zap } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Slider } from '@/app/components/ui/slider';
import { Select } from '@/app/components/ui/select';
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { LLMModel, LLMConfig } from '@/services/LLMService';

interface LLMConfigPanelProps {
  config: LLMConfig;
  onConfigChange: (config: LLMConfig) => void;
  onTestConnection: () => Promise<boolean>;
  isTesting: boolean;
}

export function LLMConfigPanel({
  config,
  onConfigChange,
  onTestConnection,
  isTesting,
}: LLMConfigPanelProps) {
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [model, setModel] = useState(config.model);
  const [temperature, setTemperature] = useState(config.temperature);
  const [maxTokens, setMaxTokens] = useState(config.maxTokens);
  const [showKey, setShowKey] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | ''>('');
  const [testMessage, setTestMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfigChange({
      ...config,
      apiKey,
      model,
      temperature,
      maxTokens,
    });
  };

  const handleTestConnection = async () => {
    setTestResult('');
    setTestMessage('');

    try {
      const success = await onTestConnection();
      if (success) {
        setTestResult('success');
        setTestMessage('连接成功');
      } else {
        setTestResult('error');
        setTestMessage('连接失败');
      }
    } catch (error) {
      setTestResult('error');
      setTestMessage(error instanceof Error ? error.message : '连接失败');
    }
  };

  const modelOptions = [
    // OpenAI
    { value: LLMModel.GPT4oMini, label: 'GPT-4o mini (推荐)', price: '$0.15/1K tokens' },
    { value: LLMModel.GPT4o, label: 'GPT-4o', price: '$2.5/1K tokens' },
    // Claude
    { value: LLMModel.Claude3Haiku, label: 'Claude 3 Haiku', price: '$0.25/1K tokens' },
    { value: LLMModel.Claude3Sonnet, label: 'Claude 3 Sonnet', price: '$3/1K tokens' },
    { value: LLMModel.Claude3Opus, label: 'Claude 3 Opus', price: '$15/1K tokens' },
    // Google
    { value: LLMModel.Gemini15Flash, label: 'Gemini 1.5 Flash', price: '$0.075/1K tokens' },
    { value: LLMModel.Gemini15Pro, label: 'Gemini 1.5 Pro', price: '$1.25/1K tokens' },
    // 国内大模型
    { value: LLMModel.MinimaxCodingPlan, label: 'Minimax Coding Plan', price: '$0.3/1K tokens' },
    { value: LLMModel.Kimi, label: 'Kimi', price: '$0.25/1K tokens' },
    { value: LLMModel.GLMCodingPlan, label: 'GLM Coding Plan', price: '$0.4/1K tokens' },
    { value: LLMModel.VolcanoCodingPlan, label: '火山 Coding Plan', price: '$0.35/1K tokens' },
    { value: LLMModel.DeepSeek, label: 'DeepSeek', price: '$0.2/1K tokens' },
    { value: LLMModel.Doubao, label: '豆包', price: '$0.18/1K tokens' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">LLM 配置</h3>
          <p className="text-sm text-gray-600">
            配置 OpenAI/Gemini 等大语言模型以优化用户故事生成
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleTestConnection}
          disabled={!apiKey.trim() || isTesting}
          className="flex items-center gap-2"
        >
          {isTesting ? (
            <span className="animate-spin">⏳</span>
          ) : (
            '测试连接'
          )}
        </Button>
      </div>

      {testResult && (
        <div
          className={`p-3 rounded-lg text-sm ${
            testResult === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {testResult === 'success' ? '✅' : '❌'} {testMessage}
        </div>
      )}

      <Card className="p-6 bg-white">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? '隐藏' : '显示'}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                用于访问 LLM API 的密钥，保存在浏览器本地存储中
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">模型选择</Label>
              <Select value={model} onValueChange={(value) => setModel(value as LLMModel)}>
                <SelectTrigger id="model">
                  <SelectValue placeholder="选择模型" />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-xs text-gray-500">{option.price}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                不同模型在价格、响应速度和质量之间有差异
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">温度 ({temperature.toFixed(1)})</Label>
              <Slider
                id="temperature"
                min={0}
                max={1}
                step={0.1}
                value={[temperature]}
                onValueChange={([value]) => setTemperature(value)}
              />
              <p className="text-xs text-gray-500">
                控制输出的随机性，值越低越确定性
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-tokens">最大 Token 数</Label>
              <Input
                id="max-tokens"
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value) || 2000)}
                min={500}
                max={4000}
                className="w-24"
              />
              <p className="text-xs text-gray-500">
                响应的最大 Token 数，影响输出长度
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              保存配置
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setApiKey('');
                setModel(LLMModel.GPT4oMini);
                setTemperature(0.3);
                setMaxTokens(2000);
              }}
            >
              重置默认
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6 bg-blue-50">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <BrainCircuit className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 mb-2">配置说明</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>API Key</strong>：需要有效的 API 密钥，不同模型可能需要不同的密钥</li>
              <li>• <strong>模型选择</strong>：
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• 国外模型：GPT-4o mini 提供最佳性价比</li>
                  <li>• 国内模型：DeepSeek 和豆包具有较好的价格优势</li>
                </ul>
              </li>
              <li>• <strong>温度参数</strong>：0.3 提供平衡的输出质量</li>
              <li>• <strong>Token 限制</strong>：2000 足够处理大多数优化任务</li>
              <li>• <strong>成本控制</strong>：优化只会处理置信度 &lt;70% 的故事</li>
              <li>• <strong>网络要求</strong>：
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• 国外模型可能需要网络代理</li>
                  <li>• 国内模型通常可直接访问</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}