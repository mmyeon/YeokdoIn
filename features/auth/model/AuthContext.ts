"use client";

import { User } from "@supabase/supabase-js";
import { createContext } from "react";

interface AuthContextType {
  // TODO: 프론트애서 필요한 유저 정보만 가져오도록 손상 방지 계층(ACL)추가하기
  user: User | null;
  loading: boolean;
  logIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const initialContext: AuthContextType = {
  user: null,
  loading: true,
  logIn: async () => {},
  signUp: async () => {},
  logOut: async () => {},
};

export const AuthContext = createContext<AuthContextType | undefined>(
  initialContext,
);
