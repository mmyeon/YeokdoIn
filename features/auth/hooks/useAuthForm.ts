import { validateEmail, validatePassword } from "@/shared/form/validations";
import { ChangeEvent, useState } from "react";

export const useAuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    if (newEmail.length === 0) {
      setEmailError("");
    } else {
      setEmailError(validateEmail(newEmail));
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (newPassword.length < 8) {
      setPasswordError("");
    } else {
      setPasswordError(validatePassword(newPassword));
    }
  };

  return {
    email,
    password,
    emailError,
    passwordError,
    handleEmailChange,
    handlePasswordChange,
  };
};
