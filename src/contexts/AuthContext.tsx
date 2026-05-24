import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { supabase, supabaseUrl } from "@/lib/supabaseClient";
import { User, AuthContextType } from "@/types/index";

export type AuthResult = { ok: true } | { ok: false; error: string };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type UserProfileRow = {
  id: string;
  email?: string | null;
  username?: string | null;
  role?: string | null;
  total_xp?: number | null;
  bio?: string | null;
  github_username?: string | null;
  avatar?: string | null;
};

function mapUser(u: SupabaseUser, profile?: UserProfileRow | null): User {
  const md = u.user_metadata || {};

  // IMPORTANT: do not trust client-editable user_metadata for admin role.
  // Prefer the DB role (or app_metadata in the future).
  const dbRole = profile?.role;
  const role: "user" | "admin" = dbRole === "admin" ? "admin" : "user";

  return {
    id: u.id,
    email: u.email || profile?.email || "",
    username: profile?.username || md.username || u.email?.split("@")[0] || "User",
    role,
    xp: profile?.total_xp ?? md.xp ?? 0,
    badges: md.badges || [],
    bio: profile?.bio ?? md.bio,
    githubUsername: profile?.github_username ?? md.githubUsername,
    avatar: profile?.avatar ?? md.avatar,
    joinedAt: new Date(u.created_at || Date.now()), // Map created_at to joinedAt
  };
}

async function fetchUserProfile(userId: string): Promise<UserProfileRow | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, username, role, total_xp, bio, github_username, avatar")
    .eq("id", userId)
    .maybeSingle();

  if (error) return null;
  return (data as UserProfileRow) ?? null;
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
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (!mounted) return;
        setUser(mapUser(session.user, profile));
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // Fire-and-forget profile fetch; keep loading true until role is known
      (async () => {
        if (!session?.user) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        const profile = await fetchUserProfile(session.user.id);
        setUser(mapUser(session.user, profile));
        setIsLoading(false);
      })();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      console.error("login error:", error);

      const message = error.message.toLowerCase();

      if (
        message.includes("invalid login credentials") ||
        message.includes("invalid credentials") ||
        message.includes("email not confirmed")
      ) {
        return { ok: false, error: "Incorrect email or password." };
      }

      return { ok: false, error: error.message };
    }

    return { ok: true };
  } finally {
  }
};

  const register = async (
  email: string,
  password: string,
  username: string
): Promise<AuthResult> => {
  setIsLoading(true);

  const { data: existingUser, error: existingUserError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingUserError) {
    setIsLoading(false);
    console.error("existing user check error:", existingUserError);
    return { ok: false, error: "Unable to verify email. Please try again." };
  }

  if (existingUser) {
    setIsLoading(false);
    return { ok: false, error: "An account with this email already exists." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username, xp: 0, badges: [] } },
  });

  setIsLoading(false);

  if (error) {
    console.error("register error:", error);

    const message = error.message.toLowerCase();

    if (
      message.includes("already registered") ||
      message.includes("already exists") ||
      message.includes("user already registered")
    ) {
      return { ok: false, error: "An account with this email already exists." };
    }

    return { ok: false, error: error.message };
  }

  console.log("register ok:", { userId: data.user?.id, session: !!data.session });
if (!data.session && !data.user?.identities?.length) {
  return { ok: false, error: "An account with this email already exists." };
}
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
