import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "../ui/select";
import { useExercises } from "@/hooks/usePersonalRecords";

interface WorkoutSelectProps {
  selectedId?: number;
  onSelect: (id: number) => void;
}

function WorkoutSelect({ selectedId, onSelect }: WorkoutSelectProps) {
  const { data: exercises = [] } = useExercises();

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
        <SelectValue placeholder="선택해 주세요." />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {exercises.map((exercise) => (
            <SelectItem key={exercise.id} value={exercise.name}>
              {exercise.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default WorkoutSelect;
