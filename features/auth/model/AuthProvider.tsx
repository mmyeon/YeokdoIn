import { useEffect, useState } from "react";
import { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { AuthContext } from "./AuthContext";
import authService from "../api/authService";
import { SocialAuthProvider } from "@/types/auth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const handleUserChange = (user: User | null) => {
    setUser(user);
  };

  const handleAuthStateChange = (
    event: AuthChangeEvent,
    session: Session | null,
  ) => {
    switch (event) {
      case "SIGNED_IN":
        console.log("User signed in:", session?.user);
        handleUserChange(session?.user || null);
        break;
      case "SIGNED_OUT":
        handleUserChange(null);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const session = await authService.getSession();
        handleUserChange(session?.user ?? null);
      } catch (error) {
        console.error("Error getting session:", error);
        handleUserChange(null);
      }
    };

    initializeUser();
  }, []);

  useEffect(() => {
    const { data } = authService.onAuthStateChange((event, session) => {
      handleAuthStateChange(event, session);
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const signInWithOAuth = async (provider: SocialAuthProvider) => {
    try {
      await authService.signIn(provider);
    } catch (error) {
      console.error("Error signing in with OAuth:", error);
    }
  };

  const signOut = async () => {
    try {
      await authService.SignOut();
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signInWithOAuth,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
