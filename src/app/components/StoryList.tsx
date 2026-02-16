import { useState } from 'react';
import { StoryCard } from '@/app/components/StoryCard';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Download, Plus, FileText, Copy, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';

import { Priority, StoryStatus } from '@/types/storyweaver';

interface Story {
  id: string;
  title: string;
  description: string;
  module: string;
  priority: '高' | '中' | '低';
  sourceReference: string;
  confidence: number;
}

interface StoryListProps {
  stories: Story[];
  onUpdateStory: (id: string, updates: Partial<Story>) => void;
  onDeleteStory: (id: string) => void;
  onAddStory: (story: Omit<Story, 'id'>) => void;
}

export function StoryList({ stories, onUpdateStory, onDeleteStory, onAddStory }: StoryListProps) {
  const [filterModule, setFilterModule] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('confidence');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStory, setNewStory] = useState({
    title: '',
    description: '',
    module: '',
    priority: '中',
    sourceReference: '',
    confidence: 1.0
  });

  const modules = ['all', ...Array.from(new Set(stories.map(s => s.module)))];

  const filteredAndSortedStories = stories
    .filter(story => {
      const matchesModule = filterModule === 'all' || story.module === filterModule;
      const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           story.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesModule && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return b.confidence - a.confidence;
        case 'priority':
          const priorityOrder: { [key: string]: number } = { '高': 3, '中': 2, '低': 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        case 'module':
          return a.module.localeCompare(b.module);
        default:
          return 0;
      }
    });

  const exportToCSV = () => {
    const headers = ['Title', 'Description', 'Module', 'Priority', 'Source Reference', 'Confidence'];
    const rows = stories.map(story => [
      story.title,
      story.description,
      story.module,
      story.priority,
      story.sourceReference,
      story.confidence.toString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `user_stories_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('CSV 文件已导出！');
  };

  const exportToMarkdown = () => {
    const markdown = stories.map(story => `## ${story.title}

**模块**: ${story.module}  
**优先级**: ${story.priority}  
**置信度**: ${(story.confidence * 100).toFixed(0)}%

### 用户故事
${story.description}

### 原文引用
> ${story.sourceReference}

---
`).join('\n');

    navigator.clipboard.writeText(markdown);
    toast.success('Markdown 格式已复制到剪贴板！');
  };

  const handleAddStory = () => {
    if (!newStory.title || !newStory.description) {
      toast.error('请填写标题和描述！');
      return;
    }

    onAddStory(newStory);
    setNewStory({
      title: '',
      description: '',
      module: '',
      priority: '中',
      sourceReference: '',
      confidence: 1.0
    });
    setIsAddDialogOpen(false);
    toast.success('用户故事已添加！');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">用户故事列表</h2>
          <p className="text-gray-600 mt-1">共 {stories.length} 个故事，显示 {filteredAndSortedStories.length} 个</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                添加故事
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>添加新的用户故事</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-title">标题</Label>
                  <Input
                    id="new-title"
                    value={newStory.title}
                    onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                    placeholder="例如: 用户登录功能"
                  />
                </div>
                <div>
                  <Label htmlFor="new-description">用户故事描述</Label>
                  <Textarea
                    id="new-description"
                    value={newStory.description}
                    onChange={(e) => setNewStory({ ...newStory, description: e.target.value })}
                    placeholder="As a <角色>, I want to <活动>, So that <价值>"
                    className="min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new-module">功能模块</Label>
                    <Input
                      id="new-module"
                      value={newStory.module}
                      onChange={(e) => setNewStory({ ...newStory, module: e.target.value })}
                      placeholder="例如: 用户管理"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-priority">优先级</Label>
                    <Select
                      value={newStory.priority}
                      onValueChange={(value) => setNewStory({ ...newStory, priority: value })}
                    >
                      <SelectTrigger id="new-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="高">高</SelectItem>
                        <SelectItem value="中">中</SelectItem>
                        <SelectItem value="低">低</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="new-source">原文引用</Label>
                  <Textarea
                    id="new-source"
                    value={newStory.sourceReference}
                    onChange={(e) => setNewStory({ ...newStory, sourceReference: e.target.value })}
                    placeholder="需求文档中的原文片段..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleAddStory}>
                    添加故事
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={exportToMarkdown}>
            <Copy className="h-4 w-4 mr-2" />
            复制 Markdown
          </Button>
          <Button onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            导出 CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="搜索故事标题或描述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterModule} onValueChange={setFilterModule}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择模块" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部模块</SelectItem>
            {modules.filter(m => m !== 'all').map(module => (
              <SelectItem key={module} value={module}>{module}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="排序方式" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="confidence">按置信度</SelectItem>
            <SelectItem value="priority">按优先级</SelectItem>
            <SelectItem value="module">按模块</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Story Cards */}
      {filteredAndSortedStories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">没有找到匹配的用户故事</p>
          <p className="text-gray-500 text-sm mt-2">尝试调整筛选条件或添加新故事</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAndSortedStories.map(story => (
            <StoryCard
              key={story.id}
              story={story}
              onUpdate={onUpdateStory}
              onDelete={onDeleteStory}
            />
          ))}
        </div>
      )}
    </div>
  );
}
