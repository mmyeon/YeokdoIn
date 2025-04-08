import { supabaseClient } from "@/shared/api/supabaseClient";

export const getSession = async () => {
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
};

export const logIn = async (email: string, password: string) => {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  return data.user;
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  return data.user;
};

export const logOut = async () => {
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw new Error(error.message);
};
