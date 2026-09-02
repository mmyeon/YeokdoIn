import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "../ui/select";
import { useExercises } from "@/hooks/usePersonalRecords";
import { groupExercisesByCategory } from "@/features/personal-records/model/group-exercises";

interface WorkoutSelectProps {
  selectedId?: number;
  onSelect: (id: number) => void;
}

function WorkoutSelect({ selectedId, onSelect }: WorkoutSelectProps) {
  const { data: exercises = [] } = useExercises();

  // 카탈로그 전체를 제공하되(FR-002) 스크롤 부담을 줄이려 카테고리로 묶는다.
  const groups = groupExercisesByCategory(exercises);

  const selectedName =
    exercises.find((exercise) => exercise.id === selectedId)?.name ?? "";

  return (
    <Select
      value={selectedName}
      onValueChange={(value) => {
        const exercise = exercises.find((exercise) => exercise.name === value);
        if (exercise) onSelect(exercise.id);
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="선택하세요" />
      </SelectTrigger>
      <SelectContent>
        {groups.map((group) => (
          <SelectGroup key={group.label}>
            <SelectLabel>{group.label}</SelectLabel>
            {group.exercises.map((exercise) => (
              <SelectItem key={exercise.id} value={exercise.name}>
                {exercise.name}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}

export default WorkoutSelect;
