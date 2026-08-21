import { Exercise, ExerciseQueryFilters, ExerciseListResponse } from './exerciseTypes';

const API_BASE = '/api/v1/exercises';

export const CURATED_FALLBACK_EXERCISES: Exercise[] = [
  {
    id: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    slug: 'barbell-bench-press',
    category: 'strength',
    force: 'push',
    level: 'intermediate',
    mechanic: 'compound',
    equipment: 'barbell',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['shoulders', 'triceps'],
    instructions: [
      'Lie back on a flat bench. Use a medium grip (create a 90-degree angle at the middle of the movement).',
      'Lift the bar from the rack and hold it straight over you with your arms locked.',
      'Breathe in and come down slowly until the bar touches your middle chest.',
      'After a brief pause, push the bar back to the starting position as you breathe out.',
    ],
    imageUrls: ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80'],
    isCustom: false,
    userId: null,
  },
  {
    id: 'bodyweight-squat',
    name: 'Bodyweight Squat',
    slug: 'bodyweight-squat',
    category: 'strength',
    force: 'push',
    level: 'beginner',
    mechanic: 'compound',
    equipment: 'body only',
    primaryMuscles: ['quadriceps'],
    secondaryMuscles: ['glutes', 'hamstrings', 'calves'],
    instructions: [
      'Stand with your feet shoulder-width apart, chest upright, and core braced.',
      'Begin the movement by flexing your knees and hips, sitting back with your hips.',
      'Continue down until your thighs are parallel to the floor.',
      'Drive through your heels to return to the standing position.',
    ],
    imageUrls: ['https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80'],
    isCustom: false,
    userId: null,
  },
  {
    id: 'standard-push-up',
    name: 'Standard Push-Up',
    slug: 'standard-push-up',
    category: 'strength',
    force: 'push',
    level: 'beginner',
    mechanic: 'compound',
    equipment: 'body only',
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'shoulders', 'abdominals'],
    instructions: [
      'Place hands on the ground shoulder-width apart, legs straight behind you.',
      'Lower your torso until your chest nearly touches the floor.',
      'Ensure your elbows stay at roughly 45 degrees from your torso.',
      'Push firmly back up into the plank starting position.',
    ],
    imageUrls: ['https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop&q=80'],
    isCustom: false,
    userId: null,
  },
  {
    id: 'dumbbell-bicep-curl',
    name: 'Dumbbell Bicep Curl',
    slug: 'dumbbell-bicep-curl',
    category: 'strength',
    force: 'pull',
    level: 'beginner',
    mechanic: 'isolation',
    equipment: 'dumbbell',
    primaryMuscles: ['biceps'],
    secondaryMuscles: ['forearms'],
    instructions: [
      'Stand upright holding a dumbbell in each hand at arm\'s length.',
      'Keep elbows close to your torso and palms facing forward.',
      'Curl the weights upward while contracting your biceps.',
      'Lower dumbbells back to starting position in a controlled motion.',
    ],
    imageUrls: ['https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80'],
    isCustom: false,
    userId: null,
  },
  {
    id: 'barbell-deadlift',
    name: 'Conventional Barbell Deadlift',
    slug: 'barbell-deadlift',
    category: 'strength',
    force: 'pull',
    level: 'intermediate',
    mechanic: 'compound',
    equipment: 'barbell',
    primaryMuscles: ['lower back', 'hamstrings'],
    secondaryMuscles: ['glutes', 'forearms', 'trapezius', 'quadriceps'],
    instructions: [
      'Stand with mid-foot under the barbell. Feet hip-width apart.',
      'Bend over and grip the barbell with hands just outside your legs.',
      'Bend your knees until your shins touch the bar.',
      'Lift your chest and straighten your lower back.',
      'Take a deep breath and stand up with the weight, keeping bar close to your body.',
    ],
    imageUrls: ['https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80'],
    isCustom: false,
    userId: null,
  },
  {
    id: 'pull-up',
    name: 'Pull-Up',
    slug: 'pull-up',
    category: 'strength',
    force: 'pull',
    level: 'intermediate',
    mechanic: 'compound',
    equipment: 'body only',
    primaryMuscles: ['lats'],
    secondaryMuscles: ['biceps', 'rhomboids', 'middle back'],
    instructions: [
      'Grip the pull-up bar with palms facing away from you, wider than shoulder-width.',
      'Pull your chest up toward the bar by pulling your elbows down toward your hips.',
      'Continue until your chin clears the bar.',
      'Lower yourself back down with full control until arms are fully extended.',
    ],
    imageUrls: ['https://images.unsplash.com/photo-1598971457999-ca8ef7d4d444?w=600&auto=format&fit=crop&q=80'],
    isCustom: false,
    userId: null,
  },
  {
    id: 'dumbbell-shoulder-press',
    name: 'Dumbbell Shoulder Press',
    slug: 'dumbbell-shoulder-press',
    category: 'strength',
    force: 'push',
    level: 'intermediate',
    mechanic: 'compound',
    equipment: 'dumbbell',
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['triceps', 'upper chest'],
    instructions: [
      'Sit on an upright bench holding dumbbells at shoulder height with palms forward.',
      'Press the dumbbells upward until your arms are extended overhead.',
      'Pause at the peak for a moment, then lower dumbbells smoothly to shoulder height.',
    ],
    imageUrls: ['https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=600&auto=format&fit=crop&q=80'],
    isCustom: false,
    userId: null,
  },
  {
    id: 'walking-lunges',
    name: 'Walking Lunges',
    slug: 'walking-lunges',
    category: 'strength',
    force: 'push',
    level: 'beginner',
    mechanic: 'compound',
    equipment: 'body only',
    primaryMuscles: ['quadriceps'],
    secondaryMuscles: ['glutes', 'hamstrings', 'calves'],
    instructions: [
      'Step forward with your right leg, flexing knees to drop hips.',
      'Descend until rear knee nearly touches the ground.',
      'Drive through front heel and step forward with the left leg into the next lunge.',
    ],
    imageUrls: ['https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&auto=format&fit=crop&q=80'],
    isCustom: false,
    userId: null,
  },
];

export async function fetchExercises(
  filters: ExerciseQueryFilters = {},
  token?: string | null,
  limit = 40,
  offset = 0
): Promise<ExerciseListResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.category && filters.category !== 'all') params.set('category', filters.category);
  if (filters.level && filters.level !== 'all') params.set('level', filters.level);
  if (filters.equipment && filters.equipment !== 'all') params.set('equipment', filters.equipment);
  if (filters.muscle && filters.muscle !== 'all') params.set('muscle', filters.muscle);
  if (filters.isCustom !== undefined) params.set('isCustom', String(filters.isCustom));
  params.set('limit', String(limit));
  params.set('offset', String(offset));

  try {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}?${params.toString()}`, {
      headers,
      credentials: 'include',
    });

    if (response.ok) {
      const data: ExerciseListResponse = await response.json();
      if (data.items && data.items.length > 0) {
        return data;
      }
    }
  } catch {
    // Network or server error -> use client fallback
  }

  // Fallback filtering
  let filtered = [...CURATED_FALLBACK_EXERCISES];
  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.primaryMuscles.some((m) => m.toLowerCase().includes(q))
    );
  }
  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter((e) => e.category.toLowerCase() === filters.category?.toLowerCase());
  }
  if (filters.level && filters.level !== 'all') {
    filtered = filtered.filter((e) => e.level.toLowerCase() === filters.level?.toLowerCase());
  }
  if (filters.equipment && filters.equipment !== 'all') {
    filtered = filtered.filter((e) => e.equipment?.toLowerCase() === filters.equipment?.toLowerCase());
  }
  if (filters.muscle && filters.muscle !== 'all') {
    const m = filters.muscle.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.primaryMuscles.some((pm) => pm.toLowerCase() === m) ||
        e.secondaryMuscles.some((sm) => sm.toLowerCase() === m)
    );
  }

  return {
    items: filtered.slice(offset, offset + limit),
    total: filtered.length,
    limit,
    offset,
    hasMore: offset + limit < filtered.length,
  };
}

export async function createCustomExercise(
  data: Partial<Exercise>,
  token: string
): Promise<Exercise> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to create exercise');
  }

  return response.json();
}
