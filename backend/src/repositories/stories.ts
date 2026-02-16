import { createClient } from '@supabase/supabase-js';
import type { Story, CreateStoryInput } from '../types/index';

const getSupabaseClient = () => {
  return createClient(
    'https://dqmwpihbwggsjwmpktmo.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxbXdwaWhid2dnc2p3bXBrdG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3ODg1MzAsImV4cCI6MjA4MzM2NDUzMH0.Xv6yLeJym9EaorbRfnrZ2d8uC7kkN57aacFJvy9O9jA'
  );
};

export const storyRepository = {
  async findAllByUserId(userId: string): Promise<Story[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Story[];
  },

  async findById(id: string, userId: string): Promise<Story | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Story | null;
  },

  async create(input: CreateStoryInput): Promise<Story> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('stories')
      .insert({
        user_id: input.userId,
        document_id: input.documentId || null,
        title: input.title,
        description: input.description || '',
        action: input.action || '',
        value: input.value || '',
        module: input.module || 'Default',
        priority: input.priority || 'P2',
        status: input.status || 'draft',
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as Story;
  },

  async update(id: string, userId: string, updates: Partial<CreateStoryInput>): Promise<Story | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('stories')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return data as Story | null;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },

  async search(userId: string, query: string): Promise<Story[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', userId)
      .ilike('title', `%${query}%`)
      .or(`description.ilike.%${query}%,action.ilike.%${query}%,value.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Story[];
  },
};
