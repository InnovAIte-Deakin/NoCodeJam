import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { supabase, supabaseUrl } from "@/lib/supabaseClient";
import { User, AuthContextType } from "@/types/index";

export type AuthResult = { ok: true } | { ok: false; error: string };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUser(u: SupabaseUser): User {
  const md = u.user_metadata || {};

  return {
    id: u.id,
    email: u.email || "",
    username: md.username || u.email?.split("@")[0] || "User",
    role: (md.role === 'admin' ? 'admin' : 'user'), // Read from metadata or default to user
    xp: md.xp || 0,
    badges: md.badges || [],
    bio: md.bio,
    githubUsername: md.githubUsername,
    avatar: md.avatar,
    joinedAt: new Date(u.created_at || Date.now()), // Map created_at to joinedAt
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This log is critical: confirms local env is pointing at the correct Supabase project
    // eslint-disable-next-line no-console
    console.log("Supabase URL (runtime):", supabaseUrl);

    let mounted = true;

    const init = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;

      if (error) {
        // eslint-disable-next-line no-console
        console.error("getSession error:", error);
        setUser(null);
        setIsLoading(false);
        return;
      }

      const session: Session | null = data.session;
      setUser(session?.user ? mapUser(session.user) : null);
      setIsLoading(false);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapUser(session.user) : null);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);

    if (error) {
      // eslint-disable-next-line no-console
      console.error("login error:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  };

  const register = async (
    email: string,
    password: string,
    username: string
  ): Promise<AuthResult> => {
    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username, xp: 0, badges: [] } },
    });

    setIsLoading(false);

    if (error) {
      // eslint-disable-next-line no-console
      console.error("register error:", error);
      return { ok: false, error: error.message };
    }

    // If email confirmations are enabled, user may be created but no session exists yet.
    // We treat this as success and let UI instruct user.
    // eslint-disable-next-line no-console
    console.log("register ok:", { userId: data.user?.id, session: !!data.session });

    return { ok: true };
  };

  const logout = () => {
    setIsLoading(true);
    supabase.auth.signOut().then(() => {
      setUser(null);
      setIsLoading(false);
    });
  };

  const value = useMemo<AuthContextType>(
    () => ({ user, isLoading, login, register, logout, setUser }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
