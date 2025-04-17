import { SocialAuthProvider } from "@/types/auth";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { SupabaseBroswerClient } from "../supabase/BrowserClient";

const authService = {
  signIn: async (provider: SocialAuthProvider) => {
    const { error } = await SupabaseBroswerClient().auth.signInWithOAuth({
      provider,
    });

    if (error) throw new Error(error.message);
  },

  SignOut: async () => {
    const { error } = await SupabaseBroswerClient().auth.signOut();
    if (error) throw new Error(error.message);
  },

  getSession: async () => {
    const { data, error } = await SupabaseBroswerClient().auth.getSession();

    if (error) throw new Error(error.message);

    return data.session;
  },
  onAuthStateChange: (
    callback: (event: AuthChangeEvent, session: Session | null) => void,
  ) => {
    return SupabaseBroswerClient().auth.onAuthStateChange(callback);
  },
};

export default authService;
