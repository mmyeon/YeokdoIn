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
// import FormAlert from "@/components/FormAlert";
import { AUTH_FORM_INFO } from "../constants";
import Link from "next/link";
import { AuthFn } from "../model/AuthContext";

interface AuthFormProps {
  mode: "login" | "signup";
  handleClick: AuthFn;
}

const AuthForm = ({ mode, handleClick }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [emailError, setEmailError] = useState("");
  // const [passwordError, setPasswordError] = useState("");

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
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* {emailError && <FormAlert errorMessage={emailError} />} */}
          </div>

          <Label htmlFor="password" className="mb-1">
            비밀번호
          </Label>

          <Input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* {passwordError && <FormAlert errorMessage={passwordError} />} */}
        </CardContent>

        <CardFooter>
          <div className="flex flex-col items-center w-full gap-4">
            <Button
              className="w-full"
              disabled={!email || !password}
              onClick={async () => {
                await handleClick(email, password);
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
