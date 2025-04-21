import { InfoIcon } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

const HelpAlert = ({ message }: { message: string }) => {
  return (
    <Alert className="mt-2 rounded-xl">
      <InfoIcon className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

export default HelpAlert;
