import mammoth from 'mammoth';
import pdfjs from 'pdfjs-dist/legacy/build/pdf';
import { marked } from 'marked';

export type FileType = 'docx' | 'pdf' | 'txt' | 'md' | 'unknown';

export interface ParseResult {
  content: string;
  metadata: {
    wordCount: number;
    charCount: number;
    pages?: number;
  };
}

export const fileParser = {
  async parseFile(fileData: Buffer, fileName: string, mimeType: string): Promise<ParseResult> {
    const fileType = this.detectFileType(fileName, mimeType);

    switch (fileType) {
      case 'docx':
        return this.parseDocx(fileData);
      case 'pdf':
        return this.parsePdf(fileData);
      case 'txt':
        return this.parseText(fileData);
      case 'md':
        return this.parseMarkdown(fileData);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  },

  detectFileType(fileName: string, mimeType: string): FileType {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    if (ext === 'docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return 'docx';
    }
    
    if (ext === 'pdf' || mimeType === 'application/pdf') {
      return 'pdf';
    }
    
    if (ext === 'txt' || mimeType === 'text/plain') {
      return 'txt';
    }
    
    if (ext === 'md' || ext === 'markdown' || mimeType === 'text/markdown') {
      return 'md';
    }
    
    return 'unknown';
  },

  async parseDocx(fileData: Buffer): Promise<ParseResult> {
    try {
      const result = await mammoth.extractRawText({ buffer: fileData });
      const content = result.value;
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
      
      return {
        content,
        metadata: {
          wordCount,
          charCount: content.length,
        },
      };
    } catch (error) {
      throw new Error('Failed to parse DOCX file');
    }
  },

  async parsePdf(fileData: Buffer): Promise<ParseResult> {
    try {
      const data = new Uint8Array(fileData);
      const pdf = await pdfjs.getDocument(data).promise;
      const pages = pdf.numPages;
      let content = '';
      
      for (let i = 1; i <= pages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => (item as any).str).join(' ');
        content += pageText + '\n';
      }
      
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
      
      return {
        content,
        metadata: {
          wordCount,
          charCount: content.length,
          pages,
        },
      };
    } catch (error) {
      throw new Error('Failed to parse PDF file');
    }
  },

  parseText(fileData: Buffer): ParseResult {
    try {
      const content = fileData.toString('utf-8');
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
      
      return {
        content,
        metadata: {
          wordCount,
          charCount: content.length,
        },
      };
    } catch (error) {
      throw new Error('Failed to parse text file');
    }
  },

  parseMarkdown(fileData: Buffer): ParseResult {
    try {
      const content = fileData.toString('utf-8');
      const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
      
      return {
        content,
        metadata: {
          wordCount,
          charCount: content.length,
        },
      };
    } catch (error) {
      throw new Error('Failed to parse Markdown file');
    }
  },
};