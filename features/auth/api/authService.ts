import { SocialAuthProvider } from "@/types/auth";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { SupabaseBroswerClient } from "../supabase/BrowserClient";
import { QUERY_KEYS } from "@/routes";

const authService = {
  signIn: async (provider: SocialAuthProvider) => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get(QUERY_KEYS.REDIRECT_TO);

    const { error } = await SupabaseBroswerClient().auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
      },
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
