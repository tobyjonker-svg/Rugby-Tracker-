/**
 * Form Validation Utilities
 * Provides validation functions for all form inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validation = {
  // Training validations
  exerciseName: (value: string): ValidationResult => {
    if (!value || value.trim().length === 0) {
      return { isValid: false, error: "Exercise name is required" };
    }
    if (value.length > 100) {
      return { isValid: false, error: "Exercise name must be less than 100 characters" };
    }
    return { isValid: true };
  },

  sets: (value: number | string): ValidationResult => {
    const num = Number(value);
    if (!value || num === 0) {
      return { isValid: false, error: "Sets is required" };
    }
    if (num < 1 || num > 100) {
      return { isValid: false, error: "Sets must be between 1 and 100" };
    }
    if (!Number.isInteger(num)) {
      return { isValid: false, error: "Sets must be a whole number" };
    }
    return { isValid: true };
  },

  reps: (value: number | string): ValidationResult => {
    const num = Number(value);
    if (!value || num === 0) {
      return { isValid: false, error: "Reps is required" };
    }
    if (num < 1 || num > 1000) {
      return { isValid: false, error: "Reps must be between 1 and 1000" };
    }
    if (!Number.isInteger(num)) {
      return { isValid: false, error: "Reps must be a whole number" };
    }
    return { isValid: true };
  },

  weight: (value: number | string): ValidationResult => {
    const num = Number(value);
    if (!value || num === 0) {
      return { isValid: false, error: "Weight is required" };
    }
    if (num < 0 || num > 500) {
      return { isValid: false, error: "Weight must be between 0 and 500 kg" };
    }
    return { isValid: true };
  },

  distance: (value: number | string): ValidationResult => {
    const num = Number(value);
    if (!value || num === 0) {
      return { isValid: false, error: "Distance is required" };
    }
    if (num < 0.1 || num > 100) {
      return { isValid: false, error: "Distance must be between 0.1 and 100 km" };
    }
    return { isValid: true };
  },

  duration: (value: number | string): ValidationResult => {
    const num = Number(value);
    if (!value || num === 0) {
      return { isValid: false, error: "Duration is required" };
    }
    if (num < 1 || num > 480) {
      return { isValid: false, error: "Duration must be between 1 and 480 minutes" };
    }
    if (!Number.isInteger(num)) {
      return { isValid: false, error: "Duration must be a whole number" };
    }
    return { isValid: true };
  },

  pace: (value: number | string): ValidationResult => {
    const num = Number(value);
    if (!value || num === 0) {
      return { isValid: false, error: "Pace is required" };
    }
    if (num < 2 || num > 15) {
      return { isValid: false, error: "Pace must be between 2 and 15 min/km" };
    }
    return { isValid: true };
  },

  // Match validations
  opponent: (value: string): ValidationResult => {
    if (!value || value.trim().length === 0) {
      return { isValid: false, error: "Opponent name is required" };
    }
    if (value.length > 100) {
      return { isValid: false, error: "Opponent name must be less than 100 characters" };
    }
    return { isValid: true };
  },

  score: (value: number | string): ValidationResult => {
    const num = Number(value);
    if (value === "" || value === null || value === undefined) {
      return { isValid: false, error: "Score is required" };
    }
    if (num < 0 || num > 200) {
      return { isValid: false, error: "Score must be between 0 and 200" };
    }
    if (!Number.isInteger(num)) {
      return { isValid: false, error: "Score must be a whole number" };
    }
    return { isValid: true };
  },

  tries: (value: number | string): ValidationResult => {
    const num = Number(value);
    if (value === "" || value === null || value === undefined) {
      return { isValid: false, error: "Tries is required" };
    }
    if (num < 0 || num > 20) {
      return { isValid: false, error: "Tries must be between 0 and 20" };
    }
    if (!Number.isInteger(num)) {
      return { isValid: false, error: "Tries must be a whole number" };
    }
    return { isValid: true };
  },

  tackles: (value: number | string): ValidationResult => {
    const num = Number(value);
    if (value === "" || value === null || value === undefined) {
      return { isValid: false, error: "Tackles is required" };
    }
    if (num < 0 || num > 100) {
      return { isValid: false, error: "Tackles must be between 0 and 100" };
    }
    if (!Number.isInteger(num)) {
      return { isValid: false, error: "Tackles must be a whole number" };
    }
    return { isValid: true };
  },

  // Goal validations
  goalTitle: (value: string): ValidationResult => {
    if (!value || value.trim().length === 0) {
      return { isValid: false, error: "Goal title is required" };
    }
    if (value.length > 100) {
      return { isValid: false, error: "Goal title must be less than 100 characters" };
    }
    return { isValid: true };
  },

  targetValue: (value: number | string): ValidationResult => {
    const num = Number(value);
    if (!value || num === 0) {
      return { isValid: false, error: "Target value is required" };
    }
    if (num < 1 || num > 10000) {
      return { isValid: false, error: "Target value must be between 1 and 10000" };
    }
    return { isValid: true };
  },

  // Date validation
  date: (value: string | Date): ValidationResult => {
    if (!value) {
      return { isValid: false, error: "Date is required" };
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return { isValid: false, error: "Invalid date format" };
    }
    if (date > new Date()) {
      return { isValid: false, error: "Date cannot be in the future" };
    }
    return { isValid: true };
  },

  // Notes validation
  notes: (value: string): ValidationResult => {
    if (value && value.length > 1000) {
      return { isValid: false, error: "Notes must be less than 1000 characters" };
    }
    return { isValid: true };
  },
};

export const getErrorMessage = (field: string, error: string): string => {
  return error || `${field} is invalid`;
};
