import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed for Post+Revision schema...');

  // Clear existing data
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

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'US Politics' } }),
    prisma.category.create({ data: { name: 'Canadian Politics' } }),
    prisma.category.create({ data: { name: 'Latin American Politics' } }),
    prisma.category.create({ data: { name: 'Western Hemisphere Security' } }),
    prisma.category.create({ data: { name: 'Americas Trade & Economics' } }),
    prisma.category.create({ data: { name: 'Migration & Border Policy' } }),
    prisma.category.create({ data: { name: 'Environmental Policy' } }),
  ]);
  console.log('✅ Created categories');

  // Create authors
  const maria = await prisma.user.create({
    data: {
      id: 'user_maria_rodriguez',
      name: 'Maria Rodriguez',
      email: 'maria@example.com',
      role: 'AUTHOR',
      reputation: 78,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    },
  });

  const james = await prisma.user.create({
    data: {
      id: 'user_james_wilson',
      name: 'James Wilson',
      email: 'james@example.com',
      role: 'AUTHOR',
      reputation: 92,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
  });

  const sarah = await prisma.user.create({
    data: {
      id: 'user_sarah_chen',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      role: 'EDITOR',
      reputation: 85,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b808?w=150',
    },
  });
  console.log('✅ Created authors');

  // Helper function to create posts with revisions
  const createPostWithRevision = async (postData: {
    title: string;
    prompt: string;
    contentBlocks: any;
    tone: string;
    style: string;
    minRead: number;
    categoryId: number;
    status?: 'DRAFT' | 'PUBLISHED';
    upVotes?: number;
    downVotes?: number;
    userId: string;
  }) => {
    const slug = postData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + `-${Math.random().toString(36).substr(2, 9)}`;

    const post = await prisma.post.create({
      data: {
        slug,
        status: postData.status || 'PUBLISHED',
        categoryId: postData.categoryId,
        upVotes: postData.upVotes || 0,
        downVotes: postData.downVotes || 0,
        authors: {
          create: {
            userId: postData.userId,
          }
        }
      },
    });

    // Create the initial revision
    const revision = await prisma.revision.create({
      data: {
        title: postData.title,
        prompt: postData.prompt,
        contentBlocks: postData.contentBlocks,
        tone: postData.tone,
        style: postData.style,
        minRead: postData.minRead,
        summaryOfChanges: 'Initial version',
        version: 1,
        postId: post.id,
      }
    });

    // Link the current revision
    await prisma.post.update({
      where: { id: post.id },
      data: { currentRevisionId: revision.id }
    });

    // Create analytics
    await prisma.analytics.create({
      data: {
        postId: post.id,
        views: Math.floor(Math.random() * 1000),
        sourceClicks: Math.floor(Math.random() * 50),
      }
    });

    return post;
  };

  // Create posts
  console.log('📝 Creating posts...');

  // Maria's posts (Latin America expert)
  await createPostWithRevision({
    title: 'Brazil\'s New Foreign Policy Shift Toward Regional Integration',
    prompt: 'Analyze Brazil\'s recent diplomatic initiatives in South America and their implications for regional trade partnerships',
    contentBlocks: {
      blocks: [
        {
          type: 'title',
          content: 'Brazil\'s New Foreign Policy Shift Toward Regional Integration'
        },
        {
          type: 'paragraph',
          content: 'Brazil\'s President has announced a comprehensive new foreign policy framework aimed at strengthening economic ties across Latin America. This represents a significant shift from previous administrations\' approaches to regional diplomacy.'
        },
        {
          type: 'paragraph',
          content: 'The policy includes expanded trade agreements with Argentina, Colombia, and Peru, potentially creating the largest economic bloc in the Southern Cone since Mercosur\'s inception.'
        },
        {
          type: 'heading',
          content: 'Regional Implications'
        },
        {
          type: 'list',
          content: JSON.stringify([
            'Enhanced trade cooperation between major South American economies',
            'Reduced dependency on external markets for regional commerce',
            'Strengthened political ties through economic integration',
            'Potential challenges to existing trade relationships with North America'
          ])
        }
      ]
    },
    tone: 'ANALYTICAL',
    style: 'ACADEMIC',
    minRead: 6,
    categoryId: categories[2].id, // Latin American Politics
    upVotes: 34,
    downVotes: 2,
    userId: maria.id,
  });

  await createPostWithRevision({
    title: 'Mexico\'s Energy Independence Strategy and USMCA Relations',
    prompt: 'Examine Mexico\'s push for energy independence and how it affects USMCA trade relationships',
    contentBlocks: {
      blocks: [
        {
          type: 'title',
          content: 'Mexico\'s Energy Independence Strategy and USMCA Relations'
        },
        {
          type: 'paragraph',
          content: 'Mexico\'s recent nationalization of lithium resources has sparked intense debate about energy sovereignty versus international trade commitments under the USMCA agreement.'
        },
        {
          type: 'paragraph',
          content: 'The move represents a significant shift in Mexico\'s economic policy, prioritizing domestic control over strategic resources while potentially creating tensions with trading partners.'
        }
      ]
    },
    tone: 'NEUTRAL',
    style: 'JOURNALISTIC',
    minRead: 5,
    categoryId: categories[4].id, // Americas Trade & Economics
    status: 'DRAFT',
    upVotes: 12,
    downVotes: 1,
    userId: maria.id,
  });

  // James's posts (US Politics expert)
  await createPostWithRevision({
    title: 'Congressional Gridlock on Immigration Reform: Analysis of Recent Proposals',
    prompt: 'Analyze the current state of immigration reform proposals in Congress and their potential impact',
    contentBlocks: {
      blocks: [
        {
          type: 'title',
          content: 'Congressional Gridlock on Immigration Reform: Analysis of Recent Proposals'
        },
        {
          type: 'paragraph',
          content: 'Despite bipartisan rhetoric about the need for comprehensive immigration reform, Congress remains deadlocked on key provisions that could reshape America\'s approach to border security and legal immigration pathways.'
        },
        {
          type: 'heading',
          content: 'Key Points of Contention'
        },
        {
          type: 'list',
          content: JSON.stringify([
            'Pathway to citizenship for undocumented immigrants',
            'Border security funding and technology implementation',
            'Work visa programs and seasonal labor provisions',
            'Family reunification policies and processing times'
          ])
        }
      ]
    },
    tone: 'ANALYTICAL',
    style: 'JOURNALISTIC',
    minRead: 4,
    categoryId: categories[0].id, // US Politics
    upVotes: 28,
    downVotes: 8,
    userId: james.id,
  });

  // Sarah's posts (Environmental & Trade focus)
  await createPostWithRevision({
    title: 'Climate Policy Coordination Across North American Borders',
    prompt: 'Evaluate cross-border environmental initiatives between the US, Canada, and Mexico',
    contentBlocks: {
      blocks: [
        {
          type: 'title',
          content: 'Climate Policy Coordination Across North American Borders'
        },
        {
          type: 'paragraph',
          content: 'The three USMCA partners are increasingly aligning their climate policies, creating unprecedented opportunities for coordinated environmental action across North America.'
        },
        {
          type: 'paragraph',
          content: 'Recent initiatives include joint carbon pricing mechanisms, cross-border clean energy infrastructure, and coordinated responses to climate-related migration challenges.'
        },
        {
          type: 'quote',
          content: 'Climate change doesn\'t respect borders, and neither should our solutions. - Joint USMCA Climate Statement'
        }
      ]
    },
    tone: 'OPTIMISTIC',
    style: 'JOURNALISTIC',
    minRead: 7,
    categoryId: categories[6].id, // Environmental Policy
    upVotes: 45,
    downVotes: 3,
    userId: sarah.id,
  });

  await createPostWithRevision({
    title: 'AI-Generated Analysis: Future of Renewable Energy in the Americas',
    prompt: 'Write a comprehensive analysis of renewable energy trends, challenges, and opportunities across North and South America, including policy recommendations and technological innovations',
    contentBlocks: {
      blocks: [
        {
          type: 'title',
          content: 'Future of Renewable Energy in the Americas'
        },
        {
          type: 'paragraph',
          content: 'The Americas stand at a critical juncture in the global energy transition, with unprecedented opportunities to lead in renewable energy adoption and innovation.'
        },
        {
          type: 'heading',
          content: 'Regional Opportunities'
        },
        {
          type: 'list',
          content: JSON.stringify([
            'Abundant solar and wind resources across diverse geographic zones',
            'Established manufacturing capabilities for renewable technologies',
            'Growing political consensus on climate action',
            'Significant investment flows from both public and private sectors'
          ])
        },
        {
          type: 'heading',
          content: 'Key Challenges'
        },
        {
          type: 'paragraph',
          content: 'Despite these opportunities, several challenges must be addressed to realize the full potential of renewable energy across the hemisphere.'
        }
      ]
    },
    tone: 'ANALYTICAL',
    style: 'JOURNALISTIC',
    minRead: 8,
    categoryId: categories[4].id, // Americas Trade & Economics
    upVotes: 52,
    downVotes: 4,
    userId: sarah.id,
  });

  console.log('✅ Created posts with revisions');

  // Create some comments
  console.log('💬 Creating comments...');
  const posts = await prisma.post.findMany({ take: 3 });
  for (const post of posts) {
    await prisma.comment.create({
      data: {
        content: 'This is a very insightful analysis. Thank you for sharing!',
        postId: post.id,
        authorId: maria.id,
      }
    });
  }

  console.log('✅ Created comments');

  // Summary
  const postCount = await prisma.post.count();
  const revisionCount = await prisma.revision.count();
  const categoryCount = await prisma.category.count();
  const userCount = await prisma.user.count();

  console.log('\n📊 Seed Summary:');
  console.log(`   Posts: ${postCount}`);
  console.log(`   Revisions: ${revisionCount}`);
  console.log(`   Categories: ${categoryCount}`);
  console.log(`   Users: ${userCount}`);
  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('💥 Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
