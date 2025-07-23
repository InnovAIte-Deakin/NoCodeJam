import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType, Badge } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockBadges: Badge[] = [
  {
    id: '1',
    name: 'First Steps',
    icon: '🎯',
    description: 'Completed your first challenge',
    unlockedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Rising Star',
    icon: '⭐',
    description: 'Earned 500 XP',
    unlockedAt: new Date('2024-01-20')
  }
];

const mockUsers: User[] = [
  {
    id: '1',
    email: 'john@example.com',
    username: 'john_doe',
    role: 'user',
    xp: 1250,
    bio: 'Passionate about no-code development and automation',
    githubUsername: 'johndoe',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    badges: mockBadges,
    joinedAt: new Date('2024-01-10')
  },
  {
    id: '2',
    email: 'admin@nocodejam.com',
    username: 'admin',
    role: 'admin',
    xp: 2500,
    bio: 'NoCodeJam platform administrator',
    githubUsername: 'nocodejam',
    badges: [...mockBadges, {
      id: '3',
      name: 'Platform Creator',
      icon: '👑',
      description: 'Created the NoCodeJam platform',
      unlockedAt: new Date('2024-01-01')
    }],
    joinedAt: new Date('2024-01-01')
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const savedUser = localStorage.getItem('nocodejam_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Convert date strings back to Date objects
      if (parsedUser.joinedAt) {
        parsedUser.joinedAt = new Date(parsedUser.joinedAt);
      }
      if (parsedUser.badges) {
        parsedUser.badges = parsedUser.badges.map((badge: any) => ({
          ...badge,
          unlockedAt: badge.unlockedAt ? new Date(badge.unlockedAt) : undefined
        }));
      }
      setUser(parsedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === 'password') {
      setUser(foundUser);
      localStorage.setItem('nocodejam_user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (email: string, password: string, username: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: Date.now().toString(),
      email,
      username,
      role: 'user',
      xp: 0,
      badges: [],
      joinedAt: new Date()
    };
    
    setUser(newUser);
    localStorage.setItem('nocodejam_user', JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nocodejam_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}