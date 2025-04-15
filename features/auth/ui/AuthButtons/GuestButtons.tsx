import { Button } from "@/components/ui/button";
import { ROUTES } from "@/routes";
import Link from "next/link";

const GuestButtons = () => {
  return (
    <>
      <Button className="text-sm font-medium rounded-2xl" asChild>
        <Link href={ROUTES.AUTH.LOGIN}>로그인</Link>
      </Button>
    </>
  );
};

export default GuestButtons;
