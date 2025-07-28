import { Client } from 'pg';
import type { Notification } from 'pg';
import { searchHooks } from './search-indexer';
import { env } from '@/env';

class DatabaseListener {
  private client: Client | null = null;
  private isListening = false;

  async start() {
    if (this.isListening) {
      console.log('Database listener already running');
      return;
    }

    try {
      // Use DIRECT_URL for real-time connections (bypasses connection pooling)
      this.client = new Client({
        connectionString: env.DIRECT_URL,
      });

      await this.client.connect();
      console.log('✅ Connected to PostgreSQL for real-time notifications');

      // Listen for search index updates
      await this.client.query('LISTEN search_index_update');

      this.client.on('notification', async (msg: Notification) => {
        if (msg.channel === 'search_index_update' && msg.payload) {
          try {
            const data = JSON.parse(msg.payload);
            await this.handleSearchIndexUpdate(data);
          } catch (error) {
            console.error('❌ Error processing notification:', error);
          }
        }
      });

      this.client.on('error', (err: Error) => {
        console.error('❌ PostgreSQL listener error:', err);
        this.restart();
      });

      this.client.on('end', () => {
        console.log('⚠️ PostgreSQL connection ended');
        this.isListening = false;
      });

      this.isListening = true;
      console.log('👂 Listening for database changes...');

    } catch (error) {
      console.error('❌ Failed to start database listener:', error);
      throw error;
    }
  }

  private async handleSearchIndexUpdate(data: {
    operation: string;
    table: string;
    postId: number;
    timestamp: number;
  }) {
    const { operation, table, postId } = data;
    
    console.log(`📡 Received ${operation} notification for ${table} (post ${postId})`);

    try {
      switch (operation) {
        case 'INSERT':
          if (table === 'Post') {
            await searchHooks.onPostCreated(postId);
          }
          break;

        case 'UPDATE':
          if (table === 'Post') {
            await searchHooks.onPostUpdated(postId);
          }
          break;

        case 'DELETE':
          if (table === 'Post') {
            await searchHooks.onPostDeleted(postId);
          }
          break;

        case 'COMMENT_UPDATE':
          await searchHooks.onCommentCreated(postId); // This will reindex the post
          break;

        case 'ANALYTICS_UPDATE':
          await searchHooks.onPostUpdated(postId); // Update view counts
          break;

        default:
          console.log(`🤷 Unknown operation: ${operation}`);
      }
    } catch (error) {
      console.error(`❌ Error handling ${operation} for post ${postId}:`, error);
    }
  }

  async stop() {
    if (this.client) {
      await this.client.end();
      this.client = null;
      this.isListening = false;
      console.log('🛑 Database listener stopped');
    }
  }

  private async restart() {
    console.log('🔄 Restarting database listener...');
    await this.stop();
    setTimeout(() => this.start(), 5000); // Restart after 5 seconds
  }

  get listening() {
    return this.isListening;
  }
}

// Singleton instance
const databaseListener = new DatabaseListener();

// Auto-start in production or when explicitly enabled
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_DB_LISTENER === 'true') {
  databaseListener.start().catch(console.error);
}

export default databaseListener;

// Graceful shutdown
process.on('SIGTERM', () => {
  databaseListener.stop().catch(console.error);
});

process.on('SIGINT', () => {
  databaseListener.stop().catch(console.error);
});
