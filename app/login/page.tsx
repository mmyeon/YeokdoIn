"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import useAuth from "@/features/auth/model/useAuth";
import SocialButtons from "@/features/auth/ui/AuthButtons/SocialButtons";
import ErrorDisplay from "./ErrorDisplay";
import { Suspense } from "react";

const LoginPage = () => {
  const { signInWithOAuth } = useAuth();

  return (
    <div className="container flex items-center justify-center mx-auto p-4 h-dvh">
      <Card className="toss-card w-full max-w-md">
        <CardHeader className="text-center mb-2">
          <h1 className="text-2xl font-bold">로그인</h1>
          <p className="text-sm text-muted-foreground">
            간편하게 로그인하고 역도인을 시작하세요!
          </p>
        </CardHeader>

        <CardContent>
          <Suspense>
            <ErrorDisplay />
          </Suspense>

          <div className="flex flex-col gap-4">
            <SocialButtons provider="google" onClick={signInWithOAuth} />

            <SocialButtons provider="kakao" onClick={signInWithOAuth} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
