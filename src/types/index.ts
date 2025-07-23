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

export interface Challenge {
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

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}