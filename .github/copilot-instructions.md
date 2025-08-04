# Copilot Instructions for AbQuanta News
This document provides GitHub Copilot with structured guidelines to assist in the development of AbQuanta News, a political intelligence platform. The focus is on creating a collaborative, context-aware coding environment that supports iterative development and AI integration.

## 🔍 Bug & Inconsistency Detection

Assist in identifying:

- Stale AI agent endpoints or
- Inconsistent data formats
- Unhandled edge cases

## ✨ Language for Prompts
Use clear and concise language when formulating prompts for AI agents. Include relevant context and specify the desired output format.

## ⚠️ Anti-patterns
This isn't just code — it's a signal in the noise.

---

## 🔎 Current Implementation Status

### ✅ Completed Features
- **Authentication & Authorization** - Google OAuth with role-based access control
- **Content Management** - Full CRUD with draft/publish workflow
- **Multi-Author Collaboration** - Intelligent user search and author management
- **Voting System** - Community-driven content ranking and engagement
- **Search Infrastructure** - Redis-based indexing with PostgreSQL fallback
- **Real-time Updates** - Database triggers and listeners for cache invalidation
- **AI Integration Foundation** - Supabase Edge Functions with mock fallbacks

### 🚧 In Progress
- **LangGraph Workflows** - Advanced AI agent orchestration
- **Content Analytics** - Performance insights and engagement metrics
- **Advanced Search** - Semantic search capabilities and autocomplete

### 📋 Next Priority Items
- **Production AI Deployment** - Replace mock responses with live AI generation
- **Mobile Optimization** - Responsive design improvements
- **Performance Monitoring** - Error tracking and analytics integration

### 🚨 CRITICAL TODO: Theme System Overhaul
**Status**: BROKEN - App has no styles after failed theme reboot attempt
**Priority**: HIGH - Blocking all UI development

**Issue Summary**: 
- Attempted to fix `#0D0D0D` dark mode background but encountered persistent hydration errors
- Hard reboot removed all styles, leaving app unstyled
- next-themes + shadcn/ui + Tailwind CSS v4 integration is problematic

**Research Needed**:
- Best practices for Next.js 15 + shadcn/ui theming without hydration issues
- Tailwind CSS v4 CSS variables vs HSL/OKLCH color formats
- SSR-safe theme implementation patterns
- Alternative theme libraries or custom solutions

**Files Affected**: 
- `src/styles/globals.css` (corrupted)
- `src/components/theme-provider.tsx` (needs rework)
- `src/app/layout.tsx` (simplified but broken)

---

## 🧠 Context-Aware Development Patterns

### Political Content Focus
Understand that this platform specializes in:
- **Western Hemisphere Politics** (US, Canada, Latin America)
- **International Relations** and security cooperation
- **Trade & Economics** analysis
- **Migration** and border policy
- **Security** and hemispheric cooperation

### Content Structure
- Posts use **JSON-based `contentBlocks`** for rich editing
- Support for multiple content types: paragraphs, lists, quotes, citations
- **Version control** system tracks all changes with parent/child relationships
- **Analytics integration** tracks views, engagement, and source clicks

### Search & Discovery
- **Redis-first** search with automatic fallback to PostgreSQL
- **Real-time indexing** via database triggers and listeners
- **Category filtering** and advanced sort options (relevance, date, views, votes)
- **Suggestion system** for user guidance and autocomplete

---

## 🤖 AI Agent Integration Guidelines

### Current AI Service Architecture
```typescript
// Primary service interface
AIAgentService.generateContentSimple(request: AIAgentRequest)

// Supabase Edge Function endpoint
const ENDPOINT = 'https://kiiukzhynzsjjykkcabr.supabase.co/functions/v1/AI_Agent'

// Request structure
interface AIAgentRequest {
  prompt: string;
  sources?: string[];
  tone: 'neutral' | 'optimistic' | 'analytical' | 'professional' | 'conversational';
  style: 'standard' | 'journalistic' | 'academic' | 'blog' | 'technical';
  length: 'short' | 'medium' | 'long';
}
```

### AI Development Patterns
- **Mock-first development** - All AI features work with realistic mock data
- **Graceful degradation** - System functions even when AI services are unavailable
- **Review flags** - AI-generated content marked for human review
- **Streaming support** - Handle real-time content generation
- **Error boundaries** - Robust error handling for AI service failures

### Content Generation Workflow
1. **User Input** - Prompt, tone, style, length preferences
2. **AI Processing** - Supabase Edge Function with LangChain/LangGraph
3. **Content Blocks** - Structured JSON output for rich content
4. **Review Process** - Human review for sensitive political content
5. **Publication** - Integration with search indexing and analytics

---

## 🔧 Development Workflow Integration

### Database & Migrations
- Use **Prisma** for all database operations
- Run `pnpm db:push` for schema changes
- Execute `pnpm db:seed` for sample data
- Monitor with `pnpm db:studio` for visual inspection

### Search System Maintenance
- **Redis indexing** happens automatically via database triggers
- Use `SearchIndexer.reindexAll()` for full reindexing
- Monitor `DatabaseListener` for real-time sync issues
- Test search with both Redis and PostgreSQL fallback

### AI Development Testing
- Use `/test-ai` page for AI service validation
- Mock services always available for development
- Test connection with `AIAgentService.testConnection()`
- Validate content generation before integration

### Performance Considerations
- **Server Components** by default, `"use client"` only when needed
- **tRPC** for type-safe API communication
- **Redis caching** for expensive queries
- **Optimistic updates** for better UX

---o Avoid

- Don't assume REST; we use **tRPC**.
- Don't scaffold boilerplate Next.js pages manually — follow App Router patterns.
- Don't mix client/server logic unless marked with `use client`.
- Don't overwrite vibe-coded TODO blocks without preserving context.
- Don't close half-baked implementations unless explicitly directed.
- Don't bypass Redis cache or search indexing in data mutations.
- Don't ignore AI agent mock fallbacks in development. natural prompts like:

> "Draft the RSC for the article detail view using tRPC + Prisma."
> "Generate a Prisma seed for mock political posts across 3 categories."
> "Create a Redis search indexer for real-time post updates."
> "Build a Supabase Edge Function for AI content generation."
> "Implement database triggers for search cache invalidation."

Copilot should recognize that this is a *living* experiment, not a closed system.pabase Edge Functions
- Search indexing inconsistencies between Redis and PostgreSQL
- Seed scripts that don't reflect the current schema
- Dead types or unused `zod`/`trpc` definitions
- Draft components in `ui/` or `pages/` not yet wired
- Redundant Tailwind class names or layout conflicts
- Real-time database trigger and listener issues
- AI content generation mock vs. production inconsistenciese **Vibe Coding Protocol** for AbQuanta News — a political intelligence platform where code is composed like jazz: iterative, expressive, and context-aware. These instructions guide GitHub Copilot to co-create in harmony with our emergent, full-stack development style.

---

## 🧠 Developer Philosophy

- Code is a **flow**, not a product.
- Exploration precedes structure — let the rhythm lead, then clean up later.
- Support "raw idea" commits and unstable fragments as creative material.
- Context is multi-dimensional — include latent goals from the roadmap.

---

## 🛠️ Tech Stack Priority

Focus on patterns and idioms for:

- **Next.js 15** with App Router and Server Components
- **TypeScript** with strict mode on
- **tRPC** for backend contracts
- **Prisma** for PostgreSQL interaction
- **NextAuth.js** with Google OAuth
- **Tailwind CSS** (utility-first)
- **Redis** for search indexing and caching
- **Supabase Edge Functions** for AI workflows
- **LangGraph / LangChain** for generative AI workflows
- **PostgreSQL** with advanced search capabilities
- **Node.js** for scripts/tooling

---

## 🎨 Style & Syntax Preferences

- Functional, composable code
- Prefer `async/await` over chaining
- Tailwind-first UI — minimal CSS files
- Avoid verbose comments; instead, use:
  - TODO: for pending logic
  - NOTE: for rationales and decisions
- Name variables with intent: `analyzePostSentiment`, not `func1`
- Organize by feature domain (not tech stack)

---

## 🔍 Bug & Inconsistency Detection

Assist in identifying:

- Stale feature flags or abandoned routes
- Seed scripts that don’t reflect the current schema
- Dead types or unused `zod`/`trpc` definitions
- Draft components in `ui/` or `pages/` not yet wired
- Redundant Tailwind class names or layout conflicts

---

## 🧬 Cognitive Flow Guidance

Respect these looping phases:

1. **Impulse** — raw ideas in code; Copilot may assist in messy, fragmentary ways
2. **Emergence** — suggest reusable logic and modular refactors
3. **Resonance** — align across design, content, infra, and data layers
4. **Handoff** — propose stubs or types for AI workflows or API integrations

Encourage convergence but avoid flattening ambiguity too early.

---

## 🤖 AI Integration Patterns

Support AI workflows with:

- **Edge Functions** - Supabase serverless functions for LangGraph/LangChain
- **Streaming Responses** - Handle streaming AI content generation
- **Mock Fallbacks** - Graceful degradation when AI services are unavailable
- **Content Blocks** - JSON-based content structure for rich editing
- **Review Flags** - AI-generated content requiring human review
- **Real-time Indexing** - Sync AI content with search systems

---

## 🧠 Interdisciplinary Intelligence

Support prompts/code that blend:

- **Motion graphics** (e.g., animated UI with Framer Motion)
- **Data science** (Python pipelines, ML agents, LangGraph)
- **Content systems** (editor logic, markdown pipelines, GPT-based generation)
- **Infrastructure orchestration** (Terraform + GitHub Actions for deploys)

---

## 📦 File Structure Patterns

- `src/app/` – Next.js 15 App Router pages with RSCs
- `src/components/ui/` – shadcn/ui atomic components with animation support
- `src/server/api/routers/` – tRPC endpoints organized by domain
- `src/lib/` – utilities, AI services, validators, and embeddings
- `src/server/` – database, Redis, search indexing, and real-time listeners
- `prisma/` – schema, migrations, and seed data synchronized
- `supabase/functions/` – Edge Functions for AI agent workflows

---

## 🔐 Auth & Role Context

- All pages/components must respect auth + RBAC context
- Copilot should infer `session` and user role patterns from NextAuth
- Suggest secure gate logic and role-based UI variants

---

## 🧪 Test & Validation

- Prefer logic-based unit tests over UI tests for now
- Use `vitest` or `jest`, no hard requirement for e2e
- Suggest test stubs for critical functions (auth, AI pipelines, search logic)
- Test AI agent fallbacks and mock responses
- Validate search indexing and Redis cache consistency

---

## ✨ Language for Prompts

Use natural prompts like:

> “Draft the RSC for the article detail view using tRPC + Prisma.”
> “Generate a Prisma seed for mock political posts across 3 categories.”
> “Suggest Terraform for PostgreSQL on Railway.”
> “Create Dockerfile for LangGraph + Next.js hybrid runtime.”

Copilot should recognize that this is a *living* experiment, not a closed system.

---

## ⚠️ Anti-patterns to Avoid

- Don’t assume REST; we use **tRPC**.
- Don’t scaffold boilerplate Next.js pages manually — follow App Router patterns.
- Don’t mix client/server logic unless marked with `use client`.
- Don’t overwrite vibe-coded TODO blocks without preserving context.
- Don’t close half-baked implementations unless explicitly directed.

---

## 🌐 Contribute to the Flow

Copilot, your job is to **amplify the intuition** of the coder, not replace it. Suggest, don’t dictate. Leave space for emergence. Help harmonize tech stacks into expressive, deployable political intelligence systems.

This isn’t just code — it’s a signal in the noise.


## **💡 STRUCTURED DEVELOPMENT SESSIONS**

*A Framework for Mindful Coding & Creation*

This framework provides a structured rhythm for development sessions, turning them into focused, productive, and enjoyable experiences. It is designed to be stack-agnostic and adaptable to any project, from web applications and data analysis scripts to infrastructure code and creative projects.

-----

### **Phase 1: 🔍 DISCOVERY** — *Understand & Empathize*

**Duration**: 10–15 minutes
**Mindset**: Curious Observer

This phase is about grounding yourself in the project's current reality. Before changing anything, seek to understand the "what" and "why" of the existing system with curiosity and empathy, not judgment.

**Discovery Questions**:

  - What is the stated goal vs. the actual behavior?
  - Where might a user (or the next developer) experience friction or confusion?
  - Are there recurring patterns, modules, or logic that could be simplified or abstracted?
  - What is the current performance landscape? Where are the bottlenecks?
  - What technical debt or quick fixes exist? (`TODO`, `FIXME`, `HACK`)

**Suggested Actions**:

  - **Code & Feature Audit**: Review key modules, API surfaces, or user interfaces.
  - **Performance Check**: Glance at monitoring dashboards, logs, or run basic timing commands.
  - **Documentation Scan**: Compare the documentation (e.g., `README.md`, wikis) with the actual codebase.
  - **Technical Debt Search**:
    ```bash
    # Search for common markers of technical debt across the project
    grep -r -E "TODO|FIXME|HACK|XXX" . --exclude-dir=node_modules --exclude-dir=.git
    ```

**Outcome**: A clear, compassionate understanding of the system's current state, user pain points, and opportunities for improvement.

-----

### **Phase 2: 🗺️ STRATEGIZE** — *Ideate & Design*

**Duration**: 15–20 minutes
**Mindset**: Visionary Architect

With a clear understanding of the present, you can now envision a better future. This phase is for high-level thinking, planning, and designing a solution before writing a single line of implementation code.

**Design Questions**:

  - How can we make this process more intuitive, efficient, or delightful?
  - What is the simplest, most elegant solution that meets the core requirement?
  - How can we introduce this change with minimal disruption to existing workflows?
  - What are the performance-critical parts of our plan? How can we mitigate them (e.g., caching, lazy loading, async operations)?
  - What would our future selves thank us for building today?

**Planning Artifacts**:

  - **Sketch the Ideal Workflow**: Use a whiteboard, notebook, or a digital tool to map out the desired user journey or data flow.
  - **Define the Technical Approach**: Outline the major components, function signatures, or class structures.
  - **Identify Potential Risks**: Note down dependencies, edge cases, or potential failure points and plan for graceful fallbacks.

**Tools**: A pen and paper, a whiteboard app (like Miro or Excalidraw), or a simple text file for outlining.

**Outcome**: A clear, actionable plan that balances technical excellence with user value, providing a roadmap for the creation phase.

-----

### **Phase 3: ⚡ CREATE** — *Prototype & Refine*

**Duration**: 45–60 minutes
**Mindset**: Flow State Creator

This is the focused "deep work" phase. With a clear plan, you can immerse yourself in the act of creation. The goal is to build a working prototype that embodies the vision from the previous phase.

**Execution Principles**:

  - **Start with a Skeleton**: Implement the simplest possible version first to validate the core concept.
  - **Layer Complexity Incrementally**: Add features, error handling, and optimizations in progressive steps.
  - **Write Self-Documenting Code**: Use clear, descriptive names for variables, functions, and classes.
  - **Optimize Where It Matters**: Implement performance patterns (like caching) for operations you've identified as expensive.

**Generic Development Flow (Pseudocode)**:

```pseudocode
function performComplexOperation(input) {
    // 1. Validate input early (Guard Clause)
    if (!isValid(input)) {
        return { error: "Invalid input provided. Please provide [guidance]." }
    }

    // 2. Check for cached results for expensive operations
    cacheKey = generateCacheKey(input);
    if (cachedResult = cache.get(cacheKey)) {
        return cachedResult;
    }

    // 3. Perform the core logic
    result = process(input);

    // 4. Cache the new result
    cache.set(cacheKey, result);

    // 5. Return the result
    return result;
}
```

**Quality Gates**:

  - Does this change feel powerful and intuitive to use?
  - Are error messages helpful and guiding?
  - Is the code clear enough for another developer to understand without comments?

**Outcome**: A working, well-crafted piece of code that solves the target problem elegantly.

-----

### **Phase 4: 🔬 VALIDATE** — *Test & Iterate*

**Duration**: 20–25 minutes
**Mindset**: Curious Scientist

Every hypothesis needs to be tested. This phase is about rigorously validating your creation against real-world conditions to ensure it's robust, performant, and genuinely useful.

**Testing Philosophy**:

  - **Test with Realistic Data**: Use data that mirrors real-world use cases, not just "happy path" synthetic data.
  - **Validate Performance Claims**: Ensure that optimizations (like caching) actually improve the user experience under load.
  - **Ensure Graceful Degradation**: Test how the system behaves when dependencies fail or edge cases are encountered. Does it fail gracefully or catastrophically?
  - **User Experience Testing**: Step into the user's shoes. Is the workflow smooth? Is the output clear and helpful?

**Validation Actions**:

  - **Unit & Integration Tests**: Run the automated test suite to check for regressions.
  - **Manual Performance Checks**:
    ```bash
    # Example: Time a script execution before and after optimization
    time ./your-script.sh --input "realistic-query"
    ```
  - **User Acceptance Testing (UAT)**: Manually walk through the new feature as if you were the end-user.
  - **Review Logs & Outputs**: Check application logs for unexpected errors or warnings.

**Outcome**: Confidence that the new feature is robust, reliable, and enhances the user's capabilities.

-----

### **Phase 5: 🌱 SYNTHESIZE** — *Reflect & Improve*

**Duration**: 15–20 minutes
**Mindset**: Wise Gardener

The session concludes by tending to the garden. This involves documenting what was learned, cleaning up, and improving the development environment itself, ensuring future sessions are even more effective.

**Reflection & Documentation**:

  - **Document New Patterns**: Did a useful pattern emerge? Add it to the team's wiki, codebase documentation, or a design patterns library.
  - **Update Public Documentation**: Update the `README.md`, API docs, or user guides to reflect the changes.
  - **Capture Key Insights**: Note down any "aha\!" moments, tricky problems solved, or lessons learned about the system's architecture.

**Environment & Tooling Enhancement**:

  - **Identify Workflow Friction**: Was there anything tedious about this session? (e.g., running tests, linting, navigating code).
  - **Create Snippets & Aliases**: Automate repetitive tasks by creating code snippets in your IDE or shell aliases.
  - **Refine Your IDE/Editor Settings**:
    ```json
    // Example: Generic settings to improve a project's DX
    {
      "files.exclude": {
        "**/.git": true,
        "**/__pycache__": true,
        "**/.DS_Store": true
      },
      "search.exclude": {
        "**/node_modules": true,
        "**/dist": true
      },
      "editor.rulers": [80, 120]
    }
    ```

**Reflection Questions**:

  - What went well in this session? What could be improved?
  - What patterns are ready to be extracted into a shared library or module?
  - How did our initial plan hold up against the reality of implementation?
  - What is the most important thing to tackle in the next session?

**Outcome**: Documented wisdom, a cleaner codebase, and an enhanced development environment that sets you up for future success.

Here is the content converted into a ready-to-use Markdown file for your repo — perfect as `docs/git-flow.md` or to embed in `CONTRIBUTING.md`.


# 🧭 Git & Version Control Guide

Version control should amplify flow — not interrupt it. These practices ensure clean history, contextual commits, and resilience in a collaborative, experimental codebase.

---

## 🚦 1. Branch Strategy

| Branch        | Purpose                                 | Notes                                   |
|---------------|-----------------------------------------|-----------------------------------------|
| `main`        | Production-ready, auto-deployed         | Always deployable; protect with PR rules |
| `dev`         | Active development trunk                | CI passes required; rebased into `main` |
| `feat/*`      | New features or modules                 | e.g., `feat/ai-post-generator`          |
| `fix/*`       | Bug fixes                               | e.g., `fix/cache-invalidation`          |
| `chore/*`     | Cleanup, refactors, tooling             | e.g., `chore/seed-db-reset`             |
| `exp/*`       | Experiments and vibe prototypes         | Not always merged, but valuable         |

> 🔁 **Rule**: Feature branches are rebased onto `dev`, not merged. Avoid merge commits unless necessary.

---

## 📓 2. Commit Style & Rules

Use **Conventional Commits**, but with expressive, purposeful summaries.

```

<type>(<scope>): <short summary>

<body explaining the intention or method>
```

### Common Types:

* `feat`: new functionality
* `fix`: bug fix
* `chore`: internal tooling, setup, refactors
* `docs`: updates to documentation
* `test`: adding or fixing tests
* `perf`: performance improvements
* `exp`: experimental code or PoC

### Examples:

```bash
feat(post-ai): add basic summarization logic using GPT-4
fix(cache): invalidate category cache on post create
chore(seed): add support for tech topic dataset
docs(readme): update instructions for Redis setup
```

> ✅ **Tip**: Commits are narrative steps, not file diffs. Each should answer: *Why this change now?*

---

## 🧪 3. Local Flow Commands

### Initial Setup

```bash
git clone git@github.com:your-org/your-repo.git
git checkout dev
```

### Standard Feature Flow

```bash
git checkout -b feat/topic-switching
# Develop...

git add .
git commit -m "feat(topic): support dynamic topic seeding for tech"
git pull --rebase origin dev
git push -u origin feat/topic-switching
```

> 💬 Create a draft PR early if collaboration is expected.

### Merging Into Dev

```bash
# When ready
gh pr create --base dev --fill
gh pr merge --squash
```

---

## 🧼 4. Rebasing & History Hygiene

Keep commit history **linear and meaningful**. Before pushing:

```bash
git fetch origin
git rebase origin/dev
# Resolve conflicts if any
git push --force-with-lease
```

> ⚠️ Avoid rebasing `main` or shared branches unless coordinated.

---

## 🧹 5. Cleanup & Housekeeping

* Delete merged branches:

  ```bash
  git branch -d feat/foo
  git push origin --delete feat/foo
  ```

* Prune old local branches:

  ```bash
  git fetch --prune
  git branch --merged | grep -v main | xargs git branch -d
  ```

---

## 🔐 6. Sensitive Data Rules

* Never commit `.env`, secrets, or credentials
* Use `.env.example` with placeholders
* Recommended `.gitignore` entries:

  ```
  .env
  *.local
  /tmp
  /node_modules
  /dist
  ```

> 🚨 Consider using `git-secrets` or pre-commit hooks to catch secrets.

---

## 🧠 7. Commit Philosophy

* Commits should explain the *why* and capture intent
* Avoid generic messages like `wip`, `update`, `fix2`
* Use small, atomic commits for clarity and ease of review

> 🎯 Aim for *narrative commits* over mechanical snapshots.

---

## 🛠 8. CI/CD Readiness

* Keep `main` always green (CI passing)
* Recommended GitHub Actions:

  * Type checks (`tsc`, `mypy`, etc.)
  * Lint/format checks (`eslint`, `prettier`)
  * DB seed + smoke test
  * Optional: Commit message linter

---

## 🔄 9. Git Aliases for Speed

```bash
git config --global alias.s "status -sb"
git config --global alias.cm "commit -m"
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.rb "rebase -i"
git config --global alias.lg "log --oneline --graph --decorate"
```

---

## 📜 Summary Checklist

| Practice                  | Status |
| ------------------------- | ------ |
| ✅ Branch per feature/bug  | ✔️     |
| ✅ Rebase before push      | ✔️     |
| ✅ Conventional commits    | ✔️     |
| ✅ Delete merged branches  | ✔️     |
| ✅ CI/CD ready             | ✔️     |
| ✅ Secrets never committed | ✔️     |
| ✅ .env.example maintained | ✔️     |

---

> 🌀 Git is not just version control — it’s **memory, rhythm, and accountability**. Respect the history you're creating.

