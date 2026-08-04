'use client';

import { useState } from 'react';

interface UseSubmitValidationOptions {
  isValid: boolean;
  errorMessage: string;
}

/**
 * Shows a validation error only after a submit attempt, and clears it
 * automatically once `isValid` becomes true. Reusable across any
 * onboarding field that needs "submit-triggered, typing-silent" validation.
 */
export function useSubmitValidation({ isValid, errorMessage }: UseSubmitValidationOptions) {
  const [submitted, setSubmitted] = useState(false);

  function attemptSubmit(onValid: () => void) {
    if (isValid) {
      onValid();
    } else {
      setSubmitted(true);
    }
  }

  return {
    error: submitted && !isValid ? errorMessage : null,
    attemptSubmit,
  };
}
