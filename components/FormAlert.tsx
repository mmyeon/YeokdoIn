import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";

const FormAlert = ({ errorMessage }: { errorMessage: string }) => {
  return (
    <Alert variant="destructive" className="mt-2 rounded-xl">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  );
};

export default FormAlert;
