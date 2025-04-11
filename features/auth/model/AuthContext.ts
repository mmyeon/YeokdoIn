"use client";

import { User } from "@supabase/supabase-js";
import { createContext } from "react";

export type AuthFn = (email: string, password: string) => Promise<void>;

interface AuthContextType {
  // TODO: 프론트애서 필요한 유저 정보만 가져오도록 손상 방지 계층(ACL)추가하기
  user: User | null;
  loading: boolean;
  handleLogin: AuthFn;
  handleSignup: AuthFn;
  handleLogout: () => Promise<void>;
}

const initialContext: AuthContextType = {
  user: null,
  loading: true,
  handleLogin: async () => {},
  handleSignup: async () => {},
  handleLogout: async () => {},
};

export const AuthContext = createContext<AuthContextType | undefined>(
  initialContext,
);
