import { ROUTES } from "@/routes";
import Link from "next/link";

const GuestButtons = () => {
  return (
    <Link
      href={ROUTES.AUTH.LOGIN}
      className="flex h-9 items-center rounded-full border border-[var(--yd-line)] bg-[var(--yd-surface)] px-3 text-[12px] font-semibold text-[var(--yd-text)]"
    >
      로그인
    </Link>
  );
};

export default GuestButtons;
