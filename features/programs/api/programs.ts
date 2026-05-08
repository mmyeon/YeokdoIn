'use server';

import { supabaseServerClient } from '@/features/auth/supabase/ServerClient';
import { programSchema } from '@/features/notation/model/schemas';
import type { Program } from '@/features/notation/model/types';
import { handleDatabaseError } from '@/utils/database';
import type { Json, Tables } from '@/types_db';

export type ProgramRow = Tables<'programs'>;

async function requireUserId(): Promise<string> {
  const supabase = await supabaseServerClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('User is not authenticated.');
  return userId;
}

export interface SaveProgramInput {
  parsed: Program;
}

export async function saveProgram(input: SaveProgramInput): Promise<ProgramRow> {
  const supabase = await supabaseServerClient();
  const userId = await requireUserId();

  const parseResult = programSchema.safeParse(input.parsed);
  if (!parseResult.success) {
    throw new Error('Program data is invalid.');
  }

  const { data, error } = await supabase
    .from('programs')
    .insert({
      user_id: userId,
      title: null,
      // Supabase Json type is recursive; Zod-derived Program is structurally compatible but TS can't prove it.
      parsed_data: parseResult.data as unknown as Json,
    })
    .select('*')
    .single();

  if (error) handleDatabaseError(error);
  if (!data) throw new Error('Failed to save program.');
  return data as ProgramRow;
}

export async function listPrograms(): Promise<ProgramRow[]> {
  const supabase = await supabaseServerClient();
  await requireUserId();

  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) handleDatabaseError(error);
  return (data ?? []) as ProgramRow[];
}

export async function getProgram(id: number): Promise<ProgramRow | null> {
  const supabase = await supabaseServerClient();
  await requireUserId();

  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) handleDatabaseError(error);
  return (data as ProgramRow | null) ?? null;
}

export async function deleteProgram(id: number): Promise<void> {
  const supabase = await supabaseServerClient();
  const userId = await requireUserId();

  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) handleDatabaseError(error);
}
