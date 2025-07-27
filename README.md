# AbQuanta News

**A Modern Political News & Analysis Platform**

AbQuanta News is an advanced political news platform built with the T3 Stack, designed to deliver high-quality geopolitical analysis and news content. The platform focuses on Western Hemisphere politics, international relations, and comprehensive political coverage with AI-enhanced content generation capabilities.

## Getting Started

1. **Environment Setup**
   ```bash
   cp .env.example .env
   # Fill in your actual environment variables
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Database Setup**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

4. **Start Development Server**
   ```bash
   pnpm dev
   ```

## Features

### Current Features (MVP)
- 🔐 **Authentication System** - Secure Google OAuth integration with role-based access control
- 📝 **Content Management** - Full CRUD operations for articles with draft/publish workflow
- � **Multi-Author Support** - Collaborative authoring with intelligent user search and management
- 🏷️ **Smart Categorization** - Dynamic category filtering with accurate published post counting
- 📊 **User Dashboard** - Comprehensive post management and analytics
- 🗳️ **Voting System** - Community-driven content ranking and engagement
- 🎯 **Political Focus** - Specialized content for US Politics, Latin America, Trade & Economics, Migration, Security, and International Relations
- 🔍 **Advanced Search** - Debounced user search with partial matching and real-time suggestions

### Planned Features (Roadmap)
- 🤖 **LangGraph Integration** - Advanced AI workflows for content generation and analysis
- 📈 **Content Analytics** - Deep insights into article performance and engagement metrics
- 🌐 **Multi-language Support** - Expand coverage to global political landscapes
- 📱 **Mobile App** - Native mobile experience for on-the-go news consumption
- 🔔 **Real-time Notifications** - Breaking news alerts and personalized content recommendations
- 🎙️ **Podcast Integration** - Audio content generation and distribution
- 📊 **Data Visualization** - Interactive charts and graphs for political trends
- 🤝 **API Ecosystem** - Public API for third-party integrations and data access

## Tech Stack

### Core Technologies
- **[Next.js 15](https://nextjs.org)** - React framework with App Router
- **[NextAuth.js](https://next-auth.js.org)** - Authentication and session management
- **[Prisma](https://prisma.io)** - Database ORM with PostgreSQL
- **[tRPC](https://trpc.io)** - End-to-end typesafe APIs
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety and developer experience

### Planned Integrations
- **[LangGraph](https://langchain-ai.github.io/langgraph/)** - Advanced AI workflows and agent orchestration
- **[LangChain](https://langchain.com/)** - AI application development framework
- **OpenAI GPT Models** - Content generation and analysis
- **Vector Databases** - Semantic search and content recommendations
- **Redis** - Caching and real-time features

## Architecture Overview

AbQuanta News follows a modern, scalable architecture:

- **Frontend**: Next.js with React Server Components and TypeScript
- **Backend**: tRPC API routes with Prisma ORM
- **Database**: PostgreSQL with comprehensive relational schema
- **Authentication**: NextAuth.js with Google OAuth provider
- **Styling**: Tailwind CSS with shadcn/ui components
- **Deployment**: Vercel with serverless functions

## Development Roadmap

### Phase 1: MVP Foundation ✅ 
- [x] Core platform architecture
- [x] User authentication and role management
- [x] Content creation and management system
- [x] Multi-author collaboration features
- [x] Category-based content organization
- [x] Voting and engagement system

### Phase 2: AI Integration 🚧
- [ ] LangGraph workflow implementation
- [ ] Automated content generation pipelines
- [ ] Intelligent content summarization
- [ ] Real-time fact-checking integration
- [ ] Sentiment analysis for political content

### Phase 3: Advanced Features 📋
- [ ] Comprehensive analytics dashboard
- [ ] Mobile application development
- [ ] Multi-language content support
- [ ] Advanced search with semantic capabilities
- [ ] Real-time collaboration tools

### Phase 4: Ecosystem Expansion 🔮
- [ ] Public API development
- [ ] Third-party integrations
- [ ] Podcast and multimedia content
- [ ] Data visualization tools
- [ ] Community features and forums

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

### Quick Deployment
1. **Vercel Deployment** (Recommended)
   - Connect your GitHub repository to Vercel
   - Configure environment variables in Vercel dashboard
   - Automatic deployments on every push to main branch

2. **Database Setup**
   - Use Vercel Postgres or external PostgreSQL provider
   - Run `npx prisma db push` to create tables
   - Run `npx prisma db seed` to populate with sample data

3. **Environment Variables**
   ```env
   DATABASE_URL="your_postgresql_connection_string"
   NEXTAUTH_SECRET="your_nextauth_secret"
   NEXTAUTH_URL="https://your-domain.vercel.app"
   GOOGLE_CLIENT_ID="your_google_oauth_client_id"
   GOOGLE_CLIENT_SECRET="your_google_oauth_client_secret"
   ```

**⚠️ Important: For production deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md) for security best practices.**

## Contributing

We welcome contributions to AbQuanta News! Please read our contributing guidelines and feel free to submit issues, feature requests, or pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
