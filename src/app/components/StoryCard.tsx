import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Textarea } from '@/app/components/ui/textarea';
import { Input } from '@/app/components/ui/input';
import { Edit2, Trash2, Save, X, FileText } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  description: string;
  module: string;
  priority: string;
  sourceReference: string;
  confidence: number;
}

interface StoryCardProps {
  story: Story;
  onUpdate: (id: string, updates: Partial<Story>) => void;
  onDelete: (id: string) => void;
}

export function StoryCard({ story, onUpdate, onDelete }: StoryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(story.title);
  const [editedDescription, setEditedDescription] = useState(story.description);

  const handleSave = () => {
    onUpdate(story.id, {
      title: editedTitle,
      description: editedDescription
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(story.title);
    setEditedDescription(story.description);
    setIsEditing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '高':
        return 'bg-red-100 text-red-800 border-red-200';
      case '中':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case '低':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.8) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {isEditing ? (
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="text-lg font-semibold mb-2"
              placeholder="用户故事标题"
            />
          ) : (
            <h3 className="text-lg font-semibold mb-2">{story.title}</h3>
          )}
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className={getPriorityColor(story.priority)}>
              优先级: {story.priority}
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
              {story.module}
            </Badge>
            <Badge variant="outline" className={getConfidenceColor(story.confidence)}>
              置信度: {(story.confidence * 100).toFixed(0)}%
            </Badge>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          {!isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(story.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {isEditing ? (
          <Textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            className="min-h-[100px] font-mono text-sm"
            placeholder="As a <角色>, I want to <活动>, So that <价值>"
          />
        ) : (
          <p className="text-sm leading-relaxed bg-gray-50 p-4 rounded-md font-mono border border-gray-200">
            {story.description}
          </p>
        )}

        <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-blue-900 mb-1">原文引用</p>
              <p className="text-xs text-blue-700 leading-relaxed">{story.sourceReference}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
