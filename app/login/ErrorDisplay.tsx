"use client";

import { useSearchParams } from "next/navigation";

const ErrorDisplay = () => {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (error) {
    const errorMessage =
      error === "missing_code"
        ? "인증 코드가 없습니다."
        : "OAuth 인증에 실패했습니다.";

    return (
      <div className="mb-4 text-center">
        <h1 className="text-xl font-semibold text-destructive">로그인 오류</h1>
        <p className="text-sm text-muted-foreground">
          {`${errorMessage} 다시 시도해 주세요.`}
        </p>
      </div>
    );
  }

  return null;
};

export default ErrorDisplay;
