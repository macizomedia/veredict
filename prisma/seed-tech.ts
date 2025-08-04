import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Tech/Stock Market themed seed data
 * Demonstrates generalized seeding approach for different content domains
 */
async function main() {
  console.log('🚀 Starting Tech/Stock Market seed...');

  // Clear existing data in dependency order
  console.log('🧹 Clearing existing data...');
  await prisma.analytics.deleteMany({});
  await prisma.postLabel.deleteMany({});
  await prisma.source.deleteMany({});
  await prisma.postAuthor.deleteMany({});
  await prisma.vote.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.revision.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  // Create tech-focused categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Artificial Intelligence' } }),
    prisma.category.create({ data: { name: 'Cryptocurrency' } }),
    prisma.category.create({ data: { name: 'Stock Market Analysis' } }),
    prisma.category.create({ data: { name: 'Tech IPOs' } }),
    prisma.category.create({ data: { name: 'Venture Capital' } }),
    prisma.category.create({ data: { name: 'Cybersecurity' } }),
    prisma.category.create({ data: { name: 'Cloud Computing' } }),
  ]);

  const [aiCategory, cryptoCategory, stockCategory, ipoCategory, vcCategory, cyberCategory, cloudCategory] = categories;
  console.log('✅ Created tech categories');

  // Create tech-focused authors
  const alex = await prisma.user.create({
    data: {
      id: 'user_alex_chen',
      name: 'Alex Chen',
      email: 'alex.chen@techanalyst.com',
      role: 'AUTHOR',
      reputation: 92,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const sarah = await prisma.user.create({
    data: {
      id: 'user_sarah_kim',
      name: 'Sarah Kim',
      email: 'sarah.kim@venture.com',
      role: 'EDITOR',
      reputation: 88,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    },
  });

  const mike = await prisma.user.create({
    data: {
      id: 'user_mike_johnson',
      name: 'Mike Johnson',
      email: 'mike@cryptoreport.com',
      role: 'AUTHOR',
      reputation: 76,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
  });

  console.log('✅ Created tech authors');

  // Create tech-focused posts with revisions
  const aiPost = await prisma.post.create({
    data: {
      slug: 'nvidia-q3-earnings-ai-dominance',
      status: 'PUBLISHED',
      categoryId: aiCategory.id,
      upVotes: 156,
      downVotes: 12,
    },
  });

  const aiRevision = await prisma.revision.create({
    data: {
      title: 'NVIDIA Q3 Earnings: AI Chip Dominance Continues',
      prompt: 'Analyze NVIDIA\'s latest quarterly earnings and their position in the AI chip market',
      contentBlocks: {
        blocks: [
          {
            type: 'paragraph',
            content: 'NVIDIA reported exceptional Q3 results, with data center revenue reaching $47.5 billion, driven primarily by AI chip demand from major cloud providers and enterprises accelerating their AI infrastructure deployments.'
          },
          {
            type: 'paragraph',
            content: 'The company\'s H100 and newer H200 GPUs continue to see unprecedented demand, with order backlogs extending well into 2025. This positions NVIDIA as the critical enabler of the current AI revolution.'
          }
        ]
      },
      tone: 'ANALYTICAL',
      style: 'TECHNICAL',
      minRead: 7,
      postId: aiPost.id,
      version: 1,
    },
  });

  // Update post with current revision
  await prisma.post.update({
    where: { id: aiPost.id },
    data: { currentRevisionId: aiRevision.id },
  });

  // Add author
  await prisma.postAuthor.create({
    data: {
      postId: aiPost.id,
      userId: alex.id,
    },
  });

  // Create crypto post
  const cryptoPost = await prisma.post.create({
    data: {
      slug: 'bitcoin-etf-institutional-adoption',
      status: 'PUBLISHED',
      categoryId: cryptoCategory.id,
      upVotes: 89,
      downVotes: 23,
    },
  });

  const cryptoRevision = await prisma.revision.create({
    data: {
      title: 'Bitcoin ETF Drives Institutional Adoption to New Heights',
      prompt: 'Examine the impact of Bitcoin ETF approval on institutional cryptocurrency adoption',
      contentBlocks: {
        blocks: [
          {
            type: 'paragraph',
            content: 'The approval of spot Bitcoin ETFs has fundamentally changed the institutional investment landscape, with over $15 billion in net inflows recorded in the first six months of trading.'
          },
          {
            type: 'list',
            content: 'Key institutional investors include: pension funds, insurance companies, university endowments, and corporate treasuries seeking digital asset exposure.'
          }
        ]
      },
      tone: 'PROFESSIONAL',
      style: 'JOURNALISTIC',
      minRead: 5,
      postId: cryptoPost.id,
      version: 1,
    },
  });

  await prisma.post.update({
    where: { id: cryptoPost.id },
    data: { currentRevisionId: cryptoRevision.id },
  });

  await prisma.postAuthor.create({
    data: {
      postId: cryptoPost.id,
      userId: mike.id,
    },
  });

  // Create stock market analysis post
  const stockPost = await prisma.post.create({
    data: {
      slug: 'magnificent-seven-q4-outlook',
      status: 'PUBLISHED',
      categoryId: stockCategory.id,
      upVotes: 234,
      downVotes: 18,
    },
  });

  const stockRevision = await prisma.revision.create({
    data: {
      title: 'Magnificent Seven Q4 Outlook: AI Spending vs. Economic Headwinds',
      prompt: 'Analyze Q4 prospects for major tech stocks amid AI investment trends and economic uncertainty',
      contentBlocks: {
        blocks: [
          {
            type: 'paragraph',
            content: 'The Magnificent Seven tech giants face a challenging Q4 as AI infrastructure spending continues to surge while broader economic concerns create headwinds for traditional revenue streams.'
          },
          {
            type: 'paragraph',
            content: 'Microsoft, Google, and Amazon are leading AI capital expenditure, with combined quarterly spending exceeding $50 billion on data centers and AI compute infrastructure.'
          }
        ]
      },
      tone: 'ANALYTICAL',
      style: 'ACADEMIC',
      minRead: 8,
      postId: stockPost.id,
      version: 1,
    },
  });

  await prisma.post.update({
    where: { id: stockPost.id },
    data: { currentRevisionId: stockRevision.id },
  });

  await prisma.postAuthor.create({
    data: {
      postId: stockPost.id,
      userId: sarah.id,
    },
  });

  // Add analytics for all posts
  for (const post of [aiPost, cryptoPost, stockPost]) {
    await prisma.analytics.create({
      data: {
        postId: post.id,
        views: Math.floor(Math.random() * 2000) + 500,
        sourceClicks: Math.floor(Math.random() * 100) + 20,
      },
    });
  }

  // Add some sources
  await prisma.source.createMany({
    data: [
      { postId: aiPost.id, url: 'https://investor.nvidia.com/financial-info/quarterly-results' },
      { postId: aiPost.id, url: 'https://www.sec.gov/edgar/browse/?CIK=0001045810' },
      { postId: cryptoPost.id, url: 'https://www.sec.gov/files/investment-advisers/investment-adviser-registrations' },
      { postId: stockPost.id, url: 'https://www.bloomberg.com/news/technology' },
    ],
  });

  // Add some comments
  await prisma.comment.createMany({
    data: [
      {
        postId: aiPost.id,
        authorId: sarah.id,
        content: 'Excellent analysis of NVIDIA\'s moat in the AI chip market. The supply constraints are the key factor to watch.',
      },
      {
        postId: cryptoPost.id,
        authorId: alex.id,
        content: 'The ETF flows are impressive, but we should also consider the regulatory landscape changes.',
      },
    ],
  });

  // Print summary
  const postCount = await prisma.post.count();
  const revisionCount = await prisma.revision.count();
  const categoryCount = await prisma.category.count();
  const userCount = await prisma.user.count();

  console.log('\n📊 Tech Seed Summary:');
  console.log(`   Posts: ${postCount}`);
  console.log(`   Revisions: ${revisionCount}`);
  console.log(`   Categories: ${categoryCount}`);
  console.log(`   Users: ${userCount}`);
  console.log('\n🎉 Tech seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('💥 Tech seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
