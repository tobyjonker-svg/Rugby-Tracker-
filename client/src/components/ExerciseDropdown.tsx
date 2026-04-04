import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";

interface ExerciseDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  exerciseHistory: string[];
}

export function ExerciseDropdown({
  value,
  onChange,
  placeholder = "Exercise name",
  exerciseHistory,
}: ExerciseDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredExercises, setFilteredExercises] = useState<string[]>([]);

  useEffect(() => {
    if (value.length > 0) {
      const filtered = exerciseHistory.filter((ex) =>
        ex.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredExercises(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredExercises(exerciseHistory);
      setIsOpen(false);
    }
  }, [value, exerciseHistory]);

  const handleSelect = (exercise: string) => {
    onChange(exercise);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (exerciseHistory.length > 0) {
              setIsOpen(true);
            }
          }}
          className="bg-input border-border text-foreground flex-1"
        />
        {exerciseHistory.length > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsOpen(!isOpen)}
            className="text-neon-cyan hover:bg-neon-cyan/10"
          >
            <ChevronDown size={18} />
          </Button>
        )}
      </div>

      {isOpen && filteredExercises.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-neon-cyan rounded shadow-lg z-50 max-h-48 overflow-y-auto">
          {filteredExercises.map((exercise, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(exercise)}
              className="w-full text-left px-3 py-2 hover:bg-neon-cyan/10 text-foreground text-sm border-b border-border last:border-b-0 transition-colors"
            >
              {exercise}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
