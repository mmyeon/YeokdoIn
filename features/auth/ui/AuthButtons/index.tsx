import UserProfile from "./UserProfile";
import GuestButtons from "./GuestButtons";
import useAuth from "../../model/useAuth";

const AuthButtons = () => {
  const { user } = useAuth();

  return (
    <div className="flex justify-end px-5 pt-[6px] pb-1">
      {user ? <UserProfile /> : <GuestButtons />}
    </div>
  );
};

export default AuthButtons;
