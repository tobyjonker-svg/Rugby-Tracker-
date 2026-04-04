import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface ConditioningExerciseDropdownProps {
  value: string;
  onChange: (value: string) => void;
  exercises: string[];
}

export function ConditioningExerciseDropdown({
  value,
  onChange,
  exercises,
}: ConditioningExerciseDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) =>
      ex.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [exercises, searchTerm]);

  return (
    <div className="relative">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Exercise type (e.g., Pushups)"
          className="flex-1 px-3 py-2 bg-input border border-border text-foreground rounded"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
        >
          <ChevronDown size={16} />
        </Button>
      </div>

      {isOpen && exercises.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded shadow-lg z-50 max-h-48 overflow-y-auto">
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-input border-b border-border text-foreground text-sm"
          />
          {filteredExercises.length > 0 ? (
            filteredExercises.map((exercise) => (
              <button
                key={exercise}
                onClick={() => {
                  onChange(exercise);
                  setIsOpen(false);
                  setSearchTerm("");
                }}
                className="w-full text-left px-3 py-2 hover:bg-neon-cyan/10 text-foreground text-sm border-b border-border last:border-b-0"
              >
                {exercise}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-muted-foreground text-sm">
              No exercises found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
