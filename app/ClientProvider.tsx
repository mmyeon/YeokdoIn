"use client";

import { AuthProvider } from "@/features/auth/model/AuthProvider";
import { usePathname } from "next/navigation";
import { DevTools } from "jotai-devtools";
import { Toaster } from "sonner";

import AuthButtons from "@/features/auth/ui/AuthButtons";
import { ReactNode } from "react";

//  TODO: 인증을 auth provider가 아니라 서버에서 처리하도록 개선
const ClientProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const isVisible = !pathname.includes("login");

  return (
    <AuthProvider>
      {isVisible && <AuthButtons />}

      {children}
      <Toaster />
      {process.env.NODE_ENV === "development" && <DevTools />}
    </AuthProvider>
  );
};

export default ClientProvider;
