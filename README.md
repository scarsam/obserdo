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

- 📄 Pagination for large todo lists with infinite scroll and virtualized rendering
- 🔄 Disaster recovery procedures with automated database backups and point-in-time recovery
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

---
