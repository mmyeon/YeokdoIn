import { useEffect, useState } from "react";
import { isAuthApiError, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/routes";
import { AuthContext } from "./AuthContext";
import authService from "../api/authService";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    authService
      .getSession()
      .then((session) => {
        if (session) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching session:", error);
        setLoading(false);
      });
  }, []);

  const handleLogIn = async (
    email: string,
    password: string,
    onError?: (message: string) => void,
  ) => {
    setLoading(true);
    try {
      const loggedInUser = await authService.logIn(email, password);
      setUser(loggedInUser);
      router.push(ROUTES.TRAINING.SELECT_LIFT);
    } catch (error) {
      console.error("Error logging in:", error, isAuthApiError(error));
      if (onError) {
        if (error instanceof Error) {
          onError(error.message);
        } else {
          onError("알 수 없는 오류가 발생했습니다.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogOut = async () => {
    try {
      await authService.logOut();
    } catch (error) {
      console.error("Error logging out:", error);
      setAuthError(error instanceof Error ? error.message : String(error));
    } finally {
      setUser(null);
      router.push(ROUTES.AUTH.LOGIN);
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const signedUpUser = await authService.signUp(email, password);
      setUser(signedUpUser);
      router.push(ROUTES.HOME);
    } catch (error) {
      console.error("Error signing up:", error);
      setAuthError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logIn: handleLogIn,
        signUp: handleSignUp,
        logOut: handleLogOut,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
