Of course. Here is the `aicontext.md` file, designed to give the AI a comprehensive and clear understanding of your project's goals, architecture, and standards.

You can save this in the root of your project directory.

---
# AI Context for Project "Veridict"

This document provides a global context for the AI assistant to ensure generated code and advice align with the project's architecture, technologies, and best practices.

## 1. Project Overview

The project is an **AI-powered content generation platform** named "Veridict". Its core mission is to enable the creation of credible, transparent, and well-sourced content. Key features include:
* **AI-assisted content generation** using prompts, tones, and styles.
* **Robust version control** for every post, showing a full history of changes.
* **Community-driven fact-checking** and content labeling (`FAKE`, `ACCURATE`, etc.).
* **Collaborative workflows** for multiple authors and editors.

## 2. Core Technologies

The application is built on the T3 Stack philosophy with a Supabase backend.
* **Framework:** Next.js (App Router)
* **Database:** Supabase (PostgreSQL)
* **ORM:** Prisma
* **Authentication:** NextAuth.js
* **Styling:** Tailwind CSS
* **UI Components:** shadcn/ui
* **AI/LLM Integration:** LangChain

## 3. Key Architectural Patterns

* **Database Security:** We use Supabase's **Row-Level Security (RLS)** extensively. All database queries from the client must respect RLS policies. User roles (`AUTHOR`, `EDITOR`, `ADMIN`) are central to these policies.
* **Content Structure:** Post content is not a single text block. It is stored as **JSON (`contentBlocks`)** to support a rich, block-based editor similar to Notion.
* **Asynchronous Jobs:** Long-running tasks, especially **LLM calls via LangChain**, must be handled asynchronously using background jobs to avoid blocking the UI. The API should return an immediate response.
* **Optimized Feeds:** For fetching lists of posts (e.g., the main feed), we query the **`post_feed_view`** materialized view in the database. This view is lightweight and excludes heavy data like `contentBlocks` and prompts.
* **Frontend Philosophy:** We favor **React Server Components (RSC)** by default for data fetching and performance. Client Components should only be used when interactivity is required (`"use client"`).

## 4. Development Guidelines

* **Language:** All code must be written in **TypeScript**. Use strict mode and aim for full type safety.
* **API Routes:** Backend logic is handled in Next.js API Routes. Follow single-responsibility principles for each route.
* **UI Components:** When building UI, prefer using or extending components from the **shadcn/ui** library for consistency.
* **Code Quality:** All generated code should be considered production-ready. It must be clean, readable, and include relevant comments explaining complex logic.
* **State Management:** For client-side state, use standard React hooks (`useState`, `useContext`). Avoid complex state management libraries unless absolutely necessary.