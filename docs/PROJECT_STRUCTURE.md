
# Project Structure

This document explains the project's directory structure.

- **`.dockerignore`**: Specifies files and directories to ignore when building a Docker image.
- **`.gitignore`**: Specifies files and directories to ignore for Git version control.
- **`AUTHENTICATION_SETUP.md`**: Instructions for setting up authentication.
- **`check-supabase.ts`**: A TypeScript script for checking the Supabase connection.
- **`check-table-structure.sql`**: An SQL script for verifying the database table structure.
- **`components.json`**: Configuration for shadcn/ui components.
- **`DATABASE_SETUP.md`**: Instructions for setting up the database.
- **`eslint.config.mjs`**: ESLint configuration for code linting.
- **`fix-search-rpc.sql`**: An SQL script for fixing the search remote procedure call.
- **`LAPORAN_ANALISIS_KODE.md`**: A report on code analysis.
- **`next.config.ts`**: Next.js configuration.
- **`package-lock.json`**: Exact versions of project dependencies.
- **`package.json`**: Project dependencies and scripts.
- **`postcss.config.mjs`**: PostCSS configuration for styling.
- **`README.md`**: General information about the project.
- **`supabase-schema.sql`**: The Supabase database schema.
- **`tailwind.config.ts`**: Tailwind CSS configuration.
- **`tsconfig.json`**: TypeScript configuration.
- **`.git`**: Git version control directory.
- **`.history`**: Directory for local file history.
- **`.next`**: Next.js build output directory.
- **`db`**: Contains the local database file.
- **`node_modules`**: Directory for npm packages.
- **`prisma`**: Contains the Prisma schema file.
- **`public`**: Contains static assets like images and robots.txt.
- **`src`**: Contains the application's source code.
  - **`app`**: The main application directory for Next.js App Router.
    - **`(admin)`**: Grouped routes for the admin panel.
    - **`api`**: API routes.
    - **`entry`**: Dynamic routes for entries.
    - **`login`**: The login page.
    - **`search`**: The search page.
    - **`globals.css`**: Global CSS styles.
    - **`layout.tsx`**: The root layout for the application.
    - **`page.tsx`**: The main landing page.
  - **`components`**: Reusable React components.
    - **`ui`**: UI components from shadcn/ui.
  - **`hooks`**: Custom React hooks.
  - **`lib`**: Library functions and utilities.
- **`docs`**: Project documentation.
  - **`TECH_STACK.md`**: Documentation of the technologies used.
  - **`PROJECT_STRUCTURE.md`**: This file, explaining the project structure.
