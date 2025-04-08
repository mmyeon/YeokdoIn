import useAuth from "@/features/auth/model/useAuth";
import AuthForm from "@/features/auth/ui/AuthForm";

const LoginPage = () => {
  const { logIn } = useAuth();

  return <AuthForm mode="login" handleClick={logIn} />;
};

export default LoginPage;
