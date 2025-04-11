"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input/input";
import { Label } from "../../../components/ui/input/label";
import { Button } from "../../../components/ui/button";
import { AUTH_FORM_INFO } from "../constants";
import Link from "next/link";
import FormAlert from "@/components/FormAlert";
import HelpAlert from "@/components/HelpAlert";
import { toast } from "sonner";
import useAuth from "../model/useAuth";
import { useAuthForm } from "../hooks/useAuthForm";

const LoginForm = () => {
  const { handleLogin } = useAuth();
  const {
    email,
    password,
    emailError,
    passwordError,
    handleEmailChange,
    handlePasswordChange,
  } = useAuthForm();
  const [authError, setAuthError] = useState("");

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen p-4 mx-auto">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-2xl font-bold text-center">
          {AUTH_FORM_INFO["login"].title}
        </CardHeader>

        <CardContent>
          <div className="mb-4">
            <Label htmlFor="email" className="mb-1">
              이메일
            </Label>

            <Input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => handleEmailChange(e)}
            />

            {!email && <HelpAlert message="이메일을 입력해 주세요." />}
            {emailError && <FormAlert errorMessage={emailError} />}
          </div>

          <Label htmlFor="password" className="mb-1">
            비밀번호
          </Label>

          <Input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => handlePasswordChange(e)}
          />

          {password.length < 8 && (
            <HelpAlert message="문자, 숫자, 특수문자 포함, 8자 이상 입력해 주세요." />
          )}
          {password.length >= 8 && passwordError && (
            <FormAlert errorMessage={passwordError} />
          )}
        </CardContent>

        <CardFooter>
          <div className="flex flex-col items-center w-full gap-4">
            <Button
              className="w-full"
              disabled={
                !email ||
                !password ||
                !!emailError ||
                !!passwordError ||
                !!authError
              }
              onClick={async () => {
                try {
                  await handleLogin(email, password);
                } catch (error) {
                  console.error("Error during authentication:", error);
                  if (error instanceof Error) {
                    setAuthError(error.message);
                    toast.error(error.message);
                  } else {
                    toast.error("알 수 없는 오류가 발생했습니다.");
                  }
                }
              }}
            >
              {AUTH_FORM_INFO["login"].buttonText}
            </Button>

            <p>
              {AUTH_FORM_INFO["login"].help}{" "}
              <Link
                href={AUTH_FORM_INFO["login"].linkUrl}
                className="text-blue-500 font-bold hover:underline"
              >
                {AUTH_FORM_INFO["login"].linkText}
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginForm;
