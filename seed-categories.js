import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCategories() {
  const categories = [
    'Technology',
    'AI & Machine Learning', 
    'News',
    'Opinion',
    'Tutorial'
  ];

  for (const categoryName of categories) {
    await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    });
    console.log(`Created/Updated category: ${categoryName}`);
  }
  
  console.log('\nCategories seeded successfully!');
  await prisma.$disconnect();
}

seedCategories().catch(console.error);
