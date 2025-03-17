import Image from "next/image";
import Link from "next/link";

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

      <h1 className="">훈련할 종목을 선택해 주세요.</h1>

      <div className="flex flex-col gap-4">
        <Link href={{ pathname: "/pr", query: { selected: "snatch" } }}>
          <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Snatch
          </button>
        </Link>

        <Link href={{ pathname: "/pr", query: { selected: "clean" } }}>
          <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Clean
          </button>
        </Link>

        <Link href={{ pathname: "/pr", query: { selected: "snatch,clean" } }}>
          <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Snatch + Clean
          </button>
        </Link>
      </div>
    </div>
  );
}
