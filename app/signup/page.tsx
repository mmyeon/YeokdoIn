import useAuth from "@/features/auth/model/useAuth";
import AuthForm from "@/features/auth/ui/AuthForm";

const SignupPage = () => {
  const { signUp } = useAuth();

  return <AuthForm mode="signup" handleClick={signUp} />;
};

export default SignupPage;
