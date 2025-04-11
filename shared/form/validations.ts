import { emailSchema, passwordSchema } from "./schemas";

export const validateEmail = (email: string): string => {
  const { success, error } = emailSchema.safeParse(email);
  return success ? "" : error.issues[0].message;
};

export const validatePassword = (password: string): string => {
  const { success, error } = passwordSchema.safeParse(password);
  return success ? "" : error.issues[0].message;
};
