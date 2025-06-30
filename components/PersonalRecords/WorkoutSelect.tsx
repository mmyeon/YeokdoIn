import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "../ui/select";
import { useExercises } from "@/hooks/usePersonalRecords";

function WorkoutSelect({ onSelect }: { onSelect: (id: number) => void }) {
  const { data: exercises = [] } = useExercises();

  return (
    <Select
      onValueChange={(value) => {
        const exercise = exercises.find((exercise) => exercise.name === value)!;
        onSelect(exercise.id);
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
