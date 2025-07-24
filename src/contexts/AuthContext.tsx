import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType, Badge } from '@/types';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing Supabase session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch user profile from users table
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile && !error) {
          setUser({
            id: profile.id,
            email: profile.email,
            username: profile.username,
            role: profile.role,
            xp: profile.total_xp,
            bio: profile.bio,
            githubUsername: profile.github_username,
            avatar: profile.avatar,
            badges: [], // Fetch badges separately if needed
            joinedAt: new Date(profile.created_at)
          });
        }
      }
      setIsLoading(false);
    };
    getSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      setIsLoading(false);
      return false;
    }
    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    if (profile && !profileError) {
      setUser({
        id: profile.id,
        email: profile.email,
        username: profile.username,
        role: profile.role,
        xp: profile.total_xp,
        bio: profile.bio,
        githubUsername: profile.github_username,
        avatar: profile.avatar,
        badges: [],
        joinedAt: new Date(profile.created_at)
      });
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const register = async (email: string, password: string, username: string): Promise<boolean> => {
    setIsLoading(true);
    // Sign up with Supabase Auth, pass username as user_metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });
    if (error || !data.user) {
      console.error('SignUp error:', error);
      setIsLoading(false);
      return false;
    }
    // Immediately insert user profile into users table
    const { error: insertError } = await supabase.from('users').insert([
      {
        id: data.user.id,
        email,
        username,
        role: 'user',
        total_xp: 0
      }
    ]);
    if (insertError) {
      console.error('Insert error:', insertError);
      setIsLoading(false);
      return false;
    }
    setUser({
      id: data.user.id,
      email,
      username,
      role: 'user',
      xp: 0,
      badges: [],
      joinedAt: new Date()
    });
    setIsLoading(false);
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, setUser }}>
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