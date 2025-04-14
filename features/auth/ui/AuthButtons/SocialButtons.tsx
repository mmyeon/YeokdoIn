"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { SocialAuthProvider } from "@/types/auth";

const getProviderDetails = (provider: SocialAuthProvider) => {
  switch (provider) {
    case "google":
      return {
        name: "Google",
        icon: "/icons/google.svg",
        bgColor: "bg-white",
        textColor: "text-gray-700",
        borderColor: "border border-gray-300",
        hoverColor: "hover:bg-gray-50",
      };
    case "kakao":
      return {
        name: "카카오",
        icon: "/icons/kakao.svg",
        bgColor: "bg-[#FEE500]",
        textColor: "text-black",
        borderColor: "",
        hoverColor: "hover:bg-[#F6DC00]",
      };
  }
};

const SocialButtons = ({
  provider,
  onClick,
}: {
  provider: SocialAuthProvider;
  onClick: (provider: SocialAuthProvider) => void;
}) => {
  const details = getProviderDetails(provider);

  return (
    <Button
      variant="outline"
      className={`justify-start ${details.bgColor} ${details.textColor} ${details.borderColor} ${details.hoverColor}`}
      onClick={() => onClick(provider)}
    >
      <div className="w-full flex items-center justify-center gap-2">
        <Image
          src={details.icon}
          alt={`${details.name} 아이콘`}
          width={20}
          height={20}
        />

        <span>{`${details.name}로 로그인하기`}</span>
      </div>
    </Button>
  );
};

export default SocialButtons;
