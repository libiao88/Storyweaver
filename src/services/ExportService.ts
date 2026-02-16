import { type Story } from '@/types/storyweaver';

export class ExportService {
  exportToCSV(stories: Story[]): string {
    const headers = ['ID', 'Title', 'Description', 'Role', 'Action', 'Value', 'Module', 'Priority', 'Confidence', 'Created At'];
    
    const rows = stories.map(story => [
      story.id,
      this.escapeCSV(story.title),
      this.escapeCSV(story.description),
      this.escapeCSV(story.role),
      this.escapeCSV(story.action),
      this.escapeCSV(story.value),
      this.escapeCSV(story.module),
      story.priority,
      (story.confidence.overall * 100).toFixed(0) + '%',
      story.createdAt.toISOString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
  }
  
  exportToMarkdown(stories: Story[]): string {
    let md = '# 用户故事列表\n\n';
    md += `生成时间: ${new Date().toLocaleString()}\n\n`;
    md += `总故事数: ${stories.length}\n\n`;
    md += '---\n\n';
    
    const groupedByModule = stories.reduce((acc, story) => {
      const module = story.module || '未分类';
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(story);
      return acc;
    }, {} as Record<string, Story[]>);
    
    for (const [module, moduleStories] of Object.entries(groupedByModule)) {
      md += `## ${module}\n\n`;
      
      for (const story of moduleStories) {
        md += `### ${story.title} (${story.priority})\n\n`;
        md += `**置信度**: ${(story.confidence.overall * 100).toFixed(0)}%\n\n`;
        md += `${story.description}\n\n`;
        md += `**原文引用**: ${story.sourceReference.text}\n\n`;
        md += `---\n\n`;
      }
    }
    
    return md;
  }
  
  downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  downloadCSV(stories: Story[], filename?: string): void {
    const csvContent = this.exportToCSV(stories);
    const finalFilename = filename || `stories_${Date.now()}.csv`;
    this.downloadFile(csvContent, finalFilename, 'text/csv;charset=utf-8;');
  }
  
  downloadMarkdown(stories: Story[], filename?: string): void {
    const mdContent = this.exportToMarkdown(stories);
    const finalFilename = filename || `stories_${Date.now()}.md`;
    this.downloadFile(mdContent, finalFilename, 'text/markdown;charset=utf-8;');
  }
  
  private escapeCSV(value: string): string {
    if (!value) return '';
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}

export const exportService = new ExportService();
