import { useEffect, useState } from "react";
import { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { AuthContext } from "./AuthContext";
import authService from "../api/authService";
import { SocialAuthProvider } from "@/types/auth";
import { ROUTES } from "@/routes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const handleUserChange = (user: User | null) => {
    setUser(user);
  };

  const handleAuthStateChange = (
    event: AuthChangeEvent,
    session: Session | null,
  ) => {
    switch (event) {
      case "SIGNED_IN":
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
      toast.error("소셜 로그인 중 오류가 발생했습니다.");
    }
  };

  const signOut = async () => {
    try {
      await authService.SignOut();
      router.push(ROUTES.HOME);
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("로그아웃 중 오류가 발생했습니다.");
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
