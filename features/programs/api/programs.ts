'use server';

import { supabaseServerClient } from '@/features/auth/supabase/ServerClient';
import { handleDatabaseError } from '@/utils/database';
import { buildProgram } from '@/features/programs/model/build-program';
import {
  programInputSchema,
  type ProgramInput,
} from '@/features/programs/model/program-input';
import type { Program } from '@/features/notation/model/types';
import type { Json, Tables } from '@/types_db';

export type ProgramRow = Tables<'programs'>;

async function requireUserId(): Promise<string> {
  const supabase = await supabaseServerClient();
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error('User is not authenticated.');
  return userId;
}

export type { ProgramInput } from '@/features/programs/model/program-input';

/** 입력을 검증하고 종목 이름을 DB 에서 찍어 Program 으로 만든다. 클라이언트의 이름은 믿지 않는다. */
async function buildProgramFromInput(
  input: ProgramInput,
): Promise<{ program: Program; title: string | null }> {
  const supabase = await supabaseServerClient();

  const parsed = programInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error('프로그램 입력이 올바르지 않습니다.');
  }

  const ids = [...new Set(parsed.data.blocks.flatMap((b) => b.exerciseIds))];
  const { data: exercises, error: exercisesError } = await supabase
    .from('exercises')
    .select('id, name')
    .in('id', ids);
  if (exercisesError) handleDatabaseError(exercisesError);

  const built = buildProgram(parsed.data, exercises ?? []);
  if (!built.ok) throw new Error(built.error);
  return { program: built.program, title: parsed.data.title ?? null };
}

/**
 * 구조화 입력을 저장한다.
 * 텍스트 프로그램과 구분되도록 `lines`, `source_text` 는 NULL 이다.
 */
export async function saveProgram(input: ProgramInput): Promise<ProgramRow> {
  const supabase = await supabaseServerClient();
  const userId = await requireUserId();
  const { program, title } = await buildProgramFromInput(input);

  const { data, error } = await supabase
    .from('programs')
    .insert({
      user_id: userId,
      title,
      parsed_data: program as unknown as Json,
      lines: null,
      source_text: null,
    })
    .select('*')
    .single();

  if (error) handleDatabaseError(error);
  if (!data) throw new Error('프로그램을 저장하지 못했습니다.');
  return data as ProgramRow;
}

export type UpdateProgramInput = ProgramInput & { id: number };

/**
 * 저장된 구조화 프로그램을 같은 행에서 갱신한다.
 * 텍스트 프로그램(`lines` 가 NULL 이 아님)은 거부한다.
 * 제목을 보내지 않으면 기존 제목을 유지한다.
 */
export async function updateProgram({
  id,
  ...input
}: UpdateProgramInput): Promise<ProgramRow> {
  const supabase = await supabaseServerClient();
  const userId = await requireUserId();

  if (!Number.isInteger(id)) throw new Error('프로그램 입력이 올바르지 않습니다.');

  const { data: existing, error: existingError } = await supabase
    .from('programs')
    .select('id, title, lines')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();
  if (existingError) handleDatabaseError(existingError);
  if (!existing) throw new Error('프로그램을 찾을 수 없습니다.');
  if (existing.lines !== null) {
    throw new Error('텍스트로 저장된 프로그램은 수정할 수 없습니다.');
  }

  const { program, title } = await buildProgramFromInput(input);

  const { data, error } = await supabase
    .from('programs')
    .update({
      title: title ?? existing.title,
      parsed_data: program as unknown as Json,
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) handleDatabaseError(error);
  if (!data) throw new Error('프로그램을 수정하지 못했습니다.');
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
