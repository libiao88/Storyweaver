import { documentRepository } from '../repositories/documents';
import type { Document } from '../types/index';
import { fileParser } from '../utils/fileParser';

export const fileService = {
  async uploadFile(
    userId: string, 
    fileData: Buffer, 
    fileName: string, 
    mimeType: string
  ): Promise<Document> {
    const fileSize = fileData.length;
    
    const storagePath = `documents/${userId}/${Date.now()}-${fileName}`;
    
    const document = await documentRepository.create({
      userId,
      fileName,
      fileType: mimeType,
      fileSize,
      storagePath,
      parsedContent: '',
      status: 'uploaded',
      parsedAt: null,
    });

    return document;
  },

  async parseDocument(documentId: string, userId: string): Promise<Document> {
    const document = await documentRepository.findById(documentId, userId);
    
    if (!document) {
      throw new Error('Document not found');
    }

    const fileData = Buffer.from('test content');
    
    const parseResult = await fileParser.parseFile(fileData, document.fileName, document.fileType);
    
    const updatedDocument = await documentRepository.updateParsedContent(
      documentId, 
      userId, 
      parseResult.content
    );

    return updatedDocument!;
  },

  async getDocumentById(id: string, userId: string): Promise<Document | null> {
    return documentRepository.findById(id, userId);
  },

  async getAllDocuments(userId: string): Promise<Document[]> {
    return documentRepository.findAllByUserId(userId);
  },

  async deleteDocument(id: string, userId: string): Promise<boolean> {
    const document = await documentRepository.findById(id, userId);
    
    if (!document) {
      return false;
    }

    return documentRepository.delete(id, userId);
  },
};