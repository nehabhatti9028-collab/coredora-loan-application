"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;

  signIn: (
    email: string,
    password: string
  ) => Promise<{
    error: string | null;
  }>;

  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{
    error: string | null;
  }>;

  signOut: () => Promise<{
    error: string | null;
  }>;

  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .maybeSingle();

      if (error) {
        console.error("Profile load error:", error);
        setProfile(null);
        return;
      }

      setProfile(data as Profile | null);
    } catch (error) {
      console.error("Unexpected profile error:", error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error("Session error:", error);

          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);

          return;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await loadProfile(currentSession.user.id);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);

        if (mounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!mounted) return;

        setSession(nextSession);
        setUser(nextSession?.user ?? null);

        if (!nextSession?.user) {
          setProfile(null);
          setLoading(false);
          return;
        }

        setLoading(true);

        void loadProfile(nextSession.user.id).finally(() => {
          if (mounted) {
            setLoading(false);
          }
        });
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!user) {
      return;
    }

    await loadProfile(user.id);
  }, [user, loadProfile]);

  const signIn = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ error: string | null }> => {
      try {
        const { error } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        return {
          error: error ? error.message : null,
        };
      } catch (error) {
        console.error("Sign in error:", error);

        return {
          error: "Unable to sign in. Please try again.",
        };
      }
    },
    []
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string
    ): Promise<{ error: string | null }> => {
      try {
        const {
          data,
          error,
        } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) {
          return {
            error: error.message,
          };
        }

        if (!data.user) {
          return {
            error: "Sign up failed. Please try again.",
          };
        }

        return {
          error: null,
        };
      } catch (error) {
        console.error("Sign up error:", error);

        return {
          error: "Unable to create account. Please try again.",
        };
      }
    },
    []
  );

  const signOut = useCallback(
    async (): Promise<{ error: string | null }> => {
      try {
        const { error } = await supabase.auth.signOut();

        setUser(null);
        setSession(null);
        setProfile(null);

        return {
          error: error ? error.message : null,
        };
      } catch (error) {
        console.error("Sign out error:", error);

        setUser(null);
        setSession(null);
        setProfile(null);

        return {
          error: "Unable to sign out. Please try again.",
        };
      }
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}