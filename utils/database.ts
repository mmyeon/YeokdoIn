import { PostgrestError } from "@supabase/supabase-js";

export function handleDatabaseError(error: PostgrestError | null): never {
  console.error(error);
  throw new Error(error?.message);
}
