import { createClient } from '@supabase/supabase-js';
import type { UserConfig, UpdateConfigInput } from '../types/index';

const supabase = createClient(
  'https://your-supabase-project.supabase.co',
  'your-supabase-anon-key'
);

export const configRepository = {
  async findByUserId(userId: string): Promise<UserConfig | null> {
    const { data, error } = await supabase
      .from('user_configs')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as UserConfig | null;
  },

  async create(userId: string): Promise<UserConfig> {
    const { data, error } = await supabase
      .from('user_configs')
      .insert({
        user_id: userId,
        llm_provider: 'openai',
        default_model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 2048,
        auto_save: true,
        theme: 'light',
        notifications_enabled: true,
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as UserConfig;
  },

  async update(userId: string, updates: UpdateConfigInput): Promise<UserConfig | null> {
    const { data, error } = await supabase
      .from('user_configs')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;
    return data as UserConfig | null;
  },

  async getDefaultConfig(): Promise<UpdateConfigInput> {
    return {
      llmProvider: 'openai',
      defaultModel: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2048,
      autoSave: true,
      theme: 'light',
      notificationsEnabled: true,
    };
  },
};