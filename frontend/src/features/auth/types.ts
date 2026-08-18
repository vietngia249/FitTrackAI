export interface UserProfile {
  id: string;
  userId: string;
  dateOfBirth?: string | null;
  biologicalSex?: string | null;
  height?: number | null;
  currentWeight?: number | null;
  activityLevel?: string | null;
  fitnessGoal?: 'muscle_gain' | 'fat_loss' | 'maintenance' | 'strength' | null;
  targetWeight?: number | null;
  preferredUnits: 'metric' | 'imperial';
  locale: 'en' | 'vi';
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  createdAt: string;
  profile?: UserProfile | null;
}

export interface AuthResponseData {
  user: User;
  accessToken: string;
}
