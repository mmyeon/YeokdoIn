import { notFound } from "next/navigation";

import { listExercises } from "@/features/exercises/api/exercises";
import { buildAliasMap } from "@/features/exercises/model/build-alias-map";
import { getProgram } from "@/features/programs/api/programs";
import { ProgramRunner } from "@/features/program-runner/ui/ProgramRunner";
import { programSchema } from "@/features/notation/model/schemas";
import { getUserPersonalRecords } from "@/actions/personalRecords";

interface ProgramRunnerPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProgramRunnerPage({
  params,
}: ProgramRunnerPageProps) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) notFound();

  const row = await getProgram(id);
  if (!row) notFound();

  const parsed = programSchema.safeParse(row.parsed_data);
  if (!parsed.success) notFound();

  const [exercises, records] = await Promise.all([
    listExercises(),
    getUserPersonalRecords(),
  ]);

  const aliasMap = buildAliasMap(exercises);
  const prMap: Record<number, number> = {};
  for (const r of records) {
    prMap[r.exerciseId] = r.weight;
  }

  return (
    <ProgramRunner program={parsed.data} aliasMap={aliasMap} prMap={prMap} />
  );
}
