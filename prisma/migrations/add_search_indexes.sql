-- Add full-text search index for better search performance
CREATE INDEX IF NOT EXISTS "Post_search_idx" 
ON "Post" USING GIN (to_tsvector('english', title || ' ' || prompt || ' ' || COALESCE("contentBlocks"::text, '')))
WHERE status = 'PUBLISHED' AND "isLatest" = true;

-- Add additional index for search with category filtering
CREATE INDEX IF NOT EXISTS "Post_search_category_idx" 
ON "Post" ("categoryId") 
WHERE status = 'PUBLISHED' AND "isLatest" = true;
