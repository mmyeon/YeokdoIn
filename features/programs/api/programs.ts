'use server';

import { z } from 'zod';

import { supabaseServerClient } from '@/features/auth/supabase/ServerClient';
import { programSchema } from '@/features/notation/model/schemas';
import type { Program } from '@/features/notation/model/types';
import { sanitizeItems } from '@/features/programs/model/sanitize-items';
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

const saveTextProgramSchema = z.object({
  sourceText: z.string(),
  lines: z.array(z.string()),
  title: z.string().nullable().optional(),
});

export type SaveTextProgramInput = z.infer<typeof saveTextProgramSchema>;

/**
 * 붙여넣기로 확정한 항목을 텍스트 그대로 저장한다.
 * 내용을 해석하거나 구조화하지 않는다 — `parsed_data` 는 항상 `NULL` 이다.
 */
export async function saveTextProgram(
  input: SaveTextProgramInput,
): Promise<ProgramRow> {
  const supabase = await supabaseServerClient();
  const userId = await requireUserId();

  const parsed = saveTextProgramSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error('Program data is invalid.');
  }

  const lines = sanitizeItems(parsed.data.lines);
  if (lines.length === 0) {
    throw new Error('A program needs at least one item.');
  }

  const { data, error } = await supabase
    .from('programs')
    .insert({
      user_id: userId,
      title: parsed.data.title ?? null,
      lines,
      source_text: parsed.data.sourceText,
      parsed_data: null,
    })
    .select('*')
    .single();

  if (error) handleDatabaseError(error);
  if (!data) throw new Error('Failed to save program.');
  return data as ProgramRow;
}

const updateTextProgramSchema = z.object({
  id: z.number().int(),
  lines: z.array(z.string()),
  title: z.string().nullable().optional(),
});

export type UpdateTextProgramInput = z.infer<typeof updateTextProgramSchema>;

/**
 * 저장된 텍스트 프로그램을 갱신한다. 새 행을 만들지 않는다.
 *
 * `source_text` 는 갱신 대상이 아니다 — 정의가 「사용자 편집 이전」이므로
 * 사후 수정으로 덮으면 편집 비율의 측정 근거가 사라진다.
 */
export async function updateTextProgram(
  input: UpdateTextProgramInput,
): Promise<ProgramRow> {
  const supabase = await supabaseServerClient();
  const userId = await requireUserId();

  const parsed = updateTextProgramSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error('Program data is invalid.');
  }

  const lines = sanitizeItems(parsed.data.lines);
  if (lines.length === 0) {
    throw new Error('A program needs at least one item.');
  }

  const existing = await getProgram(parsed.data.id);
  if (!existing) throw new Error('Program not found.');
  if (existing.lines === null) {
    throw new Error('This program cannot be edited as text.');
  }

  const { data, error } = await supabase
    .from('programs')
    .update({ lines, title: parsed.data.title ?? existing.title })
    .eq('id', parsed.data.id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) handleDatabaseError(error);
  if (!data) throw new Error('Failed to update program.');
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
