import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Download, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';

interface Story {
  id: string;
  title: string;
  description: string;
  priority: string;
  storyPoints: number;
  dependencies: string[];
  sprint?: number;
  release?: string;
}

interface StoryMapProps {
  stories: Story[];
}

function SortableStoryItem({ story }: { story: Story }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: story.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className="p-4 mb-2 hover:shadow-md transition-shadow cursor-move">
        <div className="flex items-start gap-3">
          <div {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium">{story.title}</h4>
              <div className="flex gap-2 items-center">
                {story.sprint && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Sprint {story.sprint}
                  </Badge>
                )}
                <Badge variant="outline" className={getPriorityColor(story.priority)}>
                  {story.priority}
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  {story.storyPoints} pts
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{story.description}</p>
            {story.dependencies.length > 0 && (
              <div className="mt-2">
                <span className="text-xs text-gray-500">
                  依赖: {story.dependencies.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export function StoryMap({ stories: initialStories }: StoryMapProps) {
  const [stories, setStories] = useState<Story[]>(
    initialStories.map((story, index) => ({
      ...story,
      storyPoints: Math.ceil(Math.random() * 8) + 1,
      dependencies: index > 0 && Math.random() > 0.7 ? [initialStories[index - 1].id] : [],
      sprint: undefined,
      release: undefined,
    }))
  );

  const [teamVelocity, setTeamVelocity] = useState(20);
  const [autoAssigned, setAutoAssigned] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setStories((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const autoAssignSprints = () => {
    let currentSprint = 1;
    let currentPoints = 0;
    let currentRelease = 1;
    let sprintsInRelease = 0;

    const sortedStories = [...stories].sort((a, b) => {
      const priorityOrder: { [key: string]: number } = { '高': 3, '中': 2, '低': 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });

    const updatedStories = sortedStories.map((story) => {
      // Check dependencies
      const dependencyMet = story.dependencies.every((depId) => {
        const dep = updatedStories.find((s) => s.id === depId);
        return dep && dep.sprint && dep.sprint < currentSprint;
      });

      if (!dependencyMet && story.dependencies.length > 0) {
        currentSprint++;
        currentPoints = 0;
        sprintsInRelease++;
      }

      if (currentPoints + story.storyPoints > teamVelocity) {
        currentSprint++;
        currentPoints = 0;
        sprintsInRelease++;

        if (sprintsInRelease >= 3) {
          currentRelease++;
          sprintsInRelease = 0;
        }
      }

      currentPoints += story.storyPoints;

      return {
        ...story,
        sprint: currentSprint,
        release: `R${currentRelease}`,
      };
    });

    setStories(updatedStories);
    setAutoAssigned(true);
  };

  const exportStoryMap = () => {
    const releases = Array.from(new Set(stories.map((s) => s.release).filter(Boolean)));
    
    let exportContent = '# User Story Map\n\n';
    exportContent += `Team Velocity: ${teamVelocity} points per sprint\n\n`;

    releases.forEach((release) => {
      exportContent += `## ${release}\n\n`;
      const releaseStories = stories.filter((s) => s.release === release);
      const sprints = Array.from(new Set(releaseStories.map((s) => s.sprint).filter(Boolean)));

      sprints.forEach((sprint) => {
        const sprintStories = releaseStories.filter((s) => s.sprint === sprint);
        const totalPoints = sprintStories.reduce((sum, s) => sum + s.storyPoints, 0);

        exportContent += `### Sprint ${sprint} (${totalPoints} points)\n\n`;
        sprintStories.forEach((story) => {
          exportContent += `- **${story.title}** (${story.storyPoints} pts, ${story.priority})\n`;
          exportContent += `  ${story.description}\n`;
          if (story.dependencies.length > 0) {
            exportContent += `  Dependencies: ${story.dependencies.join(', ')}\n`;
          }
          exportContent += '\n';
        });
      });
    });

    const blob = new Blob([exportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `story_map_${new Date().toISOString().split('T')[0]}.md`;
    link.click();
  };

  const unassignedStories = stories.filter((s) => !s.sprint);
  const assignedStories = stories.filter((s) => s.sprint);
  const releases = Array.from(new Set(assignedStories.map((s) => s.release).filter(Boolean)));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">用户故事地图</h2>
          <p className="text-gray-600 mt-1">拖拽调整优先级，自动规划迭代排期</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportStoryMap} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出地图
          </Button>
          <Button onClick={autoAssignSprints} disabled={autoAssigned}>
            <Calendar className="h-4 w-4 mr-2" />
            {autoAssigned ? '已自动排期' : '自动排期'}
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="velocity">团队速率 (Story Points/Sprint)</Label>
            <Input
              id="velocity"
              type="number"
              value={teamVelocity}
              onChange={(e) => setTeamVelocity(parseInt(e.target.value) || 20)}
              min="1"
              max="100"
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              团队每个迭代可完成的故事点数
            </p>
          </div>
          <div>
            <Label>当前统计</Label>
            <div className="mt-2 space-y-1">
              <p className="text-sm">
                总故事数: <span className="font-medium">{stories.length}</span>
              </p>
              <p className="text-sm">
                总点数: <span className="font-medium">{stories.reduce((sum, s) => sum + s.storyPoints, 0)}</span>
              </p>
              {autoAssigned && (
                <>
                  <p className="text-sm">
                    预计 Sprint 数: <span className="font-medium">{Math.max(...assignedStories.map(s => s.sprint || 0))}</span>
                  </p>
                  <p className="text-sm">
                    预计 Release 数: <span className="font-medium">{releases.length}</span>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {!autoAssigned ? (
        <div>
          <h3 className="text-lg font-semibold mb-4">待排期故事 (拖拽调整优先级)</h3>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={stories.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {stories.map((story) => (
                  <SortableStoryItem key={story.id} story={story} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        <div className="space-y-8">
          {releases.map((release) => {
            const releaseStories = assignedStories.filter((s) => s.release === release);
            const sprints = Array.from(new Set(releaseStories.map((s) => s.sprint).filter(Boolean))).sort();

            return (
              <div key={release}>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xl font-bold">{release}</h3>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {releaseStories.reduce((sum, s) => sum + s.storyPoints, 0)} points
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {sprints.length} sprints
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sprints.map((sprint) => {
                    const sprintStories = releaseStories.filter((s) => s.sprint === sprint);
                    const totalPoints = sprintStories.reduce((sum, s) => sum + s.storyPoints, 0);

                    return (
                      <Card key={sprint} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">Sprint {sprint}</h4>
                          <Badge
                            variant="outline"
                            className={
                              totalPoints <= teamVelocity
                                ? 'bg-green-50 text-green-700'
                                : 'bg-orange-50 text-orange-700'
                            }
                          >
                            {totalPoints} pts
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {sprintStories.map((story) => (
                            <div
                              key={story.id}
                              className="text-sm p-2 bg-gray-50 rounded border border-gray-200"
                            >
                              <div className="font-medium mb-1">{story.title}</div>
                              <div className="flex gap-2 text-xs">
                                <Badge variant="outline" className="text-xs">
                                  {story.storyPoints} pts
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {story.priority}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {unassignedStories.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-600">
                未分配故事 ({unassignedStories.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unassignedStories.map((story) => (
                  <Card key={story.id} className="p-4 border-orange-200">
                    <div className="font-medium mb-2">{story.title}</div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{story.storyPoints} pts</Badge>
                      <Badge variant="outline">{story.priority}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
