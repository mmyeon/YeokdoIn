import { Button } from "@/components/ui/button";
import Image from "next/image";

type SocialProvider = "google" | "kakao";

const getProviderDetails = (provider: SocialProvider) => {
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
  loginMode = false,
}: {
  provider: SocialProvider;
  loginMode?: boolean;
}) => {
  const details = getProviderDetails(provider);

  return (
    <Button
      variant="outline"
      className={`justify-start ${details.bgColor} ${details.textColor} ${details.borderColor} ${details.hoverColor}`}
    >
      <div className="w-full flex items-center justify-center gap-2">
        <Image
          src={details.icon}
          alt={`${details.name} 아이콘`}
          width={20}
          height={20}
        />

        <span>
          {loginMode
            ? `${details.name}로 로그인`
            : `${details.name}로 가입하기`}
        </span>
      </div>
    </Button>
  );
};

export default SocialButtons;
