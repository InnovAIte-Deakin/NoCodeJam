// Re-export database types
export * from './database.types';

// Legacy types (for backward compatibility during migration)
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  xp: number;
  bio?: string;
  githubUsername?: string;
  avatar?: string;
  badges: Badge[];
  joinedAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt: Date;
}

// Legacy Challenge interface - use database.types.Challenge for new code
/** @deprecated Use Challenge from database.types instead */
export interface LegacyChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  xpReward: number;
  imageUrl: string;
  requirements: string[];
  createdAt: Date;
  createdBy: string;
}

export interface Submission {
  id: string;
  challengeId: string;
  userId: string;
  solutionUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export interface AuthResult {
  ok: boolean;
  error?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string, username: string) => Promise<AuthResult>;
  logout: () => void;
  isLoading: boolean;
  setUser: (user: User | null) => void;
}