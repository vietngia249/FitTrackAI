import { PrismaClient, Prisma } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma.js';
import {
  ExerciseQueryInput,
  CreateExerciseInput,
  UpdateExerciseInput,
} from './exercises.schemas.js';

export class ExercisesService {
  constructor(private db: PrismaClient = prisma) {}

  /**
   * List exercises with optional filters, search, and user scoping
   */
  async listExercises(query: ExerciseQueryInput, currentUserId?: string) {
    const {
      search,
      category,
      level,
      equipment,
      muscle,
      isCustom,
      limit,
      offset,
    } = query;

    const where: Prisma.ExerciseWhereInput = {
      // Access control: public exercises OR exercises created by current user
      OR: [
        { userId: null },
        ...(currentUserId ? [{ userId: currentUserId }] : []),
      ],
    };

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (category) {
      where.category = {
        equals: category,
        mode: 'insensitive',
      };
    }

    if (level) {
      where.level = level;
    }

    if (equipment) {
      where.equipment = {
        equals: equipment,
        mode: 'insensitive',
      };
    }

    if (muscle) {
      const normalizedMuscle = muscle.toLowerCase();
      where.OR = [
        ...(where.OR || []),
        { primaryMuscles: { has: normalizedMuscle } },
        { secondaryMuscles: { has: normalizedMuscle } },
      ];
    }

    if (typeof isCustom === 'boolean') {
      where.isCustom = isCustom;
      if (isCustom && currentUserId) {
        where.userId = currentUserId;
      }
    }

    const [exercises, total] = await Promise.all([
      this.db.exercise.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { name: 'asc' },
      }),
      this.db.exercise.count({ where }),
    ]);

    return {
      items: exercises,
      total,
      limit,
      offset,
      hasMore: offset + exercises.length < total,
    };
  }

  /**
   * Get exercise by ID or Slug, enforcing public or owner visibility
   */
  async getExerciseById(idOrSlug: string, currentUserId?: string) {
    const exercise = await this.db.exercise.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });

    if (!exercise) {
      return null;
    }

    // If custom exercise, check owner
    if (exercise.isCustom && exercise.userId !== currentUserId) {
      return null;
    }

    return exercise;
  }

  /**
   * Create a new custom exercise scoped to user
   */
  async createCustomExercise(data: CreateExerciseInput, userId: string) {
    const baseSlug = data.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

    return this.db.exercise.create({
      data: {
        name: data.name,
        slug: uniqueSlug,
        category: data.category,
        force: data.force || null,
        level: data.level,
        mechanic: data.mechanic || null,
        equipment: data.equipment || 'body only',
        primaryMuscles: data.primaryMuscles.map((m) => m.toLowerCase()),
        secondaryMuscles: data.secondaryMuscles.map((m) => m.toLowerCase()),
        instructions: data.instructions,
        imageUrls: data.imageUrls || [],
        isCustom: true,
        userId,
      },
    });
  }

  /**
   * Update a custom exercise (user-scoped)
   */
  async updateCustomExercise(
    id: string,
    data: UpdateExerciseInput,
    userId: string
  ) {
    const existing = await this.db.exercise.findUnique({
      where: { id },
    });

    if (!existing) {
      return null;
    }

    if (!existing.isCustom || existing.userId !== userId) {
      throw new Error('FORBIDDEN');
    }

    return this.db.exercise.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.category ? { category: data.category } : {}),
        ...(data.force !== undefined ? { force: data.force } : {}),
        ...(data.level ? { level: data.level } : {}),
        ...(data.mechanic !== undefined ? { mechanic: data.mechanic } : {}),
        ...(data.equipment !== undefined ? { equipment: data.equipment } : {}),
        ...(data.primaryMuscles
          ? { primaryMuscles: data.primaryMuscles.map((m) => m.toLowerCase()) }
          : {}),
        ...(data.secondaryMuscles
          ? { secondaryMuscles: data.secondaryMuscles.map((m) => m.toLowerCase()) }
          : {}),
        ...(data.instructions ? { instructions: data.instructions } : {}),
        ...(data.imageUrls ? { imageUrls: data.imageUrls } : {}),
      },
    });
  }

  /**
   * Delete a custom exercise (user-scoped)
   */
  async deleteCustomExercise(id: string, userId: string) {
    const existing = await this.db.exercise.findUnique({
      where: { id },
    });

    if (!existing) {
      return null;
    }

    if (!existing.isCustom || existing.userId !== userId) {
      throw new Error('FORBIDDEN');
    }

    await this.db.exercise.delete({
      where: { id },
    });

    return true;
  }
}
