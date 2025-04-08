import UserProfile from "./UserProfile";
import GuestButtons from "./GuestButtons";
import useAuth from "@/features/auth/model/useAuth";

const AuthButtons = () => {
  const { user } = useAuth();

  return (
    <div className="absolute top-5 right-5 flex justify-end gap-1">
      {user ? <UserProfile /> : <GuestButtons />}
    </div>
  );
};

export default AuthButtons;
