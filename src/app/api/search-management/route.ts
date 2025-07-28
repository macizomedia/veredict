import { NextRequest, NextResponse } from 'next/server';
import { SearchIndexer } from '@/server/search-indexer';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    
    if (action === 'reindex') {
      await SearchIndexer.reindexAll();
      return NextResponse.json({ 
        success: true, 
        message: 'All posts reindexed successfully' 
      });
    }
    
    if (action === 'clear') {
      await SearchIndexer.clearAllIndexes();
      return NextResponse.json({ 
        success: true, 
        message: 'All search indexes cleared' 
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Invalid action' 
    }, { status: 400 });
    
  } catch (error) {
    console.error('Search management error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Operation failed' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    endpoints: {
      POST: {
        reindex: 'Reindex all posts in Redis',
        clear: 'Clear all search indexes'
      }
    }
  });
}
