import { createClient } from '@supabase/supabase-js';
import type { Document } from '../types/index';

const getSupabaseClient = () => {
  return createClient(
    'https://dqmwpihbwggsjwmpktmo.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxbXdwaWhid2dnc2p3bXBrdG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3ODg1MzAsImV4cCI6MjA4MzM2NDUzMH0.Xv6yLeJym9EaorbRfnrZ2d8uC7kkN57aacFJvy9O9jA'
  );
};

export const documentRepository = {
  async findAllByUserId(userId: string): Promise<Document[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Document[];
  },

  async findById(id: string, userId: string): Promise<Document | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Document | null;
  },

  async create(input: {
    userId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    storagePath: string;
    parsedContent: string;
    status: string;
    parsedAt: Date | null;
  }): Promise<Document> {
    const supabase = getSupabaseClient();
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

  async updateParsedContent(id: string, userId: string, content: string): Promise<Document | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('documents')
      .update({
        parsed_content: content,
        status: 'parsed',
        parsed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return data as Document | null;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },
};
