"use client";

import { useSearchParams } from "next/navigation";

const ErrorDisplay = () => {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (error) {
    const errorMessage =
      error === "missing_code"
        ? "Authentication code is missing."
        : "OAuth authentication failed.";

    return (
      <div className="mb-4 text-center">
        <h1 className="text-xl font-semibold text-destructive">Login Error</h1>
        <p className="text-sm text-muted-foreground">
          {`${errorMessage} Please try again.`}
        </p>
      </div>
    );
  }

  return null;
};

export default ErrorDisplay;
