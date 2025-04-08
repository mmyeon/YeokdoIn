import { useEffect, useState } from "react";
import { getSession, logIn, logOut, signUp } from "../api/authService";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/routes";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getSession()
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

  const handleLogIn = async (email: string, password: string) => {
    const loggedInUser = await logIn(email, password);
    setUser(loggedInUser);
    router.push(ROUTES.TRAINING.SELECT_LIFT);
  };

  const handleLogOut = async () => {
    await logOut();
    setUser(null);
  };

  const handleSignUp = async (email: string, password: string) => {
    const signedUpUser = await signUp(email, password);
    setUser(signedUpUser);
    router.push(ROUTES.HOME);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logIn: handleLogIn,
        signUp: handleSignUp,
        logOut: handleLogOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
