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
