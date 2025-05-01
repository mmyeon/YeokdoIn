import {
  getExercises,
  getUserPersonalRecords,
} from "@/actions/user-settings-actions";
import BackButton from "@/components/BackButton";
import PersonalRecordsList from "@/components/PersonalRecords/PersonalRecordsList";
import RecordAddDialog from "@/components/PersonalRecords/RecordAddDialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

async function PersonalRecords() {
  const records = await getUserPersonalRecords();
  const exercises = (await getExercises()).map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    createdAt: exercise.created_at,
    updatedAt: exercise.updated_at,
  }));

  return (
    <div className="container flex items-center justify-center mx-auto py-8 px-4 h-dvh">
      <Card className="toss-card w-full max-w-md px-4">
        <CardHeader className="text-center mb-2">
          <BackButton />

          <div className="flex justify-between items-center mt-4 mb-2">
            <h1 className="text-2xl font-bold">개인 기록</h1>

            <RecordAddDialog exercises={exercises} />
          </div>
        </CardHeader>

        <CardContent>
          {records.length === 0 ? (
            <>
              <p className="text-gray-500 text-center">
                저장된 개인 기록이 없습니다.
                <br /> 추가 버튼을 클릭해 추가해 주세요!
              </p>
            </>
          ) : (
            <PersonalRecordsList records={records} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PersonalRecords;
