"use client";

import BackButton from "@/components/BackButton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import AliasList from "@/features/aliases/ui/AliasList";

function MovementAliasesPage() {
  return (
    <div className="container flex items-center justify-center mx-auto py-8 px-4 min-h-dvh">
      <Card className="toss-card w-full max-w-md px-4">
        <CardHeader className="text-center mb-2">
          <BackButton />
          <div className="flex justify-between items-center mt-4 mb-2">
            <h1 className="text-2xl font-bold">동작 별명</h1>
          </div>
          <p className="text-sm text-muted-foreground text-left">
            프로그램에서 사용하는 표기를 운동 종목과 매핑합니다.
          </p>
        </CardHeader>

        <CardContent>
          <AliasList />
        </CardContent>
      </Card>
    </div>
  );
}

export default MovementAliasesPage;
