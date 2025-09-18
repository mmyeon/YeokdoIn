"use client";

import { SocialAuthProvider } from "@/types/auth";
import { User } from "@supabase/supabase-js";
import { createContext } from "react";

interface AuthContextType {
  // TODO: 프론트애서 필요한 유저 정보만 가져오도록 손상 방지 계층(ACL)추가하기
  user: User | null;
  signInWithOAuth: (provider: SocialAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
}

const initialContext: AuthContextType = {
  user: null,
  signInWithOAuth: async () => {},
  signOut: async () => {},
};

export const AuthContext = createContext<AuthContextType | undefined>(
  initialContext
);
