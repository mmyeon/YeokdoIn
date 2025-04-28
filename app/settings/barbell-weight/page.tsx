import { getUserDefaultBarbelWeight } from "@/actions/user-settings-actions";
import BarbellSetting from "@/components/BarbellSetting";

async function BarbellSettingPage() {
  const data = await getUserDefaultBarbelWeight();

  return (
    <main className="flex items-center justify-center p-4 h-dvh max-w-sm relative">
      <BarbellSetting barbellWeight={data?.default_barbell_weight ?? null} />
    </main>
  );
}

export default BarbellSettingPage;
