
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

        if (!mounted) {
          return;
        }

        if (error) {
          console.error("Session error:", error);

          setSession(null);
          setUser(null);
          setProfile(null);
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
        if (!mounted) {
          return;
        }

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
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail) {
        return {
          error: "Please enter your email address.",
        };
      }

      if (!password) {
        return {
          error: "Please enter your password.",
        };
      }

      try {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

        if (error) {
          console.error("Supabase sign-in error:", {
            message: error.message,
            status: error.status,
            code: error.code,
          });

          const message = error.message.toLowerCase();

          if (message.includes("invalid login credentials")) {
            return {
              error: "Incorrect email or password.",
            };
          }

          if (message.includes("email not confirmed")) {
            return {
              error:
                "Please verify your email before signing in.",
            };
          }

          return {
            error:
              "Unable to sign in. Please check your email and password.",
          };
        }

        if (!data.user || !data.session) {
          return {
            error:
              "Login could not be completed. Please try again.",
          };
        }

        return {
          error: null,
        };
      } catch (error) {
        console.error("Unexpected sign-in error:", error);

        return {
          error:
            "Unable to sign in right now. Please try again.",
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
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = fullName.trim();

      if (!cleanName) {
        return {
          error: "Please enter your full name.",
        };
      }

      if (!cleanEmail) {
        return {
          error: "Please enter your email address.",
        };
      }

      if (password.length < 6) {
        return {
          error: "Password must be at least 6 characters.",
        };
      }

      try {
        const { data, error } =
          await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                full_name: cleanName,
              },
            },
          });

        if (error) {
          console.error("Supabase sign-up error:", {
            message: error.message,
            status: error.status,
            code: error.code,
          });

          const message = error.message.toLowerCase();

          if (message.includes("already registered")) {
            return {
              error:
                "An account with this email already exists. Please sign in.",
            };
          }

          if (message.includes("password")) {
            return {
              error:
                "Please choose a stronger password with at least 6 characters.",
            };
          }

          return {
            error:
              "Unable to create your account. Please try again.",
          };
        }

        if (!data.user) {
          return {
            error:
              "Account could not be created. Please try again.",
          };
        }

        return {
          error: null,
        };
      } catch (error) {
        console.error("Unexpected sign-up error:", error);

        return {
          error:
            "Unable to create your account. Please try again.",
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

        if (error) {
          console.error("Supabase sign-out error:", error);

          return {
            error: error.message,
          };
        }

        return {
          error: null,
        };
      } catch (error) {
        console.error("Unexpected sign-out error:", error);

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

