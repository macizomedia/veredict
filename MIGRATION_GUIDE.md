# 🚀 Post-Revision Schema Migration Guide

**✅ MIGRATION COMPLETED SUCCESSFULLY - July 29, 2025**

This guide documents the completed migration from single Post model to Post + Revision architecture.

## Overview

**Before**: Single `Post` model with versioning via `parentId`
**After**: Separate `Post` container + `Revision` content models

## Benefits
- ✅ Clean separation of metadata vs content
- ✅ Proper revision history tracking
- ✅ Better query performance
- ✅ Easier content comparison
- ✅ Future-proof for advanced features

---

## 🛡️ Safety First: Pre-Migration Steps

### 1. Create Database Backup
```bash
npm run db:backup
```

### 2. Test Schema Changes Locally
```bash
# Generate Prisma client with new schema
npx prisma generate

# Create migration file (don't apply yet)
npx prisma migrate dev --create-only --name split-post-revisions
```

### 3. Review Generated Migration
Check the SQL in `prisma/migrations/*/migration.sql` to ensure it looks correct.

---

## 🔄 Migration Process

### Step 1: Apply Schema Migration
```bash
# Apply the schema changes to create new tables
npx prisma migrate deploy
```

### Step 2: Migrate Existing Data
```bash
# Run the data migration script
npm run db:migrate-revisions
```

This script will:
- ✅ Create `Revision` records from existing `Post` content
- ✅ Generate unique slugs for all posts
- ✅ Link `currentRevisionId` in posts
- ✅ Preserve parent-child relationships
- ✅ Maintain all existing metadata

### Step 3: Verify Migration
```bash
# Check the migration results
npm run db:studio
```

Verify:
- All posts have `currentRevisionId` set
- All posts have corresponding revisions
- Revision count matches original post count
- Parent-child relationships preserved

---

## 🧪 Testing Phase

### 1. Test API Endpoints
```bash
# Test feed endpoint
curl "http://localhost:3000/api/trpc/post.getFeed?input=%7B%22json%22%3A%7B%22limit%22%3A5%7D%7D"

# Test individual post
curl "http://localhost:3000/api/trpc/post.getById?input=%7B%22json%22%3A%7B%22id%22%3A1%7D%7D"

# Test AI post creation
curl -X POST "http://localhost:3000/api/trpc/ai.createPostWithAI" \
  -H "Content-Type: application/json" \
  -d '{"json": {"title": "Test Post", "prompt": "Test prompt", "tone": "professional", "style": "journalistic"}}'
```

### 2. Test UI Components
- ✅ Homepage feed displays correctly
- ✅ Individual post pages render content
- ✅ AI creation workflow works
- ✅ Category filtering functions
- ✅ Search functionality intact

---

## 🔧 New Features Available

### 1. Revision History
```typescript
// Get all revisions for a post
const revisions = await api.revision.getByPostId.useQuery({ postId: 1 });

// Compare two revisions
const diff = await api.revision.compare.useQuery({
  fromRevisionId: 1,
  toRevisionId: 2
});
```

### 2. Create New Revisions
```typescript
// Create a new revision (requires authentication)
const newRevision = await api.revision.create.mutate({
  postId: 1,
  title: "Updated Title",
  contentBlocks: { blocks: [...] },
  prompt: "Updated prompt",
  tone: "analytical",
  style: "journalistic",
  summaryOfChanges: "Updated content for clarity"
});
```

---

## 🚨 Rollback Plan

If something goes wrong:

```bash
# Rollback the data migration (keeps schema changes)
npm run db:rollback-revisions

# Or restore from backup
tsx scripts/backup-database.ts restore backups/backup-YYYY-MM-DD.json
```

---

## 📈 Performance Considerations

### Query Optimization
The new schema includes optimized indexes:
- `Post.slug` for fast lookups
- `Revision.postId` for revision queries
- `Revision.version` for ordering

### Caching Strategy
Feed queries cache for 2 minutes and automatically include current revision content.

---

## 🎯 Next Steps After Migration

### 1. Clean Up Old Fields (Optional)
After confirming everything works, you can remove legacy fields:

```prisma
// Remove from Post model (if desired):
// title, contentBlocks, prompt, tone, style, minRead, location, 
// summaryOfChanges, version, parentId, isLatest
```

### 2. Add New Features
- Revision comparison UI
- Editorial workflow with draft→review→publish
- Content approval system
- Advanced revision analytics

### 3. Performance Monitoring
Monitor query performance and adjust indexes as needed.

---

## 🔍 Troubleshooting

### Common Issues

**Posts missing from feed**
- Check `currentRevisionId` is set
- Verify post status is 'PUBLISHED'
- Confirm revision exists

**Content not displaying**
- Check `currentRevision` include in queries
- Verify content mapping in components

**Slow queries**
- Check database indexes are applied
- Monitor query execution plans
- Consider pagination for large datasets

---

## 📞 Support

If you encounter issues:
1. Check migration logs for errors
2. Verify database state with Prisma Studio
3. Test with a clean database restore
4. Review API responses for missing data

The migration is designed to be safe and reversible, but always test thoroughly before applying to production!
