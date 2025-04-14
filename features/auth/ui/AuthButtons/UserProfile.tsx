"use client";

import { Button } from "@/components/ui/button";
import useAuth from "../../model/useAuth";

const UserProfile = () => {
  const { signOut } = useAuth();

  return (
    /* TODO: 프로필 드랍다운 추가 - 로그아웃, 설정 (아이콘 - 텍스트)  */
    <Button className="ml-2 text-sm font-medium rounded-2xl" onClick={signOut}>
      로그아웃
    </Button>
  );
};

export default UserProfile;
