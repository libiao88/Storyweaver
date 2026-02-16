import { createClient } from '@supabase/supabase-js';
import type { Story, CreateStoryInput } from '../types/index';

const supabase = createClient(
  'https://your-supabase-project.supabase.co',
  'your-supabase-anon-key'
);

export const storyRepository = {
  async findAllByUserId(userId: string): Promise<Story[]> {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Story[];
  },

  async findById(id: string, userId: string): Promise<Story | null> {
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
    const { data, error } = await supabase
      .from('stories')
      .insert({
        user_id: input.userId,
        document_id: input.documentId,
        title: input.title,
        description: input.description,
        role: input.role,
        action: input.action,
        value: input.value,
        module: input.module,
        priority: input.priority,
        status: input.status,
        tags: input.tags || [],
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as Story;
  },

  async update(id: string, userId: string, updates: Partial<CreateStoryInput>): Promise<Story | null> {
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
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },

  async search(userId: string, query: string): Promise<Story[]> {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', userId)
      .ilike('title', `%${query}%`)
      .or(`description.ilike.%${query}%,role.ilike.%${query}%,action.ilike.%${query}%,value.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Story[];
  },
};