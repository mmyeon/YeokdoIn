"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";

const ConfirmEmail = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  return (
    <div className="container mx-auto h-screen flex justify-center items-center p-4">
      <Card className="toss-card text-center">
        <CardContent className="">
          <h1 className="text-2xl font-bold">이메일 인증이 필요합니다.</h1>

          <p className="mt-4">{`이메일(${email})에서 인증 메일을 확인해 주세요.`}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfirmEmail;
