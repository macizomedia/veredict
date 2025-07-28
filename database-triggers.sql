-- PostgreSQL trigger function for search indexing
-- Run this in your Supabase SQL editor

-- Function to notify search index updates
CREATE OR REPLACE FUNCTION notify_search_update()
RETURNS TRIGGER AS $$
BEGIN
  -- For POST operations (INSERT, UPDATE, DELETE)
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Only trigger for published posts that are latest versions
    IF NEW.status = 'PUBLISHED' AND NEW."isLatest" = true THEN
      PERFORM pg_notify('search_index_update', 
        json_build_object(
          'operation', TG_OP,
          'table', TG_TABLE_NAME,
          'postId', NEW.id,
          'timestamp', extract(epoch from now())
        )::text
      );
    ELSIF OLD.status = 'PUBLISHED' OR (TG_OP = 'UPDATE' AND OLD."isLatest" = true) THEN
      -- If post was unpublished or is no longer latest, remove from index
      PERFORM pg_notify('search_index_update', 
        json_build_object(
          'operation', 'DELETE',
          'table', TG_TABLE_NAME,
          'postId', COALESCE(NEW.id, OLD.id),
          'timestamp', extract(epoch from now())
        )::text
      );
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    -- Remove from search index
    PERFORM pg_notify('search_index_update', 
      json_build_object(
        'operation', TG_OP,
        'table', TG_TABLE_NAME,
        'postId', OLD.id,
        'timestamp', extract(epoch from now())
      )::text
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to notify comment count updates
CREATE OR REPLACE FUNCTION notify_comment_update()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
    PERFORM pg_notify('search_index_update', 
      json_build_object(
        'operation', 'COMMENT_UPDATE',
        'table', TG_TABLE_NAME,
        'postId', COALESCE(NEW."postId", OLD."postId"),
        'timestamp', extract(epoch from now())
      )::text
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for Post table
DROP TRIGGER IF EXISTS search_index_post_trigger ON "Post";
CREATE TRIGGER search_index_post_trigger
  AFTER INSERT OR UPDATE OR DELETE ON "Post"
  FOR EACH ROW
  EXECUTE FUNCTION notify_search_update();

-- Create triggers for Comment table (to update comment counts)
DROP TRIGGER IF EXISTS search_index_comment_trigger ON "Comment";
CREATE TRIGGER search_index_comment_trigger
  AFTER INSERT OR DELETE ON "Comment"
  FOR EACH ROW
  EXECUTE FUNCTION notify_comment_update();

-- Optional: Create trigger for Analytics table (to update view counts)
CREATE OR REPLACE FUNCTION notify_analytics_update()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM pg_notify('search_index_update', 
      json_build_object(
        'operation', 'ANALYTICS_UPDATE',
        'table', TG_TABLE_NAME,
        'postId', NEW."postId",
        'timestamp', extract(epoch from now())
      )::text
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS search_index_analytics_trigger ON "Analytics";
CREATE TRIGGER search_index_analytics_trigger
  AFTER INSERT OR UPDATE ON "Analytics"
  FOR EACH ROW
  EXECUTE FUNCTION notify_analytics_update();
