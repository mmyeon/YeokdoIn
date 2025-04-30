"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

const BackButton = () => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      aria-label="뒤로 가기"
      onClick={() => window.history.back()}
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
};

export default BackButton;
