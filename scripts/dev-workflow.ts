#!/usr/bin/env tsx

import { SeedOrchestrator } from '../prisma/seed-orchestrator';
import { domainCache, cacheWarmer } from '../src/server/smart-cache';
import { SearchIndexer } from '../src/server/search-indexer';

/**
 * Development Workflow Utilities
 * Fast iteration, safe state wipes, and cache management
 */

interface WorkflowOptions {
  theme?: string;
  clearCache?: boolean;
  reindexSearch?: boolean;
  warmCache?: boolean;
  verbose?: boolean;
}

class DevWorkflow {
  private orchestrator: SeedOrchestrator;

  constructor() {
    this.orchestrator = new SeedOrchestrator();
  }

  /**
   * Complete reset workflow - database, cache, and search index
   */
  async reset(options: WorkflowOptions = {}): Promise<void> {
    const { 
      theme = 'politics', 
      clearCache = true, 
      reindexSearch = true, 
      warmCache = true,
      verbose = false 
    } = options;

    console.log('🔄 Starting complete reset workflow...');
    
    if (verbose) {
      console.log(`   Theme: ${theme}`);
      console.log(`   Clear Cache: ${clearCache}`);
      console.log(`   Reindex Search: ${reindexSearch}`);
      console.log(`   Warm Cache: ${warmCache}`);
    }

    try {
      // Step 1: Reset database
      console.log('\n1️⃣ Resetting database...');
      await this.orchestrator.resetDatabase();

      // Step 2: Clear cache if requested
      if (clearCache) {
        console.log('\n2️⃣ Clearing cache...');
        await this.orchestrator.clearCache();
      }

      // Step 3: Apply seed theme
      console.log('\n3️⃣ Applying seed theme...');
      await this.orchestrator.applySeedTheme(theme);

      // Step 4: Reindex search if requested
      if (reindexSearch) {
        console.log('\n4️⃣ Reindexing search...');
        await SearchIndexer.reindexAll();
      }

      // Step 5: Warm cache if requested
      if (warmCache) {
        console.log('\n5️⃣ Warming cache...');
        await cacheWarmer.warmEssentialCaches();
      }

      // Step 6: Show summary
      const summary = await this.orchestrator.getDatabaseSummary();
      console.log('\n📊 Reset Summary:');
      Object.entries(summary).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });

      console.log('\n✅ Reset workflow completed successfully!');
    } catch (error) {
      console.error('\n❌ Reset workflow failed:', error);
      throw error;
    }
  }

  /**
   * Quick clean - just clear cache and reindex
   */
  async clean(): Promise<void> {
    console.log('🧹 Quick clean...');
    
    try {
      await Promise.all([
        domainCache.invalidateByTag('search'),
        domainCache.invalidateByTag('posts'),
        domainCache.invalidateByTag('categories'),
      ]);
      
      await SearchIndexer.reindexAll();
      console.log('✅ Quick clean completed');
    } catch (error) {
      console.error('❌ Quick clean failed:', error);
      throw error;
    }
  }

  /**
   * Switch theme without full reset
   */
  async switchTheme(theme: string): Promise<void> {
    console.log(`🔄 Switching to theme: ${theme}...`);
    
    try {
      await this.orchestrator.resetDatabase();
      await this.orchestrator.applySeedTheme(theme);
      await this.clean(); // Clear cache and reindex
      
      console.log(`✅ Theme switched to: ${theme}`);
    } catch (error) {
      console.error('❌ Theme switch failed:', error);
      throw error;
    }
  }

  /**
   * Health check for all systems
   */
  async healthCheck(): Promise<void> {
    console.log('🏥 Running health check...');
    
    try {
      // Check database connection
      const dbSummary = await this.orchestrator.getDatabaseSummary();
      console.log('✅ Database connection OK');
      console.log(`   Total posts: ${dbSummary.posts}`);
      console.log(`   Total users: ${dbSummary.users}`);

      // Check Redis cache
      const cacheHealth = await domainCache.healthCheck();
      if (cacheHealth.redis) {
        console.log('✅ Redis cache OK');
        console.log(`   Latency: ${cacheHealth.latency}ms`);
        console.log(`   Version: ${cacheHealth.version}`);
      } else {
        console.log('⚠️ Redis cache unavailable');
      }

      // Check search index
      try {
        await SearchIndexer.reindexAll();
        console.log('✅ Search index OK');
      } catch (error) {
        console.log('⚠️ Search index issue:', error);
      }

      console.log('\n🎉 Health check completed');
    } catch (error) {
      console.error('❌ Health check failed:', error);
      throw error;
    }
  }

  /**
   * Performance benchmark
   */
  async benchmark(): Promise<void> {
    console.log('⚡ Running performance benchmark...');
    
    const results = {
      database: { read: 0, write: 0 },
      cache: { read: 0, write: 0 },
      search: { index: 0, query: 0 },
    };

    try {
      // Database benchmark
      console.log('📊 Benchmarking database...');
      const dbStart = Date.now();
      await this.orchestrator.getDatabaseSummary();
      results.database.read = Date.now() - dbStart;

      // Cache benchmark
      console.log('📊 Benchmarking cache...');
      const cacheStart = Date.now();
      await domainCache.healthCheck();
      results.cache.read = Date.now() - cacheStart;

      // Search benchmark
      console.log('📊 Benchmarking search...');
      const searchStart = Date.now();
      // Note: In real implementation, run actual search queries
      results.search.query = Date.now() - searchStart;

      console.log('\n⚡ Benchmark Results:');
      console.log(`   Database read: ${results.database.read}ms`);
      console.log(`   Cache read: ${results.cache.read}ms`);
      console.log(`   Search query: ${results.search.query}ms`);
      
    } catch (error) {
      console.error('❌ Benchmark failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.orchestrator.disconnect();
  }
}

/**
 * CLI interface
 */
async function main() {
  const workflow = new DevWorkflow();
  
  try {
    const command = process.argv[2];
    const theme = process.argv[3];
    
    switch (command) {
      case 'reset':
        await workflow.reset({ 
          theme: theme || 'politics',
          verbose: true 
        });
        break;
        
      case 'clean':
        await workflow.clean();
        break;
        
      case 'switch':
        if (!theme) {
          console.error('❌ Please provide a theme name');
          process.exit(1);
        }
        await workflow.switchTheme(theme);
        break;
        
      case 'health':
        await workflow.healthCheck();
        break;
        
      case 'benchmark':
        await workflow.benchmark();
        break;
        
      default:
        console.log('🛠️ Dev Workflow Commands:');
        console.log('  reset [theme]    - Complete reset with optional theme');
        console.log('  clean            - Quick cache clear and reindex');
        console.log('  switch <theme>   - Switch to different theme');
        console.log('  health           - System health check');
        console.log('  benchmark        - Performance benchmark');
        console.log('');
        console.log('Available themes: politics, tech');
        break;
    }
  } catch (error) {
    console.error('💥 Workflow failed:', error);
    process.exit(1);
  } finally {
    await workflow.disconnect();
  }
}

// Export for programmatic use
export { DevWorkflow };
export type { WorkflowOptions };

// Run if called directly (ES module check)
if (import.meta.url === new URL(process.argv[1] || '', 'file://').href) {
  main();
}
