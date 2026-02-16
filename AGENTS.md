# AGENTS.md - Storyweaver Development Guide

## Build & Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

> **Note:** No test framework is currently configured. Do not add tests unless explicitly requested.

## Project Structure

```
src/
├── main.tsx                 # App entry point (React 18 createRoot)
├── styles/                  # Global styles (index.css, theme.css, fonts.css)
└── app/
    ├── App.tsx              # Root component (default export)
    └── components/
        ├── figma/           # Figma-related components
        ├── ui/              # Reusable UI components (Radix-based, named exports)
        ├── APIGenerator.tsx
        ├── FigmaAudit.tsx
        ├── FileUpload.tsx
        ├── StoryCard.tsx
        ├── StoryList.tsx
        └── StoryMap.tsx
```

## Path Aliases

- `@/` resolves to `src/`

Example: `import Button from "@/app/components/ui/button"`

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6 with @tailwindcss/vite plugin
- **Styling**: Tailwind CSS v4 (no PostCSS config needed)
- **UI Library**: Radix UI primitives + custom shadcn/ui-style components
- **Icons**: lucide-react
- **Animation**: motion (Framer Motion)
- **Forms**: react-hook-form

## Code Style Guidelines

### TypeScript

- Use explicit interfaces for props and data types
- Prefer `type` for union types, `interface` for object shapes
- Always type function parameters and return values
- No tsconfig.json required (Vite handles TypeScript)

```typescript
// Good
interface Story {
  id: string;
  title: string;
  description: string;
}

function StoryCard({ story }: StoryCardProps) { ... }

// Avoid - implicit any
function handleClick(e) { ... }
```

### Component Patterns

- **UI Components**: Use named exports (e.g., `export { Button }`)
- **Page/Feature Components**: Use default exports for top-level components (e.g., `export default function App()`)
- Export component function as named function (PascalCase)
- Use `React.ComponentProps<"element">` for native HTML props

```typescript
// UI Component - named export
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("rounded-lg", className)} {...props} />;
}
export { Card };

// App/Page Component - default export
export default function App() { ... }
```

### Styling

- Use Tailwind CSS utility classes
- Use `cn()` utility (from `ui/utils.ts`) for conditional class merging
- Use `class-variance-authority` (cva) for component variants

```typescript
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva("inline-flex items-center justify-center...", {
  variants: {
    variant: { default: "...", destructive: "..." },
    size: { default: "...", sm: "...", lg: "..." },
  },
  defaultVariants: { variant: "default", size: "default" },
});
```

### Naming Conventions

- Components: PascalCase (e.g., `StoryCard.tsx`, `FileUpload.tsx`)
- Hooks: camelCase starting with `use` (e.g., `useState`, `useStoryData`)
- Utils/Constants: camelCase or kebab-case
- CSS classes: Tailwind utility classes

### Import Order

1. External libraries (React, Radix UI, etc.)
2. Internal imports (@/ path aliases)
3. Relative imports (./, ../)

```typescript
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Edit2, Trash2 } from "lucide-react";
import { cn } from "./utils";
```

### Error Handling

- Use try/catch for async operations
- Display user-friendly error messages via UI components
- Log errors appropriately for debugging

### Data Attributes

- Use `data-slot` attributes for component identification (Radix pattern)
- Example: `data-slot="button"`, `data-slot="card"`

### Tailwind CSS v4

- Uses `@tailwindcss/vite` plugin
- No separate PostCSS config needed for basic setup
- Use CSS variables for theming via Tailwind's native support
- Theme variables defined in `src/styles/theme.css`

### UI Component Library

This project uses Radix UI primitives wrapped with custom styling. When adding new components:

1. Find the appropriate Radix UI primitive (radix-ui.com)
2. Create component in `src/app/components/ui/`
3. Use `cn()` for class merging
4. Export named component and any variants
5. Follow the existing pattern in `button.tsx`, `card.tsx` as reference
6. Add `data-slot` attribute for component identification

### File Organization

- One component per file (or related small components in one file)
- Colocate related types when possible
- Keep UI components in `components/ui/`
- Keep feature components in `components/`
- Keep styles in `src/styles/`
