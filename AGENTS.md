# AGENTS.md - Storyweaver Development Guide

## Build Commands

```bash
npm install    # Install dependencies
npm run dev    # Start dev server (http://localhost:5173)
npm run build  # Build for production
npm run preview # Preview production build
```

> **Note:** No test framework configured. Do not add tests unless explicitly requested.

## Project Structure

```
src/
├── main.tsx              # App entry (React 18)
├── types/storyweaver.ts  # Core interfaces
├── styles/               # Global CSS
└── app/
    ├── App.tsx           # Root component
    └── components/
        ├── ui/           # Reusable UI components
        └── [features]/   # Feature components
```

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build**: Vite 6 + @tailwindcss/vite
- **Styling**: Tailwind CSS v4
- **UI**: Radix UI primitives + shadcn/ui-style
- **Icons**: lucide-react
- **Animation**: motion (Framer Motion)

## Path Aliases

- `@/` → `src/`
- Example: `import { Button } from "@/app/components/ui/button"`

## Code Style

### TypeScript
- Use explicit interfaces for props
- Prefer `type` for unions, `interface` for objects
- Always type function params and returns
- **No `any` types**

```typescript
// ✅ Good
interface Story { id: string; title: string; }
function StoryCard({ story }: { story: Story }) { ... }

// ❌ Avoid
function handleClick(e) { ... }  // implicit any
```

### Components
- **UI Components**: Named exports (`export { Button }`)
- **Feature Components**: Default exports (`export default function App()`)
- Use `React.ComponentProps<"element">` for HTML props
- Add `data-slot` attributes

```typescript
// UI - named export
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("rounded-lg", className)} {...props} data-slot="card" />;
}
export { Card };

// Feature - default export
export default function FileUpload() { ... }
```

### Import Order

1. External libraries (React, Radix, etc.)
2. Internal imports (`@/` aliases)
3. Relative imports (`./`, `../`)
4. Type imports last

```typescript
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Edit2 } from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { Story } from "@/types/storyweaver";
```

### Naming

- **Components**: PascalCase (`StoryCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useStoryData`)
- **Utils**: camelCase (`cn`, `formatDate`)
- **Types**: PascalCase (`Story`, `UserProfile`)

### Styling

- Use Tailwind utilities exclusively
- Use `cn()` from `ui/utils.ts` for class merging
- Use `cva` for component variants
- Theme vars in `src/styles/theme.css`

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md",
  {
    variants: {
      variant: { 
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground"
      },
    },
    defaultVariants: { variant: "default" },
  }
);
```

### Error Handling

```typescript
try {
  const result = await parseDocument(file);
  setStories(result);
} catch (error) {
  console.error("Failed to parse:", error);
  toast.error("文档解析失败，请检查文件格式");
}
```

### State

- Use React hooks (useState, useEffect)
- Use localStorage for persistence
- Prefer composition over prop drilling

## Adding Components

1. Find Radix UI primitive (radix-ui.com)
2. Create in `src/app/components/ui/`
3. Use `cn()` for class merging
4. Export named component
5. Add `data-slot` attribute
6. Follow patterns in `button.tsx`, `card.tsx`

## File Organization

- One component per file
- UI components in `components/ui/`
- Feature components in `components/`
- Hooks in `hooks/`
- Utils in `lib/` or `utils/`

## Environment Variables

- `.env` for local dev
- `.env.example` as template
- Access: `import.meta.env.VITE_*`
- Never commit secrets

---

# Backend Development Guide

## Overview

The backend is built with **Hono** framework and deployed to **Cloudflare Workers**. It provides API endpoints for user authentication, story management, LLM optimization, and file handling.

## Project Structure

```
backend/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── types/
│   │   ├── index.ts            # Shared types
│   │   └── env.ts              # Environment types
│   ├── middleware/
│   │   └── auth.ts             # JWT authentication
│   ├── routes/
│   │   ├── auth.ts             # Authentication endpoints
│   │   ├── stories.ts          # Story CRUD endpoints
│   │   ├── config.ts           # User config endpoints
│   │   ├── files.ts            # File upload endpoints
│   │   └── llm.ts              # LLM proxy endpoints
│   ├── services/
│   │   ├── stories.ts          # Story business logic
│   │   ├── config.ts           # Config business logic
│   │   └── files.ts            # File business logic
│   └── repositories/           # Data access layer
├── wrangler.toml               # Cloudflare Workers config
├── package.json
└── tsconfig.json
```

## Backend Tech Stack

- **Framework**: Hono v4 (Cloudflare Workers optimized)
- **Runtime**: Cloudflare Workers
- **Database**: Supabase (PostgreSQL)
- **Storage**: Cloudflare R2, KV
- **Auth**: JWT (jsonwebtoken)
- **Password**: bcryptjs

## Build Commands

```bash
cd backend

# Install dependencies
npm install

# Local development
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare Workers
npm run deploy
```

## Environment Variables

Create a `.dev.vars` file for local development:

```bash
# .dev.vars
JWT_SECRET=your-jwt-secret-key
OPENAI_API_KEY=sk-...
CLAUDE_API_KEY=sk-ant-...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Stories
- `GET /api/stories` - List all stories
- `GET /api/stories/:id` - Get single story
- `POST /api/stories` - Create story
- `PUT /api/stories/:id` - Update story
- `DELETE /api/stories/:id` - Delete story
- `GET /api/stories/search?q=query` - Search stories

### Configuration
- `GET /api/config` - Get user config
- `PUT /api/config` - Update user config
- `POST /api/config/reset` - Reset to defaults

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files` - List files
- `GET /api/files/:id` - Get file
- `DELETE /api/files/:id` - Delete file

### LLM
- `POST /api/llm/optimize` - Optimize story
- `POST /api/llm/test` - Test LLM connection
- `GET /api/llm/models` - List supported models

## Backend Code Style

### Route Definition
```typescript
import { Hono } from 'hono';
import type { Env } from '../types/env';

export const storyRoutes = new Hono<{ Bindings: Env }>();

storyRoutes.get('/', async (c) => {
  const user = c.get('user');
  // Handler logic
});
```

### Error Response
```typescript
return c.json({
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'Error message',
    details: 'Additional details'
  }
}, 400);
```

### Success Response
```typescript
return c.json({
  success: true,
  data: { ... }
});
```

### Authentication Middleware
The `authMiddleware` validates JWT tokens and sets the user in context:

```typescript
app.use('/api/*', authMiddleware);
```

After authentication, access user via `c.get('user')`.

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Stories Table
```sql
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  document_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  role TEXT,
  action TEXT,
  value TEXT,
  module TEXT,
  priority TEXT DEFAULT 'P2',
  status TEXT DEFAULT 'draft',
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### User Config Table
```sql
CREATE TABLE user_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE,
  llm_provider TEXT DEFAULT 'openai',
  default_model TEXT DEFAULT 'gpt-4o-mini',
  temperature REAL DEFAULT 0.3,
  max_tokens INTEGER DEFAULT 2000,
  auto_save BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Deployment

1. Set up Cloudflare Workers
2. Configure environment variables in Cloudflare dashboard
3. Create KV namespace and R2 bucket
4. Update `wrangler.toml` with your resources
5. Run `npm run deploy`

## Common Issues

### CORS Errors
If frontend receives CORS errors, ensure the backend properly sets CORS headers:

```typescript
app.use('*', cors());
```

### JWT Verification
Make sure `JWT_SECRET` is properly set in environment variables.

### TypeScript Errors
If you see type errors, ensure:
1. `Env` type is properly imported in routes
2. Context variables are correctly typed in `types/env.ts`
3. `ContextVariableMap` is declared in `types/index.ts`
