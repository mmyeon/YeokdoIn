"use client";

import { AuthProvider } from "@/features/auth/model/AuthProvider";
import { DevTools } from "jotai-devtools";
import { Toaster } from "sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { ReactNode } from "react";
import Providers from "./Providers";

//  TODO: 인증을 auth provider가 아니라 서버에서 처리하도록 개선
const ClientProvider = ({ children }: { children: ReactNode }) => {
  return (
    <Providers>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>

      {process.env.NODE_ENV === "development" && <DevTools />}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </Providers>
  );
};

export default ClientProvider;
