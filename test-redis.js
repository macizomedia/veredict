import { createClient } from 'redis';

const client = createClient({
  url: 'redis://default:8pVEx0BVsvQJ6JWo817yuDw3s1O4TID7@redis-17608.c83.us-east-1-2.ec2.redns.redis-cloud.com:17608'
});

client.on('error', (err) => console.log('❌ Redis Client Error', err));
client.on('connect', () => console.log('✅ Connected to Redis Cloud'));

async function testRedis() {
  try {
    await client.connect();
    
    console.log('\n🔍 Testing Redis Cloud Connection...\n');
    
    // Test basic operations
    await client.set('test', `Hello Redis Cloud! ${new Date().toISOString()}`);
    const value = await client.get('test');
    console.log('✅ Basic operations work. Test value:', value);
    
    // Check Redis info
    const info = await client.info('keyspace');
    console.log('\n📊 Redis Keyspace Info:');
    console.log(info || 'No keyspace info available');
    
    // Check if search index exists
    const allPosts = await client.sMembers('all_posts');
    console.log(`\n📄 Indexed posts: ${allPosts.length}`);
    if (allPosts.length > 0) {
      console.log('Post IDs:', allPosts.slice(0, 10)); // Show first 10
    }
    
    // Check cache keys
    const searchKeys = await client.keys('search:*');
    const feedKeys = await client.keys('feed:*');
    const postKeys = await client.keys('post:*');
    
    console.log(`\n🗂️  Cache Statistics:`);
    console.log(`   Search cache keys: ${searchKeys.length}`);
    console.log(`   Feed cache keys: ${feedKeys.length}`);
    console.log(`   Post document keys: ${postKeys.length}`);
    
    if (searchKeys.length > 0) {
      console.log('   Sample search keys:', searchKeys.slice(0, 3));
    }
    
    // Check sorted sets
    const dateCount = await client.zCard('posts:by_date');
    const viewsCount = await client.zCard('posts:by_views');
    const votesCount = await client.zCard('posts:by_votes');
    
    console.log(`\n📈 Sorted Sets:`);
    console.log(`   Posts by date: ${dateCount}`);
    console.log(`   Posts by views: ${viewsCount}`);
    console.log(`   Posts by votes: ${votesCount}`);
    
    // Show recent posts by date if any exist
    if (dateCount > 0) {
      const recentPosts = await client.zRangeWithScores('posts:by_date', -5, -1);
      if (Array.isArray(recentPosts)) {
        console.log(`   Recent posts:`, recentPosts.map(p => `${p.value}(${p.score})`).join(', '));
      }
    }
    
    console.log('\n🎉 Redis Cloud test completed successfully!');
    
  } catch (error) {
    console.error('❌ Redis test failed:', error);
  } finally {
    await client.disconnect();
    console.log('🔌 Disconnected from Redis Cloud');
  }
}

testRedis().catch(console.error);
