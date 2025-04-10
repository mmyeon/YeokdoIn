import { supabaseClient } from "@/shared/api/supabaseClient";
import { AuthError } from "@supabase/supabase-js";

const handleSupabaseError = (error: AuthError | null) => {
  if (error) {
    console.error("Supabase error:", error.message);
    throw new Error(error.message);
  }
};

const authService = {
  getSession: async () => {
    const { data, error } = await supabaseClient.auth.getSession();
    handleSupabaseError(error);
    return data.session;
  },
  logIn: async (email: string, password: string) => {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    handleSupabaseError(error);
    return data.user;
  },
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
    });
    handleSupabaseError(error);
    return data.user;
  },
  logOut: async () => {
    const { error } = await supabaseClient.auth.signOut();
    handleSupabaseError(error);
  },
};

export default authService;
