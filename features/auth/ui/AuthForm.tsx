"use client";

import { ChangeEvent, useState } from "react";
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
import { AuthFn } from "../model/AuthContext";
import FormAlert from "@/components/FormAlert";
import HelpAlert from "@/components/HelpAlert";
import { validateEmail, validatePassword } from "@/shared/form/validations";
import useAuth from "../model/useAuth";
import { toast } from "sonner";

interface AuthFormProps {
  mode: "login" | "signup";
  handleClick: AuthFn;
}

const AuthForm = ({ mode, handleClick }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { authError } = useAuth();

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    if (newEmail.length === 0) {
      setEmailError("");
    } else {
      setEmailError(validateEmail(newEmail));
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (newPassword.length < 8) {
      setPasswordError("");
    } else {
      setPasswordError(validatePassword(newPassword));
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen p-4 mx-auto">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-2xl font-bold text-center">
          {AUTH_FORM_INFO[mode].title}
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
                await handleClick(email, password, (errorMessage: string) =>
                  toast.error(errorMessage),
                );
              }}
            >
              {AUTH_FORM_INFO[mode].buttonText}
            </Button>

            <p>
              {AUTH_FORM_INFO[mode].help}{" "}
              <Link
                href={AUTH_FORM_INFO[mode].linkUrl}
                className="text-blue-500 font-bold hover:underline"
              >
                {AUTH_FORM_INFO[mode].linkText}
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthForm;
