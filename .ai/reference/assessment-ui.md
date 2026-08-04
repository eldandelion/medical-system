# Assessment UI & Data Catalog

## Overview
The Assessment system provides students with psychometric surveys (e.g., PHQ-9, GAD-7) assigned by staff. The frontend handles parsing, displaying, and navigating these multi-section forms, while adhering strictly to backend domain validations.

## Core Files & Structure
- **`AssessmentData.ts`**: The canonical frontend registry of all assessment definitions.
  - Contains all `Question` blocks.
  - Uses the `defineSection()` wrapper utility to strictly map and auto-generate 1-based canonical identifiers for every question (e.g., `phq9_1`, `phq9_2`), ensuring absolute sync with backend `AssessmentScoringEngine.kt` validation keys.
- **`AssessmentFlow.tsx`**: The main presentation component that takes a student through the test.
  - Renders a multi-page interactive UI for answering questions.
  - Navigates through defined sections via internal state (`currentSectionIdx`, `currentQuestionIdx`).
  - Converts user inputs into strongly typed submissions.
- **`src/types/index.ts`**: Contains types used for assessments.
  - `SubmitAssessmentRequest` defines strict array structure `answers: { questionId: string; selectedValue: number }[]` preventing arbitrary un-typed payloads.
  - `AssessmentValidationException` responses are parsed to extract `missingKeys` and `invalidKeys` directly.

## Key Design Principles
1. **Strong Typing over Fallbacks**: We do not guess assessment keys at runtime. Every question MUST have an explicitly generated `id` validated by `defineSection()`. Do NOT rely on array indices directly in the UI.
2. **Server-Side Validation Precedence**: The backend owns the absolute truth of what questions are required and what answers are within bounds.
3. **Structured Error Handling**: On submission, if the backend returns a `400 BAD_REQUEST` with `missingKeys` or `invalidKeys` arrays, `AssessmentFlow.tsx` strictly handles and surfaces these missing keys to the user using the snackbar.
4. **Data Isolation**: Responses (`answers`) are isolated per active assessment instance and passed atomically via HTTP request payload. No local-storage caching is currently employed for half-finished assignments.
