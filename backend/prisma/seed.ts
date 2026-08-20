import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface RawExercise {
  id: string;
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
  images: string[];
}

export async function seedExercises(prismaClient: PrismaClient = prisma) {
  console.log('🌱 Starting exercise database seeding...');

  // Locate the exercises dataset
  const possiblePaths = [
    path.resolve(__dirname, '../../references/free-exercise-db/dist/exercises.json'),
    path.resolve(__dirname, '../references/free-exercise-db/dist/exercises.json'),
    path.resolve(process.cwd(), 'references/free-exercise-db/dist/exercises.json'),
    path.resolve(process.cwd(), '../references/free-exercise-db/dist/exercises.json'),
  ];

  let datasetPath: string | null = null;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      datasetPath = p;
      break;
    }
  }

  if (!datasetPath) {
    console.warn('⚠️  Exercise dataset not found in expected reference paths. Skipping exercise seed.');
    return { count: 0 };
  }

  const rawData: RawExercise[] = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
  console.log(`📦 Found ${rawData.length} exercises to process.`);

  const exercises = rawData.map((ex) => {
    // Generate normalized slug
    const normalizedSlug = ex.id.toLowerCase().replace(/[^a-z0-9_-]/g, '-');

    return {
      name: ex.name,
      slug: normalizedSlug,
      category: ex.category || 'strength',
      force: ex.force || null,
      level: ex.level || 'beginner',
      mechanic: ex.mechanic || null,
      equipment: ex.equipment || 'body only',
      primaryMuscles: ex.primaryMuscles || [],
      secondaryMuscles: ex.secondaryMuscles || [],
      instructions: ex.instructions || [],
      imageUrls: (ex.images || []).map(
        (img) => `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${img}`
      ),
      isCustom: false,
      userId: null,
    };
  });

  // Deduplicate by slug if any
  const seenSlugs = new Set<string>();
  const uniqueExercises = exercises.filter((ex) => {
    if (seenSlugs.has(ex.slug)) return false;
    seenSlugs.add(ex.slug);
    return true;
  });

  // Idempotent bulk insert / upsert using createMany with skipDuplicates
  const result = await prismaClient.exercise.createMany({
    data: uniqueExercises,
    skipDuplicates: true,
  });

  console.log(`✅ Successfully seeded ${result.count} new exercises (${uniqueExercises.length} total processed).`);
  return { count: result.count, total: uniqueExercises.length };
}

async function main() {
  try {
    await seedExercises(prisma);
  } catch (err) {
    console.error('❌ Error during exercise seeding:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}
