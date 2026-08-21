export interface Exercise {
  id: string;
  name: string;
  slug: string;
  category: string;
  force: string | null;
  level: 'beginner' | 'intermediate' | 'expert' | string;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  imageUrls: string[];
  isCustom: boolean;
  userId?: string | null;
}

export interface ExerciseQueryFilters {
  search?: string;
  category?: string;
  level?: string;
  equipment?: string;
  muscle?: string;
  isCustom?: boolean;
}

export interface ExerciseListResponse {
  items: Exercise[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
