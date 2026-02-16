import { createClient } from '@supabase/supabase-js';
import type { Document } from '../types/index';

const supabase = createClient(
  'https://your-supabase-project.supabase.co',
  'your-supabase-anon-key'
);

export const documentRepository = {
  async findAllByUserId(userId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Document[];
  },

  async findById(id: string, userId: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Document | null;
  },

  async create(input: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: input.userId,
        file_name: input.fileName,
        file_type: input.fileType,
        file_size: input.fileSize,
        storage_path: input.storagePath,
        parsed_content: input.parsedContent,
        status: input.status,
        parsed_at: input.parsedAt,
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as Document;
  },

  async updateStatus(id: string, userId: string, status: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return data as Document | null;
  },

  async updateParsedContent(id: string, userId: string, parsedContent: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .update({
        parsed_content: parsedContent,
        status: 'parsed',
        parsed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return data as Document | null;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },
};