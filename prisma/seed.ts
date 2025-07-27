import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting political seed for Western Hemisphere...');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.vote.deleteMany();
    await prisma.postAuthor.deleteMany();
    await prisma.postLabel.deleteMany();
    await prisma.analytics.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.source.deleteMany();
    await prisma.post.deleteMany();
    await prisma.category.deleteMany();
    await prisma.account.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();

    // Create political/geopolitical categories
    const usaPoliticsCategory = await prisma.category.create({
      data: { name: 'US Politics' },
    });

    const canadaPoliticsCategory = await prisma.category.create({
      data: { name: 'Canadian Politics' },
    });

    const latinAmericaCategory = await prisma.category.create({
      data: { name: 'Latin American Politics' },
    });

    const hemisphereSecurityCategory = await prisma.category.create({
      data: { name: 'Western Hemisphere Security' },
    });

    const tradeEconomicsCategory = await prisma.category.create({
      data: { name: 'Americas Trade & Economics' },
    });

    const migrationCategory = await prisma.category.create({
      data: { name: 'Migration & Border Policy' },
    });

    const climateCategory = await prisma.category.create({
      data: { name: 'Environmental Policy' },
    });

    console.log('✅ Created political categories');

    // Create three political analysts/journalists
    const author1 = await prisma.user.create({
      data: {
        name: 'Dr. Maria Rodriguez',
        email: 'maria.rodriguez@example.com',
        role: 'AUTHOR',
        reputation: 85,
        image: 'https://images.unsplash.com/photo-1494790108755-2616b2e1e2d4?w=150',
      },
    });

    const author2 = await prisma.user.create({
      data: {
        name: 'James Mitchell',
        email: 'james.mitchell@example.com',
        role: 'EDITOR',
        reputation: 92,
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      },
    });

    const author3 = await prisma.user.create({
      data: {
        name: 'Sarah Chen-Williams',
        email: 'sarah.chenwilliams@example.com',
        role: 'AUTHOR',
        reputation: 78,
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      },
    });

    console.log('✅ Created political authors');

    // Maria Rodriguez's posts (Latin America expert)
    const mariaPost1 = await prisma.post.create({
      data: {
        title: 'Brazil\'s New Foreign Policy Shift Toward Regional Integration',
        prompt: 'Analyze Brazil\'s recent diplomatic initiatives in South America and their implications for regional trade partnerships',
        contentBlocks: {
          blocks: [
            {
              type: 'paragraph',
              content: 'Brazil\'s President has announced a comprehensive new foreign policy framework aimed at strengthening economic ties across Latin America. This represents a significant shift from previous administrations\' approaches to regional diplomacy.'
            },
            {
              type: 'paragraph', 
              content: 'The policy includes expanded trade agreements with Argentina, Colombia, and Peru, potentially creating the largest economic bloc in the Southern Cone since Mercosur\'s inception.'
            }
          ]
        },
        status: 'PUBLISHED',
        categoryId: latinAmericaCategory.id,
        minRead: 6,
        tone: 'ANALYTICAL',
        style: 'ACADEMIC',
        upVotes: 34,
        downVotes: 2,
      },
    });

    const mariaPost2 = await prisma.post.create({
      data: {
        title: 'Mexico\'s Energy Independence Strategy and US Relations',
        prompt: 'Examine Mexico\'s push for energy independence and how it affects USMCA trade relationships',
        contentBlocks: {
          blocks: [
            {
              type: 'paragraph',
              content: 'Mexico\'s recent nationalization of lithium resources has sparked intense debate about energy sovereignty versus international trade commitments under the USMCA agreement.'
            }
          ]
        },
        status: 'DRAFT',
        categoryId: tradeEconomicsCategory.id,
        minRead: 5,
        tone: 'NEUTRAL',
        style: 'JOURNALISTIC',
      },
    });

    const mariaPost3 = await prisma.post.create({
      data: {
        title: 'Venezuelan Political Crisis: Regional Response and Humanitarian Impact',
        prompt: 'Analyze the ongoing Venezuelan political situation and its effects on neighboring countries\' migration policies',
        contentBlocks: {
          blocks: [
            {
              type: 'paragraph',
              content: 'The Venezuelan political crisis continues to destabilize the region, with over 7 million Venezuelan migrants now living across Latin America, creating unprecedented challenges for host nations.'
            },
            {
              type: 'paragraph',
              content: 'Colombia, Peru, and Ecuador have implemented different integration strategies, with varying degrees of success in managing this historic migration flow.'
            }
          ]
        },
        status: 'PUBLISHED',
        categoryId: migrationCategory.id,
        minRead: 8,
        tone: 'EMPATHETIC',
        style: 'INVESTIGATIVE',
        upVotes: 67,
        downVotes: 8,
      },
    });

    const mariaPost4 = await prisma.post.create({
      data: {
        title: 'Climate Diplomacy in the Amazon: Multi-National Conservation Efforts',
        prompt: 'Report on the latest Amazon conservation agreements between Brazil, Peru, Colombia, and international partners',
        status: 'DRAFT',
        categoryId: climateCategory.id,
        minRead: 7,
        tone: 'HOPEFUL',
        style: 'FEATURE',
      },
    });

    // James Mitchell's posts (US-Canada relations expert)
    const jamesPost1 = await prisma.post.create({
      data: {
        title: 'US Midterm Elections: Impact on Western Hemisphere Foreign Policy',
        prompt: 'Analyze how the latest US midterm election results will affect America\'s relationships with Canada and Latin America',
        contentBlocks: {
          blocks: [
            {
              type: 'paragraph',
              content: 'The recent shift in Congressional power has significant implications for US foreign policy across the Western Hemisphere, particularly regarding trade agreements and immigration reform.'
            },
            {
              type: 'paragraph',
              content: 'Key committee appointments suggest a more protectionist approach toward USMCA renegotiations, while immigration policy may see bipartisan cooperation on border security measures.'
            }
          ]
        },
        status: 'PUBLISHED',
        categoryId: usaPoliticsCategory.id,
        minRead: 5,
        tone: 'ANALYTICAL',
        style: 'POLICY_BRIEF',
        upVotes: 89,
        downVotes: 15,
      },
    });

    const jamesPost2 = await prisma.post.create({
      data: {
        title: 'Canada\'s Arctic Sovereignty and US Security Interests',
        prompt: 'Examine the growing strategic importance of Arctic territories and how Canada-US cooperation is evolving',
        contentBlocks: {
          blocks: [
            {
              type: 'paragraph',
              content: 'As climate change opens new Arctic shipping routes, both Canada and the United States are reassessing their northern security strategies and territorial claims.'
            }
          ]
        },
        status: 'PUBLISHED',
        categoryId: hemisphereSecurityCategory.id,
        minRead: 6,
        tone: 'STRATEGIC',
        style: 'ANALYTICAL',
        upVotes: 45,
        downVotes: 3,
      },
    });

    const jamesPost3 = await prisma.post.create({
      data: {
        title: 'USMCA Review: Three Years of North American Trade Integration',
        prompt: 'Provide a comprehensive analysis of USMCA\'s performance and its impact on trilateral trade relationships',
        status: 'DRAFT',
        categoryId: tradeEconomicsCategory.id,
        minRead: 9,
        tone: 'EVALUATIVE',
        style: 'COMPREHENSIVE',
      },
    });

    const jamesPost4 = await prisma.post.create({
      data: {
        title: 'Border Security Technology: US-Mexico Cooperation on Migration Management',
        prompt: 'Analyze new technological approaches to border management and their effectiveness in addressing migration challenges',
        contentBlocks: {
          blocks: [
            {
              type: 'paragraph',
              content: 'Advanced biometric systems and AI-powered surveillance technologies are transforming how the US and Mexico collaborate on border security while maintaining humanitarian considerations.'
            }
          ]
        },
        status: 'PUBLISHED',
        categoryId: migrationCategory.id,
        minRead: 7,
        tone: 'TECHNICAL',
        style: 'INVESTIGATIVE',
        upVotes: 52,
        downVotes: 12,
      },
    });

    // Sarah Chen-Williams's posts (Security and hemispheric cooperation expert)
    const sarahPost1 = await prisma.post.create({
      data: {
        title: 'Drug Trafficking Networks: Hemispheric Security Cooperation Challenges',
        prompt: 'Investigate how drug trafficking organizations operate across Western Hemisphere borders and joint enforcement efforts',
        contentBlocks: {
          blocks: [
            {
              type: 'paragraph',
              content: 'Transnational criminal organizations have evolved sophisticated networks spanning from Colombia to Canada, requiring unprecedented cooperation between law enforcement agencies across the hemisphere.'
            },
            {
              type: 'paragraph',
              content: 'Recent joint operations between DEA, RCMP, and regional partners have disrupted major trafficking routes, but new challenges emerge as cartels adapt their strategies.'
            }
          ]
        },
        status: 'PUBLISHED',
        categoryId: hemisphereSecurityCategory.id,
        minRead: 8,
        tone: 'INVESTIGATIVE',
        style: 'DETAILED',
        upVotes: 78,
        downVotes: 6,
      },
    });

    const sarahPost2 = await prisma.post.create({
      data: {
        title: 'OAS Electoral Observation: Democracy Monitoring Across the Americas',
        prompt: 'Report on the Organization of American States\' electoral monitoring efforts and their impact on democratic governance',
        status: 'DRAFT',
        categoryId: hemisphereSecurityCategory.id,
        minRead: 6,
        tone: 'OBJECTIVE',
        style: 'INSTITUTIONAL',
      },
    });

    const sarahPost3 = await prisma.post.create({
      data: {
        title: 'Haiti Crisis: Regional Humanitarian Response and Security Implications',
        prompt: 'Analyze the ongoing crisis in Haiti and how regional partners are coordinating humanitarian assistance',
        contentBlocks: {
          blocks: [
            {
              type: 'paragraph',
              content: 'Haiti\'s deteriorating security situation has prompted an emergency response from Caribbean Community (CARICOM) nations and broader hemispheric partners, highlighting the interconnected nature of regional stability.'
            }
          ]
        },
        status: 'PUBLISHED',
        categoryId: hemisphereSecurityCategory.id,
        minRead: 7,
        tone: 'URGENT',
        style: 'NEWS_ANALYSIS',
        upVotes: 91,
        downVotes: 4,
      },
    });

    const sarahPost4 = await prisma.post.create({
      data: {
        title: 'Cyber Security in the Americas: Regional Threat Assessment',
        prompt: 'Examine cyber security threats affecting Western Hemisphere nations and collaborative defense initiatives',
        status: 'DRAFT',
        categoryId: hemisphereSecurityCategory.id,
        minRead: 8,
        tone: 'TECHNICAL',
        style: 'STRATEGIC',
      },
    });

    const sarahPost5 = await prisma.post.create({
      data: {
        title: 'Pacific Alliance vs Mercosur: Competing Visions for Latin American Integration',
        prompt: 'Compare and contrast the Pacific Alliance and Mercosur approaches to regional economic integration',
        contentBlocks: {
          blocks: [
            {
              type: 'paragraph',
              content: 'Two distinct models of regional integration compete for influence in Latin America: the Pacific Alliance\'s market-oriented approach versus Mercosur\'s more protectionist framework.'
            },
            {
              type: 'paragraph',
              content: 'Chile, Colombia, Mexico, and Peru\'s Pacific Alliance emphasizes free trade and integration with Asian markets, while Brazil and Argentina lead Mercosur\'s focus on regional industrial development.'
            }
          ]
        },
        status: 'PUBLISHED',
        categoryId: tradeEconomicsCategory.id,
        minRead: 9,
        tone: 'COMPARATIVE',
        style: 'ANALYTICAL',
        upVotes: 63,
        downVotes: 11,
      },
    });

    // Create PostAuthor relationships
    const posts = [
      { post: mariaPost1, author: author1 },
      { post: mariaPost2, author: author1 },
      { post: mariaPost3, author: author1 },
      { post: mariaPost4, author: author1 },
      { post: jamesPost1, author: author2 },
      { post: jamesPost2, author: author2 },
      { post: jamesPost3, author: author2 },
      { post: jamesPost4, author: author2 },
      { post: sarahPost1, author: author3 },
      { post: sarahPost2, author: author3 },
      { post: sarahPost3, author: author3 },
      { post: sarahPost4, author: author3 },
      { post: sarahPost5, author: author3 },
    ];

    for (const { post, author } of posts) {
      await prisma.postAuthor.create({
        data: {
          postId: post.id,
          userId: author.id,
        },
      });
    }

    // Create analytics for published posts
    const publishedPosts = [mariaPost1, mariaPost3, jamesPost1, jamesPost2, jamesPost4, sarahPost1, sarahPost3, sarahPost5];
    
    for (const post of publishedPosts) {
      await prisma.analytics.create({
        data: {
          postId: post.id,
          views: Math.floor(Math.random() * 1000) + 100,
          sourceClicks: Math.floor(Math.random() * 50) + 5,
        },
      });
    }

    // Add some sources to published posts
    await prisma.source.createMany({
      data: [
        { postId: mariaPost1.id, url: 'https://www.americasquarterly.org/content/brazil-regional-integration' },
        { postId: mariaPost3.id, url: 'https://www.unhcr.org/venezuela-emergency' },
        { postId: jamesPost1.id, url: 'https://www.cfr.org/blog/us-midterm-elections-hemisphere-policy' },
        { postId: jamesPost2.id, url: 'https://www.arctic-council.org/en/explore/work/cooperation' },
        { postId: sarahPost1.id, url: 'https://www.unodc.org/americas/en/index.html' },
        { postId: sarahPost3.id, url: 'https://www.caricom.org/haiti-crisis-response' },
        { postId: sarahPost5.id, url: 'https://www.alianzapacifico.net/en/' },
      ],
    });

    // Add some comments to published posts
    await prisma.comment.createMany({
      data: [
        {
          postId: mariaPost1.id,
          authorId: author2.id,
          content: 'Excellent analysis of Brazil\'s regional strategy. The economic implications could reshape South American trade dynamics.',
        },
        {
          postId: jamesPost1.id,
          authorId: author1.id,
          content: 'The midterm results indeed signal a shift. I\'d add that immigration policy will be particularly contentious.',
        },
        {
          postId: sarahPost3.id,
          authorId: author2.id,
          content: 'The Haiti situation requires urgent attention. Regional cooperation is essential for any meaningful solution.',
        },
      ],
    });

    console.log('✅ Created comprehensive political content for Western Hemisphere');
    console.log('📊 Summary:');
    console.log('- 3 political analysts/journalists');
    console.log('- 13 political posts (9 published, 4 drafts)');
    console.log('- 7 political/geopolitical categories');
    console.log('- Focus: US, Canada, Latin America politics and security');
    console.log('- Topics: Trade, migration, security, electoral systems, regional integration');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('🎉 Seed completed successfully!');
  })
  .catch(async (e) => {
    console.error('💥 Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
