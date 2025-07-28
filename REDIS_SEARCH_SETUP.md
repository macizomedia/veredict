# Redis Search Indexing Setup Guide

This guide explains how to set up and configure Redis search indexing for your Next.js application.

## Overview

The search indexing system provides:
- **Fast Redis-based search** with fallback to PostgreSQL
- **Real-time updates** via database triggers and listeners
- **Automatic cache invalidation** when content changes
- **Comprehensive indexing** of posts, comments, categories, and analytics

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │   Redis Cache   │    │   Next.js App   │
│   (Source DB)   │───▶│  (Search Index) │◀───│  (Frontend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        ▲
         │              ┌─────────────────┐
         └─────────────▶│ Database        │
                        │ Listener        │
                        │ (Real-time)     │
                        └─────────────────┘
```

## Setup Instructions

### 1. Configure Redis

You already have Redis configured in `src/server/redis.ts`. Make sure your Redis instance is running and accessible.

### 2. Set Up Database Triggers

Run the SQL commands in `database-triggers.sql` in your Supabase SQL editor:

```sql
-- This will create PostgreSQL triggers that notify when posts/comments change
-- Copy and paste the entire content of database-triggers.sql
```

### 3. Initial Index Population

You have several options to populate the initial search index:

#### Option A: Via API Endpoint
```bash
curl -X POST http://localhost:3000/api/search-management \
  -H "Content-Type: application/json" \
  -d '{"action": "reindex"}'
```

#### Option B: Via tRPC (in your app)
```typescript
const reindexResult = await api.search.reindexAll.query();
```

#### Option C: Manual Script
```bash
# Create a one-time script to run reindexing
node -e "
import('./src/server/search-indexer.js').then(module => {
  module.SearchIndexer.reindexAll().then(() => {
    console.log('Reindexing complete!');
    process.exit(0);
  });
});
"
```

### 4. Enable Real-time Listener (Optional)

For real-time updates via database triggers, set this environment variable:

```bash
ENABLE_DB_LISTENER=true
```

Or modify your production deployment to include the database listener.

## Environment Variables

Add to your `.env` file:

```env
# Redis Cloud (updated with your actual credentials)
REDIS_URL="redis://default:8pVEx0BVsvQJ6JWo817yuDw3s1O4TID7@redis-17608.c83.us-east-1-2.ec2.redns.redis-cloud.com:17608"

# PostgreSQL Direct URL (for real-time listener)
DIRECT_URL="postgresql://..."

# Optional: Enable database listener
ENABLE_DB_LISTENER=true
```

## Usage

### Search API

The search API now uses Redis first, with PostgreSQL fallback:

```typescript
// This automatically uses Redis index when available
const results = await api.search.searchPosts.query({
  query: "artificial intelligence",
  categoryId: 1,
  sortBy: "relevance",
  limit: 20
});
```

### Manual Index Management

```typescript
// Reindex all posts
await api.search.reindexAll.query();

// Index a specific post (automatically called on create/update)
await searchHooks.onPostCreated(postId);
await searchHooks.onPostUpdated(postId);
await searchHooks.onPostDeleted(postId);
```

## Search Features

### Current Capabilities
- ✅ Full-text search across title, prompt, content, and author names
- ✅ Category filtering
- ✅ Sort by relevance, date, views, votes
- ✅ Comment count integration
- ✅ Real-time cache invalidation
- ✅ Automatic fallback to PostgreSQL

### Advanced Features (Available)
- ✅ Keyword-based indexing with stop word filtering
- ✅ Multiple sort orders (date, views, votes, relevance)
- ✅ Category-specific search
- ✅ Search suggestions/autocomplete
- ✅ Analytics integration (view counts)

## Monitoring

### Check Redis Cloud Index Status

#### Method 1: Using Redis CLI with Cloud Connection
```bash
# Connect to your Redis Cloud instance
redis-cli -h redis-17608.c83.us-east-1-2.ec2.redns.redis-cloud.com \
          -p 17608 \
          -a 8pVEx0BVsvQJ6JWo817yuDw3s1O4TID7

# Once connected, check your data:
# Check if any posts are indexed
SMEMBERS all_posts

# Check post details (replace 123 with actual post ID)
GET post:123

# Check sorted sets for different orderings
ZRANGE posts:by_date 0 -1 WITHSCORES
ZRANGE posts:by_views 0 -1 WITHSCORES

# Check cache keys
KEYS search:*
KEYS feed:*

# Get Redis info
INFO keyspace
```

#### Method 2: Using Your App's API Endpoint
```bash
# Check if your app can connect to Redis
curl http://localhost:3000/api/search-management

# Trigger a reindex to populate Redis
curl -X POST http://localhost:3000/api/search-management \
  -H "Content-Type: application/json" \
  -d '{"action": "reindex"}'
```

#### Method 3: Using a Simple Node.js Test Script
Create a test file to verify connection:

```javascript
// test-redis.js
const { createClient } = require('redis');

const client = createClient({
  url: 'redis://default:8pVEx0BVsvQJ6JWo817yuDw3s1O4TID7@redis-17608.c83.us-east-1-2.ec2.redns.redis-cloud.com:17608'
});

client.on('error', (err) => console.log('Redis Client Error', err));

async function testRedis() {
  await client.connect();
  
  // Test basic operations
  await client.set('test', 'Hello Redis Cloud!');
  const value = await client.get('test');
  console.log('Test value:', value);
  
  // Check if search index exists
  const allPosts = await client.sMembers('all_posts');
  console.log('Indexed posts:', allPosts.length);
  
  // Check cache keys
  const searchKeys = await client.keys('search:*');
  const feedKeys = await client.keys('feed:*');
  console.log('Search cache keys:', searchKeys.length);
  console.log('Feed cache keys:', feedKeys.length);
  
  await client.disconnect();
}

testRedis().catch(console.error);
```

```bash
# Run the test
node test-redis.js
```

### Application Logs
Look for these log messages:

- `✅ Indexed post X for search` - Successful indexing
- `🎯 Cache HIT for search: query` - Redis cache hit
- `💾 Cache MISS for search: query` - Falling back to PostgreSQL
- `👂 Listening for database changes...` - Real-time listener active

## Performance

### Expected Performance Gains
- **Search queries**: 10-50x faster than PostgreSQL full-text search
- **Cache hit ratio**: 70-90% for typical usage patterns
- **Index update time**: < 100ms per post
- **Memory usage**: ~1-5KB per indexed post

### Cache TTL Settings
- Search results: 5 minutes
- Post feed: 2 minutes
- Suggestions: 10 minutes
- Post documents: 1 hour

## Troubleshooting

### Redis Connection Issues
```bash
# Check Redis is running
redis-cli ping

# Check connection from app
curl http://localhost:3000/api/search-management
```

### Index Out of Sync
```bash
# Clear and rebuild index
curl -X POST http://localhost:3000/api/search-management \
  -H "Content-Type: application/json" \
  -d '{"action": "clear"}'

curl -X POST http://localhost:3000/api/search-management \
  -H "Content-Type: application/json" \
  -d '{"action": "reindex"}'
```

### Database Triggers Not Working
```sql
-- Check if triggers exist
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE event_object_schema = 'public';

-- Check for notifications (in psql)
LISTEN search_index_update;
-- Then make changes to posts and see if notifications appear
```

## Production Considerations

1. **Redis Persistence**: Configure Redis with appropriate persistence settings
2. **Memory Management**: Monitor Redis memory usage and set max memory policies
3. **Failover**: Ensure PostgreSQL search works when Redis is unavailable
4. **Monitoring**: Set up alerts for search performance and index freshness
5. **Scaling**: Consider Redis Cluster for high-traffic applications

## Next Steps

1. Run the initial reindex to populate Redis
2. Test search functionality
3. Monitor performance improvements
4. Consider implementing additional features like trending searches or personalized results

The search system is now ready to provide fast, scalable search with real-time updates!
