"use client";

import Link from "next/link";
import Image from "next/image";
import "jotai-devtools/styles.css";
import { ROUTES } from "@/routes";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 max-w-md h-dvh">
      <h1 className="text-2xl font-bold">YeokdoIn</h1>

      <Image
        src="/logo.svg"
        alt="YeokdoIn logo"
        width={200}
        height={200}
        className="sm:w-[300px] sm:h-[300px]"
        priority
      />

      <p className="text-center">역도 프로그램 중량 계산은 제게 맡기세요!</p>

      <Button
        className="w-full h-12 rounded-xl text-base font-semibold bg-primary"
        asChild
      >
        <Link href={ROUTES.TRAINING.SELECT_LIFT}>시작하기</Link>
      </Button>
    </div>
  );
}
