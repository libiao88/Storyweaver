import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { DocumentParser } from '@/services/DocumentParser';
import { Priority } from '@/types/storyweaver';
import { LLMConfig } from '@/services/LLMService';

interface FileUploadProps {
  onFileProcessed: (stories: any[]) => void;
  llmConfig?: LLMConfig;
}

export function FileUpload({ onFileProcessed, llmConfig }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 20 * 1024 * 1024; // 20MB
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown'
    ];
    const allowedExtensions = ['.pdf', '.docx', '.txt', '.md'];

    if (file.size === 0) {
      return { valid: false, error: '文件内容为空，请上传有效文档' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: '文件大小超过 20MB 限制' };
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return { valid: false, error: '不支持的文件格式，请上传 .docx, .pdf, .txt 或 .md 文件' };
    }

    return { valid: true };
  };

  const simulateProcessing = async (file: File) => {
    setUploadStatus('uploading');
    setUploadProgress(0);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadProgress(i);
    }

    setUploadStatus('processing');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Parse file using DocumentParser
    const parser = new DocumentParser(llmConfig);
    const parsedDoc = await parser.parseFile(file);

    if (parsedDoc.status === 'failed') {
      setUploadStatus('error');
      setErrorMessage(parsedDoc.errorMessage || '文档解析失败');
      return;
    }

    // Convert parsed stories to the format expected by the app
    const formattedStories = (parsedDoc.stories || []).map(story => ({
      id: story.id,
      title: story.title,
      description: story.description,
      module: story.module,
      priority: story.priority === Priority.P0 ? '高' : story.priority === Priority.P1 ? '中' : '低',
      sourceReference: story.sourceReference.text,
      confidence: story.confidence.overall
    }));

    setUploadStatus('success');
    onFileProcessed(formattedStories);
  };

  const handleFile = async (file: File) => {
    const validation = validateFile(file);
    
    if (!validation.valid) {
      setErrorMessage(validation.error || '文件验证失败');
      setUploadStatus('error');
      return;
    }

    setUploadedFile(file);
    setErrorMessage('');
    await simulateProcessing(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrorMessage('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center transition-all
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
          ${uploadStatus === 'idle' || uploadStatus === 'error' ? 'cursor-pointer hover:border-gray-400' : ''}
        `}
      >
        {uploadStatus === 'idle' && (
          <>
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl mb-2">拖拽文件到此处上传</h3>
            <p className="text-gray-500 mb-4">支持 .docx, .pdf, .txt, .md 格式，最大 20MB</p>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".docx,.pdf,.txt,.md"
              onChange={handleFileInput}
            />
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                选择文件
              </label>
            </Button>
          </>
        )}

        {uploadStatus === 'uploading' && (
          <div className="space-y-4">
            <FileText className="w-16 h-16 mx-auto text-blue-500" />
            <h3 className="text-xl">正在上传文件...</h3>
            <div className="max-w-md mx-auto">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-gray-500 mt-2">{uploadProgress}%</p>
            </div>
          </div>
        )}

        {uploadStatus === 'processing' && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-500"></div>
            </div>
            <h3 className="text-xl">智能解析中...</h3>
            <p className="text-gray-500">正在识别章节、提取功能点、生成用户故事</p>
          </div>
        )}

        {uploadStatus === 'success' && uploadedFile && (
          <div className="space-y-4">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
            <h3 className="text-xl text-green-600">解析成功！</h3>
            <p className="text-gray-600">文件：{uploadedFile.name}</p>
            <Button onClick={resetUpload} variant="outline">
              上传新文件
            </Button>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="space-y-4">
            <AlertCircle className="w-16 h-16 mx-auto text-red-500" />
            <h3 className="text-xl text-red-600">上传失败</h3>
            <p className="text-gray-600">{errorMessage}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={resetUpload}>重试</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
