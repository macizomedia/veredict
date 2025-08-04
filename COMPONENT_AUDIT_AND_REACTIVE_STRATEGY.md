# Component Audit & Reactive Strategy Guide

## 🏗️ Architecture Overview

### **Layout Hierarchy**
```
RootLayout (app/layout.tsx)
├── ThemeProvider (Streetlight Warm dark theme)
├── TRPCReactProvider
├── AuthProvider
└── Header (components/header.tsx)
    ├── Compact Navbar
    ├── Push Sidebar Navigation
    └── Main Content Area
```

### **🎨 Theme System**
- **Light Mode**: Standard clean light theme
- **Dark Mode**: "Streetlight Warm" palette - Low contrast, atmospheric
  - Asphalt (#262526) - Deep warm backgrounds  
  - Pavement (#404040) - Card surfaces
  - Olive (#8C8C77) - Secondary text
  - Sandstone (#BFA678) - Secondary elements
  - Lamplight (#F2C48D) - Primary actions
  - Chalk (#F5F5F5) - Main text

---

## 📱 Component Usage Map

### **🎯 Layout & Navigation Components**

#### **Header (src/components/header.tsx)**
- **Type**: Layout/Shell Component
- **Usage**: Root layout wrapper with push sidebar
- **Parent**: RootLayout
- **Children**: All page content
- **Reactive Needs**: 
  - ✅ Sidebar state management (local state)
  - ⚠️ **Real-time notifications** (needs RxJS stream)
  - ⚠️ **User session updates** (needs reactive auth)
- **Performance**: 
  - ⚠️ **Avatar dropdown** needs skeleton loading
  - ✅ Search is already Suspense-wrapped
  - ⚠️ **Model indicator** needs loading state

#### **Navigation (src/components/navigation.tsx)**
- **Type**: Legacy navigation (replaced by Header)
- **Status**: ⚠️ **Consider removing** - Header now handles all navigation
- **Reactive Needs**: N/A

---

### **🏠 Page Components**

#### **Home (src/app/page.tsx)**
- **Type**: Page Container (Two-Column Layout)
- **Children**: PostsFeed (main), TrendingTopics, FooterInfo (sidebar)
- **Layout**: Responsive grid - 3/4 main content, 1/4 sidebar
- **Performance**: ✅ **Excellent** - Clean, focused design with sticky sidebar
- **Reactive Needs**:
  - ✅ Managed by PostsFeed component
  - ⚠️ **Trending topics** could benefit from real-time data updates
- **Notes**: ✅ **Enhanced** - Two-column layout with contextual sidebar for better space utilization

#### **SearchPage (src/app/search/page.tsx)**
- **Type**: Page Container
- **Performance**: ✅ **Excellent** - has Suspense fallback with skeleton
- **Reactive Needs**: ⚠️ **Live search results** (needs debounced RxJS stream)
- **Skeleton**: ✅ Already implemented

#### **CreatePostPage (src/app/create-post/page.tsx)**
- **Type**: Complex Form Page
- **Performance**: ⚠️ **Needs skeleton for AI generation**
- **Reactive Needs**:
  - ⚠️ **Real-time AI generation progress** (needs RxJS)
  - ⚠️ **Auto-save drafts** (needs debounced RxJS)
  - ✅ Form validation (local state)
- **Skeleton**: ⚠️ **Missing** - needs skeleton for AI generation steps

#### **Dashboard (src/app/dashboard/page.tsx)**
- **Type**: Page Container
- **Children**: DashboardContent
- **Performance**: ✅ Clean structure
- **Reactive Needs**: ⚠️ **Real-time analytics updates**

#### **PostPage (src/app/posts/[id]/page.tsx)**
- **Type**: Dynamic Page (SSR)
- **Children**: PostViewTracker, VoteButtons, Comments
- **Performance**: ✅ Server-side rendering
- **Reactive Needs**: ⚠️ **Real-time vote updates** and **live comments**

#### **PostManagePage (src/app/posts/[id]/manage/page.tsx)**
- **Type**: Dynamic Page (SSR)
- **Children**: PostManagement
- **Performance**: ✅ Good auth checks
- **Reactive Needs**: ⚠️ **Real-time collaboration** for multi-author editing

---

### **🧩 Feature Components**

#### **PostsFeed (src/app/_components/posts-feed.tsx)**
- **Type**: Data List Component with Dual View Modes & Dynamic Font Scaling
- **tRPC**: `api.post.getFeed.useQuery`
- **Performance**: ✅ **Excellent** - now has adaptive skeleton loading (Full & Compact modes)
- **Features**: 
  - ✅ **Full View (Editorial)** - Rich cards with avatars, content excerpts, metadata
  - ✅ **Compact View (Scan)** - Dense list for rapid scanning
  - ✅ **View mode persistence** - localStorage remembers user preference
  - ✅ **Adaptive skeleton loading** - Different skeletons for each view mode
  - ✅ **NEW: Dynamic Font Size Control** - Users can increase/decrease/reset font size with persistence
- **Font Controls**:
  - ✅ ZoomIn, ZoomOut, RefreshCcw icons for size control
  - ✅ Font scale range: 0.8x to 1.4x (increments of 0.1)
  - ✅ CSS Custom Properties with `--font-scale` variable
  - ✅ Custom Tailwind utilities: `text-feed-xs` through `text-feed-2xl`
  - ✅ localStorage persistence for user preference
- **Reactive Needs**:
  - ⚠️ **Real-time post updates** (new posts, vote changes)
  - ⚠️ **Infinite scroll** (needs pagination stream)
- **Skeleton**: ✅ **Excellent** - Dual-mode adaptive skeleton implementation

#### **SearchBar (src/app/_components/search-bar.tsx)**
- **Type**: Interactive Input Component
- **Usage**: Header, Search page
- **tRPC**: `api.category.getAll.useQuery`, search hook
- **Performance**: ✅ **Excellent** - already has debouncing
- **Reactive Needs**: ✅ Already well-implemented
- **Skeleton**: ✅ Good

#### **VoteButtons (src/app/_components/vote-buttons.tsx)**
- **Type**: Interactive Action Component
- **tRPC**: `api.post.vote.useMutation`
- **Performance**: ✅ Optimistic updates
- **Reactive Needs**: ⚠️ **Real-time vote synchronization** across users
- **Skeleton**: ✅ Good loading states

#### **Comments (src/app/_components/comments.tsx)**
- **Type**: Interactive List Component
- **tRPC**: `api.comment.getByPostId.useQuery`, `api.comment.create.useMutation`
- **Performance**: ⚠️ **Needs skeleton for comment list**
- **Reactive Needs**: ⚠️ **Real-time comment updates** (new comments, replies)
- **Skeleton**: ⚠️ **Missing**

#### **CategoryFilter (src/app/_components/category-filter.tsx)**
- **Type**: Filter Component
- **tRPC**: `api.category.getAll.useQuery`
- **Performance**: ✅ Simple and efficient
- **Reactive Needs**: ✅ Already good
- **Skeleton**: ✅ Shows loading state

#### **TrendingTopics (src/app/_components/trending-topics.tsx)**
- **Type**: Contextual Display Component
- **Usage**: Right sidebar on homepage
- **Performance**: ✅ Static placeholder data - very efficient
- **Reactive Needs**: ⚠️ **Real-time trending data** (future enhancement)
- **Skeleton**: ✅ Not needed - static content
- **Design**: X-style "What's happening" block with engagement metrics

#### **FooterInfo (src/app/_components/footer-info.tsx)**
- **Type**: Static Information Component
- **Usage**: Right sidebar footer
- **Performance**: ✅ Lightweight static content
- **Reactive Needs**: ✅ Static content - no reactive needs
- **Skeleton**: ✅ Not applicable

---

### **📊 Dashboard Components**

#### **DashboardContent (src/app/dashboard/_components/dashboard-content.tsx)**
- **Type**: Tab Container
- **Children**: UserStats, UserPosts, UserProfile
- **Performance**: ✅ Good tab structure
- **Reactive Needs**: ⚠️ **Real-time dashboard updates**
- **Skeleton**: ✅ Has loading state

#### **UserPosts (src/app/dashboard/_components/user-posts.tsx)**
- **Type**: Data List Component
- **Performance**: ✅ **Excellent** - has comprehensive skeleton loading
- **Reactive Needs**: ⚠️ **Real-time post status updates**
- **Skeleton**: ✅ **Best practice example**

#### **UserStats (src/app/dashboard/_components/user-stats.tsx)**
- **Type**: Data Display Component
- **tRPC**: `api.user.getProfile.useQuery`
- **Performance**: ⚠️ **Needs skeleton loading**
- **Reactive Needs**: ⚠️ **Real-time reputation and stats updates**
- **Skeleton**: ⚠️ **Missing**

#### **DashboardStats (src/app/_components/dashboard-stats.tsx)**
- **Type**: Metrics Component
- **tRPC**: `api.post.getFeed.useQuery`, `api.category.getAll.useQuery`
- **Performance**: ⚠️ **Needs skeleton loading**
- **Reactive Needs**: ⚠️ **Real-time analytics updates**
- **Skeleton**: ⚠️ **Missing**

---

### **🔧 Management Components**

#### **PostManagement (src/app/_components/post-management.tsx)**
- **Type**: Complex Management Interface
- **tRPC**: `api.post.getById.useQuery`
- **Performance**: ✅ **Good** - has skeleton loading
- **Reactive Needs**: ⚠️ **Real-time collaboration** for multi-author posts
- **Skeleton**: ✅ Has loading state

#### **ManageAuthors (src/app/_components/manage-authors.tsx)**
- **Type**: User Management Component
- **Reactive Needs**: ⚠️ **Real-time author presence** indicators
- **Performance**: ⚠️ **Needs skeleton loading**
- **Skeleton**: ⚠️ **Missing**

#### **PostVersions (src/app/_components/post-versions.tsx)**
- **Type**: Version History Component
- **tRPC**: `api.post.getVersions.useQuery`
- **Reactive Needs**: ⚠️ **Real-time version updates**
- **Performance**: ⚠️ **Needs skeleton loading**
- **Skeleton**: ⚠️ **Missing**

---

### **🎨 UI/Display Components**

#### **ContentBlocks (src/app/_components/content-blocks.tsx)**
- **Type**: Content Renderer
- **Performance**: ✅ Efficient rendering
- **Reactive Needs**: ✅ Static content - no reactive needs
- **Skeleton**: ✅ Not applicable

#### **PostViewTracker (src/app/_components/post-view-tracker.tsx)**
- **Type**: Analytics Component
- **Performance**: ✅ Lightweight
- **Reactive Needs**: ⚠️ **Real-time view analytics**
- **Skeleton**: ✅ Not applicable

---

## 🌊 RxJS Reactive Strategy

### **High Priority Reactive Streams**

#### **1. Real-time Post Updates**
```typescript
// src/lib/streams/post-updates.ts
interface PostUpdateStream {
  posts$: Observable<Post[]>;
  votes$: Observable<VoteUpdate>;
  comments$: Observable<CommentUpdate>;
}

// Usage in PostsFeed, PostPage
const postUpdates$ = usePostUpdates(categoryFilter);
```

#### **2. Live Search with Debouncing**
```typescript
// src/lib/streams/search.ts
interface SearchStream {
  searchQuery$: Observable<string>;
  searchResults$: Observable<SearchResult[]>;
  suggestions$: Observable<string[]>;
}

// Already partially implemented in use-search.ts
```

#### **3. Real-time Notifications**
```typescript
// src/lib/streams/notifications.ts
interface NotificationStream {
  notifications$: Observable<Notification[]>;
  unreadCount$: Observable<number>;
  userPresence$: Observable<UserPresence>;
}

// Usage in Header component
```

#### **4. Live Analytics Dashboard**
```typescript
// src/lib/streams/analytics.ts
interface AnalyticsStream {
  realTimeStats$: Observable<Stats>;
  viewCounts$: Observable<ViewUpdate>;
  reputationUpdates$: Observable<ReputationUpdate>;
}

// Usage in Dashboard components
```

### **Medium Priority Reactive Streams**

#### **5. Auto-save and Draft Management**
```typescript
// src/lib/streams/drafts.ts
interface DraftStream {
  draftSaves$: Observable<DraftSave>;
  autoSave$: Observable<AutoSaveStatus>;
  conflictResolution$: Observable<Conflict>;
}

// Usage in CreatePostPage, EditPostForm
```

#### **6. Multi-user Collaboration**
```typescript
// src/lib/streams/collaboration.ts
interface CollaborationStream {
  presenceIndicators$: Observable<UserPresence[]>;
  liveEditing$: Observable<EditOperation>;
  lockStatus$: Observable<ResourceLock>;
}

// Usage in PostManagement, ManageAuthors
```

#### **6. Live Trending Analytics**
```typescript
// src/lib/streams/trending.ts
interface TrendingStream {
  trendingTopics$: Observable<TrendingTopic[]>;
  topicEngagement$: Observable<EngagementUpdate>;
  locationBasedTrends$: Observable<LocationTrend[]>;
}

// Usage in TrendingTopics component
```

---

## 🎭 Skeleton Loading Strategy

### **✅ Well Implemented Skeletons**
- **UserPosts** - Comprehensive card skeletons
- **SearchPage** - Full page skeleton
- **PostManagement** - Basic loading skeleton
- **PostsFeed** - ✅ **NEW: Adaptive dual-mode skeletons** (Full & Compact view modes)

### **⚠️ Components Needing Skeleton Loading**

#### **Critical Priority**
1. ~~**PostsFeed**~~ - ✅ **COMPLETED** - Now has adaptive skeleton for both view modes
2. **Comments** - Comment list skeleton
3. **CreatePostPage** - AI generation progress skeleton
4. **UserStats** - Stats card skeleton
5. **DashboardStats** - Metrics skeleton

#### **High Priority**
6. **ManageAuthors** - User list skeleton
7. **PostVersions** - Version history skeleton
8. **Header Avatar Dropdown** - Profile skeleton

#### **Implementation Pattern**
```typescript
// Skeleton Component Pattern
function ComponentSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Usage Pattern
function DataComponent() {
  const { data, isLoading } = api.endpoint.useQuery();
  
  if (isLoading) return <ComponentSkeleton />;
  if (!data) return <EmptyState />;
  
  return <ActualContent data={data} />;
}
```

---

## 🚀 Performance Optimization Recommendations

### **Immediate Actions**
1. **Add skeleton loading** to high-traffic components (PostsFeed, Comments)
2. **Implement real-time streams** for post updates and notifications
3. **Remove legacy Navigation component** (replaced by Header)
4. **Add Suspense boundaries** around data-fetching components

### **Architecture Improvements**
1. **Create RxJS service layer** for reactive data management
2. **Implement WebSocket connection** for real-time features
3. **Add error boundaries** for better fallback handling
4. **Optimize tRPC queries** with proper caching strategies

### **Developer Experience**
1. **Create skeleton component library** with consistent patterns
2. **Add loading state management** utilities
3. **Implement reactive hooks** for common streams
4. **Add performance monitoring** for component render times

---

## 🎯 Implementation Priority Matrix

### **Must Have (Week 1)**
- [x] PostsFeed skeleton loading ✅ **COMPLETED** - Adaptive dual-mode skeletons
- [x] PostsFeed dynamic font sizing ✅ **COMPLETED** - User-controlled font scaling with persistence
- [ ] Comments skeleton loading  
- [ ] Real-time post updates stream
- [ ] Header notifications system

### **Should Have (Week 2)**
- [ ] Real-time search improvements
- [ ] Dashboard analytics streams
- [ ] Auto-save for create post
- [ ] User presence indicators
- [ ] Live trending topics data stream

### **Could Have (Week 3)**
- [ ] Advanced collaboration features
- [ ] Performance monitoring
- [ ] Component optimization
- [ ] Error boundary improvements

This audit provides a comprehensive foundation for implementing reactive patterns and optimizing performance across the entire application.
