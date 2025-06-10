# Obserdo (Todo App - Real-time Collaborative Task Management)

A modern, real-time collaborative todo application built with TypeScript, featuring live cursor tracking and infinite nested subtasks.

## Tech Stack

### Frontend
- **Framework**: React with TanStack Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query with optimistic updates
- **Forms**: TanStack Form for type-safe form handling
- **Tables**: TanStack Table for advanced data grid features
- **Real-time**: WebSocket for live collaboration
- **Build Tool**: Vite

### Backend
- **Runtime**: Bun.js
- **Framework**: Hono
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better-auth package for secure authentication and session management
- **Deployment**: Render.com

## Features

- ✨ Real-time collaboration with live cursor tracking
- 🔄 Infinite nested subtasks
- 🔒 Shareable todo lists with unique URLs
- 👥 Permission-based access control
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS and shadcn/ui
- ⚡ Fast development with Bun.js
- 🔌 Type-safe API with Hono
- 🗄️ Type-safe database operations with Drizzle ORM

## Future Improvements

If I had more time, I would add:

- 🧪 Comprehensive test suite with Vitest (unit), Playwright (e2e), and API tests
- 🔄 CI/CD pipeline with GitHub Actions (lint, test, build, deploy)
- 🗄️ Database migrations with Drizzle Kit and version control
- 🔒 Row Level Security (RLS) for multi-tenant data isolation
- 📊 Application monitoring with OpenTelemetry and Grafana
- 🔍 Structured logging with Pino and log aggregation
- 🔐 Enhanced authentication with OAuth2 and JWT refresh tokens
- 🛡️ Rate limiting and security headers with Hono middleware
- 📈 Performance monitoring with Lighthouse CI
- 🎨 Dark mode and theme customization

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install all dependencies from root
   bun install
   ```
3. Set up environment variables
4. Start the development servers:
   ```bash
   # Start server and client concurrently
   bun run dev:server
   bun run dev:client
   ```

## Environment Variables

### Client
`BETTER_AUTH_SECRET=`

`BETTER_AUTH_URL=`

### Server
`DATABASE_URL=`

`BETTER_AUTH_SECRET=`

----------

UBIQUITI FULL-STACK DEVELOPER
HOME ASSIGNMENT

## Technical requirements

- Language: TypeScript
- Framework: React
- Backend: Node

User Stories to Consider/Implement for the To-Do App
It's not mandatory to implement all of the given user stories. Use your judgment to deliver the
best user experience and a combination of user stories that - in your opinion - make sense and
showcase your capabilities in the time you have available.

- [x] ⚠️(required): I as a user can create to-do items, such as a grocery list.
- [x] ⚠️(required): I as another user can collaborate in real-time with user - so that we can
  (for example) edit our family shopping list together.
- [x] I as a user can mark to-do items as "done" - so that I can avoid clutter and focus on
      things that are still pending.
- [x] I as a user can filter the to-do list and view items that were marked as done - so that I
      can retrospect on my prior progress.
- [x] I as a user can add sub-tasks to my to-do items - so that I could make logical groups of
      tasks and see their overall progress.
- [] I as a user can specify cost/price for a task or a subtask - so that I can track my expenses / project cost.
- [] I as a user can see the sum of the subtasks aggregated in the parent task - so that in my
  shopping list I can see what contributes to the overall sum. For example I can have a
  task called "Salad", where I'd add all ingredients as sub-tasks, and would see how much
  a salad costs on my shopping list.
- [x] I as a user can make infinite nested levels of subtasks.
- [ ] I as a user can add sub-descriptions of tasks in Markdown and view them as rich text
  while I'm not editing the descriptions.
- [x] I as a user can see the cursor and/or selection of another-user as he selects/types when
  he is editing text - so that we can discuss focused words during our online call.
- [x] I as a user can create multiple to-do lists where each list has its unique URL that I can
      share with my friends - so that I could have separate to-do lists for my groceries and
      work related tasks.
- [] In addition to regular to-do tasks, I as a user can add "special" typed to-do items, that
  will have custom style and some required fields:

  - [] "work-task", which has a required field "deadline" - which is a date
  - [] "food" that has fields:
    - [] required: "carbohydrate", "fat", "protein" (each specified in g/100g)
    - [] optional: "picture" an URL to an image used to render this item

- [] I as a user can keep editing the list even when I lose internet connection, and can
  expect it to sync up with BE as I regain connection
- [] I as a user can use my VR goggles to edit/browse multiple to-do lists in parallel in 3D
  space so that I can feel ultra-productive
- [] I as a user can change the order of tasks via drag & drop
- [] I as a user can move/convert subtasks to tasks via drag & drop
- [x] I as a user can be sure that my todos will be persisted so that important information is
      not lost when server restarts
- [x] I as an owner/creator of a certain to-do list can freeze/unfreeze a to-do list I've created
      to avoid other users from mutating it

### Notes

- This test is meant to evaluate your coding skills. In order to do that, we need to see
  what you're capable of building yourself. It's all right to use AI assistance, but it has to
  be made clear where and for what purpose you have chosen to do so. We also strongly
  recommend against libraries that do all the work for you.
- Preferably send a link to a hosted/running application and to the repository where the
  source code is available.
- Please unpublish or mark the repository as private after it has been reviewed.
- In the README.md of your submission please list the stories you've chosen to
  implement. Your own ideas for stories will be appreciated too.
