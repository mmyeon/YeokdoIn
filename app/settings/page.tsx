"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pill } from "@/components/ui/pill";
import useAuth from "@/features/auth/model/useAuth";
import { useBarbellWeight } from "@/hooks/useBarbellWeight";
import { ROUTES } from "@/routes";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

type SettingsRow = {
  label: string;
  detail?: string;
  href?: string;
  onSelect?: () => void;
  danger?: boolean;
  chevron?: boolean;
};

type SettingsSection = {
  title: string;
  rows: ReadonlyArray<SettingsRow>;
};

const Settings = () => {
  const { user, signOut } = useAuth();
  const { data: barbellWeight } = useBarbellWeight();

  const sections: ReadonlyArray<SettingsSection> = [
    {
      title: "훈련",
      rows: [
        { label: "PR 관리", href: ROUTES.SETTINGS.PERSONAL_RECORD },
        {
          label: "바 무게 설정",
          href: ROUTES.SETTINGS.BARBELL_WEIGHT,
          detail: barbellWeight ? `${barbellWeight} kg` : undefined,
        },
        // TODO: 단위 설정 페이지 구현 후 복원 (wireframe #13)
        // { label: "단위", detail: "kg" },
      ],
    },
    {
      title: "계정",
      rows: [
        // TODO: 데이터 내보내기 기능 구현 후 복원 (wireframe #13)
        // { label: "데이터 내보내기" },
        { label: "로그아웃", onSelect: signOut, danger: true, chevron: false },
      ],
    },
  ];

  return (
    <main className="flex flex-col gap-4 max-w-md mx-auto pb-24 pt-2 px-0">
      <div className="px-5 pt-2 pb-2.5">
        <h1 className="text-h1">설정</h1>
      </div>

      <section className="px-4">
        <div className="flex h-[76px] items-center gap-3 rounded-md border border-yd-line px-3.5">
          <Avatar className="size-12">
            <AvatarImage
              src={user?.user_metadata?.profile ?? "https://github.com/shadcn.png"}
              alt="avatar"
            />
            <AvatarFallback>
              {user?.user_metadata?.name?.slice(0, 1) ?? "?"}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-start gap-0.5 min-w-0">
            <span className="text-[15px] font-bold truncate">
              {user?.user_metadata?.email ??
                user?.user_metadata?.name ??
                "yeokdoer@kr"}
            </span>
            <Pill size="sm" tone="primary" variant="outlined">
              무료
            </Pill>
          </div>
        </div>
      </section>

      {sections.map((section) => (
        <section key={section.title} className="flex flex-col gap-1.5 px-4">
          <h2 className="text-caption uppercase tracking-[0.08em] text-yd-text-muted pl-1">
            {section.title}
          </h2>

          <ul className="flex flex-col gap-1.5">
            {section.rows.map((row) => (
              <li key={row.label}>
                <SettingsRowItem row={row} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
};

interface SettingsRowItemProps {
  row: SettingsRow;
}

function SettingsRowItem({ row }: SettingsRowItemProps) {
  const showChevron = row.chevron ?? Boolean(row.href);

  const content = (
    <div className="flex h-[54px] items-center justify-between rounded-md border border-yd-line px-3.5">
      <span
        className={`text-[14px] font-semibold ${row.danger ? "text-yd-error" : "text-yd-text"}`}
      >
        {row.label}
      </span>
      <div className="flex items-center gap-1.5 text-yd-text-muted">
        {row.detail && <span className="text-[12px]">{row.detail}</span>}
        {showChevron && <ChevronRight className="size-3.5" aria-hidden />}
      </div>
    </div>
  );

  if (row.href) {
    return (
      <Link href={row.href} className="block transition-colors hover:bg-yd-elevated rounded-md">
        {content}
      </Link>
    );
  }

  if (row.onSelect) {
    return (
      <button
        type="button"
        onClick={row.onSelect}
        className="w-full text-left transition-colors hover:bg-yd-elevated rounded-md"
      >
        {content}
      </button>
    );
  }

  return <div aria-disabled className="opacity-80">{content}</div>;
}

export default Settings;
