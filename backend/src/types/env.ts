export interface Env {
  JWT_SECRET?: string;
  OPENAI_API_KEY?: string;
  CLAUDE_API_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_KEY?: string;
  STORYWEAVER_KV?: KVNamespace;
  STORYWEAVER_R2?: R2Bucket;
  STORYWEAVER_QUEUE?: Queue;
  NODE_ENV?: 'development' | 'production' | 'test';
  Variables: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      userId?: string;
    };
  };
}