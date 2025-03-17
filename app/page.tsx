import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Image
        src="/logo.svg"
        alt="YeokdoIn logo"
        width={500}
        height={500}
        priority
      />

      <h1 className="">역도-인</h1>
    </div>
  );
}
