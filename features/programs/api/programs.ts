'use server';

import { supabaseServerClient } from '@/features/auth/supabase/ServerClient';
import { programSchema } from '@/features/notation/model/schemas';
import type { Program } from '@/features/notation/model/types';
import { buildProgramSavePayload } from '@/features/programs/model/save-payload';
import { handleDatabaseError } from '@/utils/database';
import type { Json, Tables } from '@/types_db';

export type ProgramRow = Tables<'programs'>;

async function requireUserId(): Promise<string> {
  const supabase = await supabaseServerClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('사용자가 인증되지 않았습니다.');
  return userId;
}

export interface SaveProgramInput {
  rawNotation: string;
  parsed: Program;
  title?: string | null;
}

export async function saveProgram(input: SaveProgramInput): Promise<ProgramRow> {
  const supabase = await supabaseServerClient();
  const userId = await requireUserId();

  const parseResult = programSchema.safeParse(input.parsed);
  if (!parseResult.success) {
    throw new Error('프로그램 데이터가 올바르지 않습니다.');
  }

  const payload = buildProgramSavePayload({
    userId,
    rawNotation: input.rawNotation,
    parsed: parseResult.data as Program,
    title: input.title,
  });

  const { data, error } = await supabase
    .from('programs')
    .insert({
      user_id: payload.user_id,
      title: payload.title,
      raw_notation: payload.raw_notation,
      parsed_data: payload.parsed_data as unknown as Json,
    })
    .select('*')
    .single();

  if (error) handleDatabaseError(error);
  if (!data) throw new Error('프로그램 저장에 실패했습니다.');
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
