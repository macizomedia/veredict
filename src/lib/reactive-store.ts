import { BehaviorSubject, Observable, combineLatest, map, distinctUntilChanged, shareReplay } from 'rxjs';
import { api } from '@/trpc/react';
import type { Post, Category, User, Analytics } from '@prisma/client';

/**
 * Reactive Store Layer for AbQuanta News
 * Provides RxJS-based reactive state management with automatic cache invalidation
 */

// Enhanced types for the store
export interface PostWithDetails extends Post {
  category?: Category | null;
  authors: Array<{ user: User }>;
  analytics?: Analytics | null;
  currentRevision?: {
    title: string;
    contentBlocks: any;
    tone: string;
    style: string;
    minRead: number;
  } | null;
  _count?: {
    internalComments: number;
  };
}

export interface SearchState {
  query: string;
  categoryId?: number;
  sortBy: 'relevance' | 'date' | 'views' | 'votes';
  isLoading: boolean;
  results: PostWithDetails[];
  totalCount: number;
}

export interface AppState {
  posts: PostWithDetails[];
  categories: Category[];
  searchState: SearchState;
  selectedPost?: PostWithDetails | null;
  user?: User | null;
  isOnline: boolean;
}

/**
 * Reactive Store Implementation
 */
export class ReactiveStore {
  // Core state subjects
  private postsSubject = new BehaviorSubject<PostWithDetails[]>([]);
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  private searchStateSubject = new BehaviorSubject<SearchState>({
    query: '',
    categoryId: undefined,
    sortBy: 'relevance',
    isLoading: false,
    results: [],
    totalCount: 0,
  });
  private selectedPostSubject = new BehaviorSubject<PostWithDetails | null>(null);
  private userSubject = new BehaviorSubject<User | null>(null);
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);

  // Public observables
  public readonly posts$ = this.postsSubject.asObservable().pipe(
    distinctUntilChanged(),
    shareReplay(1)
  );

  public readonly categories$ = this.categoriesSubject.asObservable().pipe(
    distinctUntilChanged(),
    shareReplay(1)
  );

  public readonly searchState$ = this.searchStateSubject.asObservable().pipe(
    distinctUntilChanged(),
    shareReplay(1)
  );

  public readonly selectedPost$ = this.selectedPostSubject.asObservable().pipe(
    distinctUntilChanged(),
    shareReplay(1)
  );

  public readonly user$ = this.userSubject.asObservable().pipe(
    distinctUntilChanged(),
    shareReplay(1)
  );

  public readonly isOnline$ = this.isOnlineSubject.asObservable().pipe(
    distinctUntilChanged(),
    shareReplay(1)
  );

  // Computed observables
  public readonly appState$: Observable<AppState> = combineLatest([
    this.posts$,
    this.categories$,
    this.searchState$,
    this.selectedPost$,
    this.user$,
    this.isOnline$,
  ]).pipe(
    map(([posts, categories, searchState, selectedPost, user, isOnline]) => ({
      posts,
      categories,
      searchState,
      selectedPost,
      user,
      isOnline,
    })),
    shareReplay(1)
  );

  // Filtered and sorted observables
  public readonly publishedPosts$ = this.posts$.pipe(
    map(posts => posts.filter(post => post.status === 'PUBLISHED')),
    shareReplay(1)
  );

  public readonly categoriesWithCounts$ = combineLatest([
    this.categories$,
    this.publishedPosts$,
  ]).pipe(
    map(([categories, posts]) =>
      categories.map(category => ({
        ...category,
        postCount: posts.filter(post => post.categoryId === category.id).length,
      }))
    ),
    shareReplay(1)
  );

  public readonly trendingPosts$ = this.publishedPosts$.pipe(
    map(posts =>
      posts
        .filter(post => post.analytics)
        .sort((a, b) => (b.analytics?.views || 0) - (a.analytics?.views || 0))
        .slice(0, 5)
    ),
    shareReplay(1)
  );

  constructor() {
    this.initializeOnlineListener();
  }

  // Mutation methods
  updatePosts(posts: PostWithDetails[]): void {
    this.postsSubject.next(posts);
  }

  addPost(post: PostWithDetails): void {
    const currentPosts = this.postsSubject.value;
    this.postsSubject.next([post, ...currentPosts]);
  }

  updatePost(updatedPost: PostWithDetails): void {
    const currentPosts = this.postsSubject.value;
    const index = currentPosts.findIndex(post => post.id === updatedPost.id);
    if (index !== -1) {
      const newPosts = [...currentPosts];
      newPosts[index] = updatedPost;
      this.postsSubject.next(newPosts);
    }
  }

  removePost(postId: number): void {
    const currentPosts = this.postsSubject.value;
    this.postsSubject.next(currentPosts.filter(post => post.id !== postId));
  }

  updateCategories(categories: Category[]): void {
    this.categoriesSubject.next(categories);
  }

  updateSearchState(searchState: Partial<SearchState>): void {
    const currentState = this.searchStateSubject.value;
    this.searchStateSubject.next({ ...currentState, ...searchState });
  }

  setSelectedPost(post: PostWithDetails | null): void {
    this.selectedPostSubject.next(post);
  }

  setUser(user: User | null): void {
    this.userSubject.next(user);
  }

  // Cache invalidation methods
  invalidatePost(postId: number): void {
    // Trigger a refresh of the specific post
    this.updateSearchState({ isLoading: true });
    // In a real implementation, this would trigger a refetch
    console.log(`🔄 Invalidating cache for post ${postId}`);
  }

  invalidateSearch(): void {
    // Clear search results and trigger a refresh
    this.updateSearchState({ 
      results: [], 
      totalCount: 0, 
      isLoading: true 
    });
  }

  invalidateAll(): void {
    // Clear all cached data
    this.updatePosts([]);
    this.updateCategories([]);
    this.invalidateSearch();
    this.setSelectedPost(null);
    console.log('🔄 Full cache invalidation triggered');
  }

  // Analytics tracking
  trackPostView(postId: number): void {
    const currentPosts = this.postsSubject.value;
    const post = currentPosts.find(p => p.id === postId);
    if (post && post.analytics) {
      const updatedPost = {
        ...post,
        analytics: {
          ...post.analytics,
          views: post.analytics.views + 1,
        },
      };
      this.updatePost(updatedPost);
    }
  }

  trackSourceClick(postId: number): void {
    const currentPosts = this.postsSubject.value;
    const post = currentPosts.find(p => p.id === postId);
    if (post && post.analytics) {
      const updatedPost = {
        ...post,
        analytics: {
          ...post.analytics,
          sourceClicks: post.analytics.sourceClicks + 1,
        },
      };
      this.updatePost(updatedPost);
    }
  }

  // Voting methods
  updatePostVotes(postId: number, upVotes: number, downVotes: number): void {
    const currentPosts = this.postsSubject.value;
    const post = currentPosts.find(p => p.id === postId);
    if (post) {
      const updatedPost = {
        ...post,
        upVotes,
        downVotes,
      };
      this.updatePost(updatedPost);
    }
  }

  // Private methods
  private initializeOnlineListener(): void {
    window.addEventListener('online', () => {
      this.isOnlineSubject.next(true);
      this.invalidateAll(); // Refresh data when coming back online
    });

    window.addEventListener('offline', () => {
      this.isOnlineSubject.next(false);
    });
  }

  // Debug methods
  getCurrentState(): AppState {
    return {
      posts: this.postsSubject.value,
      categories: this.categoriesSubject.value,
      searchState: this.searchStateSubject.value,
      selectedPost: this.selectedPostSubject.value,
      user: this.userSubject.value,
      isOnline: this.isOnlineSubject.value,
    };
  }

  logState(): void {
    console.log('📊 Current Reactive Store State:', this.getCurrentState());
  }
}

// Singleton instance
export const reactiveStore = new ReactiveStore();

/**
 * React hooks for consuming the reactive store
 */
export function useReactiveStore() {
  return reactiveStore;
}

export function useAppState(): Observable<AppState> {
  return reactiveStore.appState$;
}

export function usePosts(): Observable<PostWithDetails[]> {
  return reactiveStore.posts$;
}

export function useCategories(): Observable<Category[]> {
  return reactiveStore.categories$;
}

export function useSearchState(): Observable<SearchState> {
  return reactiveStore.searchState$;
}

export function useTrendingPosts(): Observable<PostWithDetails[]> {
  return reactiveStore.trendingPosts$;
}

export function useCategoriesWithCounts(): Observable<Array<Category & { postCount: number }>> {
  return reactiveStore.categoriesWithCounts$;
}
