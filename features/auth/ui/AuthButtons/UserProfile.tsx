"use client";

import useAuth from "../../model/useAuth";

const UserProfile = () => {
  const { signOut } = useAuth();

  return (
    <button
      type="button"
      onClick={signOut}
      className="flex h-9 items-center rounded-full border border-[var(--yd-line)] bg-[var(--yd-surface)] px-3 text-[12px] font-semibold text-[var(--yd-text)]"
    >
      로그아웃
    </button>
  );
};

export default UserProfile;
