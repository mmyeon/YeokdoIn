import { SocialAuthProvider } from "@/types/auth";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { REDIRECT_TO_KEY } from "@/routes";
import { SupabaseBrowserClient } from "../supabase/BrowserClient";

const authService = {
  signIn: async (provider: SocialAuthProvider) => {
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get(REDIRECT_TO_KEY);

    const { error } = await SupabaseBrowserClient().auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
      },
    });

    if (error) throw new Error(error.message);
  },

  SignOut: async () => {
    const { error } = await SupabaseBrowserClient().auth.signOut();
    if (error) throw new Error(error.message);
  },

  getSession: async () => {
    const { data, error } = await SupabaseBrowserClient().auth.getSession();

    if (error) throw new Error(error.message);

    return data.session;
  },
  onAuthStateChange: (
    callback: (event: AuthChangeEvent, session: Session | null) => void,
  ) => {
    return SupabaseBrowserClient().auth.onAuthStateChange(callback);
  },
};

export default authService;
