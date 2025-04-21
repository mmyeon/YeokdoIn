import UserProfile from "./UserProfile";
import GuestButtons from "./GuestButtons";
import useAuth from "../../model/useAuth";

const AuthButtons = () => {
  // 서버 정보 가져오기 - 로그인 상태 확인
  const { user } = useAuth();

  return (
    <div className="absolute top-5 right-5 flex justify-end gap-1">
      {user ? <UserProfile /> : <GuestButtons />}
    </div>
  );
};

export default AuthButtons;
