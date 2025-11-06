# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mi Bienestar** (My Wellness) - A women's wellness and health tracking application for symptom logging, cycle tracking, and self-care management. Built with Lovable platform integration.

**Language**: The UI is in Spanish ("Mi Bienestar" means "My Wellness").

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn-ui (Radix UI primitives) + Tailwind CSS
- **Backend**: Supabase (PostgreSQL database with Row Level Security)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner (toast notifications)

## Development Commands

```bash
# Start development server (runs on http://[::]:8080)
npm run dev

# Build for production
npm run build

# Build for development mode
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Project Architecture

### Directory Structure

```
src/
├── pages/              # Route components (Index.tsx, NotFound.tsx)
├── components/         # Feature components (SymptomTracker, CycleCalendar, etc.)
│   └── ui/            # shadcn-ui reusable components
├── integrations/
│   └── supabase/      # Supabase client and auto-generated types
├── hooks/             # Custom React hooks
└── lib/               # Utility functions

supabase/
└── migrations/        # Database schema migrations
```

### Routing

- Routes are defined in `src/App.tsx`
- Currently single-page app with Index route
- Add new routes ABOVE the catch-all "*" NotFound route

### Database Schema

Two main tables managed by Supabase:

**`profiles`** - User profile information
- `id` (uuid, references auth.users)
- `name` (text)
- `last_period_date` (date)
- `avg_cycle_length` (integer)
- `is_irregular` (boolean)
- Auto-created on user signup via trigger

**`daily_logs`** - Daily symptom and journal entries
- `user_id` (uuid, references auth.users)
- `log_date` (date)
- `period_started` (boolean)
- `period_ended` (boolean)
- `symptoms` (text array)
- `journal_entry` (text)
- Unique constraint on (user_id, log_date)

**Security**: All tables use Row Level Security (RLS) policies to ensure users can only access their own data.

### Supabase Integration

- Client initialized in `src/integrations/supabase/client.ts`
- Database types auto-generated in `src/integrations/supabase/types.ts`
- Environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_SUPABASE_PROJECT_ID`

**Important**: Supabase types are auto-generated. Do not manually edit `types.ts`.

### Component Patterns

Components follow these conventions:

1. Use shadcn-ui components from `@/components/ui/`
2. Import path alias `@` maps to `./src`
3. Toast notifications via `toast()` from "sonner"
4. Styling with Tailwind classes and CSS custom properties

Example component structure:
```tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const FeatureComponent = () => {
  const handleAction = () => {
    toast.success("Success message");
  };

  return (
    <Card className="p-6">
      {/* Component content */}
    </Card>
  );
};
```

### State Management

- Use TanStack Query for server state (Supabase data fetching)
- QueryClient configured in `src/App.tsx`
- Local component state with `useState` for UI interactions

## Key Configuration Files

- `vite.config.ts` - Vite configuration with React SWC plugin and path aliases
- `tailwind.config.ts` - Tailwind CSS configuration
- `components.json` - shadcn-ui component configuration
- `tsconfig.json` - TypeScript configuration
- `.env` - Environment variables (Supabase credentials)

## Lovable Platform Integration

This project was created with Lovable and includes:
- `lovable-tagger` plugin in dev mode
- Automatic commits from Lovable platform changes
- Project URL: https://lovable.dev/projects/d9f4bea9-04a7-46a2-9914-80228d421fd2

Changes made via Lovable are automatically committed to the repository.

## Database Migrations

When modifying the database schema:

1. Create new migration file in `supabase/migrations/`
2. Follow naming convention: `YYYYMMDDHHMMSS_description.sql`
3. Apply migrations through Supabase dashboard or CLI
4. Regenerate types by running Supabase type generation

**Note**: The migration file includes auto-update triggers for `updated_at` fields and a trigger to auto-create profiles on user signup.

## Common Workflows

### Adding a New Feature Component

1. Create component in `src/components/FeatureComponent.tsx`
2. Import shadcn-ui components from `@/components/ui/`
3. Use Spanish text for UI labels
4. Add to relevant page (e.g., `src/pages/Index.tsx`)

### Adding a New Route

1. Create page component in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx` BEFORE the "*" catch-all route:
   ```tsx
   <Route path="/new-page" element={<NewPage />} />
   ```

### Working with Supabase Data

1. Import supabase client: `import { supabase } from "@/integrations/supabase/client"`
2. Use with TanStack Query for data fetching
3. Types are available from `@/integrations/supabase/types`
4. Example:
   ```tsx
   const { data, error } = await supabase
     .from('daily_logs')
     .select('*')
     .eq('user_id', userId);
   ```

## shadcn-ui Components

New shadcn-ui components can be added via:
```bash
npx shadcn@latest add [component-name]
```

Configuration is in `components.json` with Tailwind CSS integration.
