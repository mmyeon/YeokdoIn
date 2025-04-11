import { supabaseClient } from "@/shared/api/supabaseClient";
import { AuthError, isAuthApiError } from "@supabase/supabase-js";

class AuthServiceError extends Error {
  constructor(
    public message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "AuthServiceError";
  }
}

const handleSupabaseError = (error: AuthError | null) => {
  if (isAuthApiError(error)) {
    let userFriendlyMessage = "알 수 없는 오류가 발생했습니다.";

    switch (error.message) {
      case "Invalid login credentials":
        userFriendlyMessage = "이메일 또는 비밀번호가 잘못되었습니다.";
        break;
      case "Email not confirmed":
        userFriendlyMessage = "이메일 인증이 필요합니다.";
        break;
      case "User not found":
        userFriendlyMessage = "가입되지 않은 이메일입니다.";
        break;
      case "Password should be at least 8 characters":
        userFriendlyMessage = "비밀번호는 8자 이상이어야 합니다.";
        break;
      default:
        console.error("Unhandled Supabase error:", error.message);
    }
    throw new AuthServiceError(userFriendlyMessage, error.status);
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
