import { supabaseClient } from "@/shared/api/supabaseClient";
import { SocialAuthProvider } from "@/types/auth";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

const authService = {
  signIn: async (provider: SocialAuthProvider) => {
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/training/personal-record`,
      },
    });

    if (error) throw new Error(error.message);
  },

  SignOut: async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw new Error(error.message);
  },

  getSession: async () => {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) throw new Error(error.message);

    return data.session;
  },
  onAuthStateChange: (
    callback: (event: AuthChangeEvent, session: Session | null) => void,
  ) => {
    return supabaseClient.auth.onAuthStateChange(callback);
  },
};

export default authService;
