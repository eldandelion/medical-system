---
name: interview-me
description: Extracts comprehensive, exhaustive requirements for a feature, eliminating all blind spots before planning or implementation. Uses subagent research for context, builds a detailed discussion blueprint, tracks knowledge gaps in a temporary file, and conducts a deep-dive interview with recommendations and guesses. Use when a user asks to build a feature and you need absolute clarity with zero guessing.
---

# Interview Me

## Overview

What people ask for and what they actually want are often different, and high-level requirements frequently hide massive implementation complexities. A simple "search bar" involves UI/UX states, backend querying strategies, rate limiting, and accessibility. 

The cheapest moment to resolve these details is before any plan, spec, or code exists. The `interview-me` skill is an exhaustive, curious, and deeply technical interview process designed to identify every blind spot, log every detail, and eliminate all guessing for downstream planning and implementation stages.

## When to Use

Apply this skill when:
- The user asks to build a feature, component, or system.
- You need to flesh out underspecified requirements across the entire stack (Frontend, Backend, Security, UX, Performance).
- The user explicitly invokes: "interview me", "grill me", "are we sure?", "stress-test my thinking".

## Loading Constraints
This skill requires a live, responsive user. **Do not invoke in non-interactive contexts** like CI pipelines, scheduled runs, or autonomous loops. 

---

## The Process

### Step 1: Context Gathering (Subagent Research)
Before you barrage the user with questions, check your own blind spots. 
- If you are unsure about the existing codebase context, architectural patterns, or current UI conventions (e.g., existing color palettes, database schemas), **invoke a research subagent** (like `code-explorer` or `research`) to investigate the codebase.
- You can also run research subagents *during* the interview if the user's answers introduce new, unfamiliar technical domains.

### Step 2: Build the Discussion Blueprint
Based on the initial request and codebase context, dynamically generate a comprehensive list of sections that **must be discussed**. The topics must be strictly relevant to the specific situation and feature requested. Present this blueprint to the user so they know what the interview will cover. 

*For example, if the user asks for a full-stack search bar, your generated blueprint might look like:*
1. **High-Level Intent & Scope:** Who is this for? What is the success metric?
2. **Frontend & UX/UI Implementation:** Layout, containers, components, colors, typography, loading states, error states, empty states, and accessibility.
3. **Backend & Data Layer:** API contracts, database schema changes, query optimization, caching strategies.
4. **Security & Edge Cases:** Permissions, validation, rate limiting, potential race conditions, malicious inputs.
5. **Optimization & Performance:** Latency budgets, bundle size impacts, pagination, lazy loading.

*However, if the user asks for a database migration script, the blueprint would naturally exclude UI/UX entirely and focus heavily on data integrity, downtime windows, rollback procedures, and schema locks.*

### Step 3: Initialize the Knowledge Gap Tracker
Before asking the first question, you must explicitly identify the gaps in your understanding based on the blueprint.
1. Create a temporary markdown file (e.g., `.plans/interview-gaps.md` or `.agent/interview-gaps.md`).
2. List out absolutely everything you are unsure about, organized by the blueprint sections. Document every blind spot, ambiguity, and technical uncertainty.
3. **Active Tracking:** As the interview progresses and the user answers your questions, actively update this file to mark gaps as resolved and fill in the details. This file serves as your master checklist to ensure no blind spots remain.

### Step 4: Deep-Dive Interview (Section by Section)
Do not ask 20 questions at once. Proceed section by section. For each topic in the blueprint:
- Ask the relevant, in-depth questions to extract *everything* you need to know (referencing your Knowledge Gap Tracker).
- **Crucial:** You MUST utilize the built-in `ask_question` tool to present these questions interactively.
- **Recommendations as Options:** When using the `ask_question` tool, supply your **recommendations and educated guesses** as the selectable `options`. Prefix your primary recommendation with "(Recommended)". The tool automatically provides a write-in option, so the user can provide a custom answer if they disagree with your guesses.

**Example Tool Usage:**
- **question:** "[Frontend UI/UX] How should the search results be displayed while typing?"
- **options:** 
  - "(Recommended) Dropdown popover anchored to input field, 300ms debounce."
  - "Inline expansion pushing content down."
  - "Full-screen modal overlay."

*Wait for the user to respond via the UI modal before asking the next question or moving to the next section.*

### Step 5: Listen for "Want vs. Should Want"
Watch out for vague buzzwords ("make it scalable", "clean UI"). When a user relies on convention instead of specifics, probe deeper:
> *"If you didn't have to justify this to anyone, what would you actually want?"*

### Step 6: The Comprehensive Restate & Intent Lock
Once all sections of the blueprint have been discussed and all items in your Knowledge Gap Tracker are resolved, synthesize the findings into a highly detailed **Intent Lock** document. This is not just a high-level summary; it must log every detail discussed:

```
Here is the fully resolved feature intent. Please confirm if we have 100% alignment:

1. High-Level Scope: ...
2. Frontend Details: (e.g., button colors, outlines, debounce timing, error states)
3. Backend Details: (e.g., specific API routes, DB indexing strategies)
4. Security/Edge Cases: (e.g., max input length, SQLi prevention, role checks)
5. Out of Scope: (e.g., explicitly what we are NOT building)

Yes / No / Refine?
```

### Step 7: Confirm — Explicit Yes
The gate to proceed to Planning or Implementation is an explicit "yes."
- "Whatever you think is best" → Not a yes. Give them a forced choice.
- "Sounds good" → Ask if they want to refine anything.
If they correct you, fold the correction in and restate. Loop until you get an explicit yes.

---

## Output
The final output is the confirmed **Intent Lock** document. This artifact is handed off to the `architect` or `planner` (or used in the `/auto-ship` workflow), guaranteeing that downstream steps require **zero guessing**. The temporary gap tracker can be deleted or archived.

## Red Flags
- Failing to create and maintain the `.plans/interview-gaps.md` file before starting the interview.
- Asking all questions for all sections in a single giant message (users will skim and skip).
- Asking open-ended questions without providing a guess or recommendation.
- Leaving UI details (like colors or states) ambiguous for the planning stage.
- Proceeding to write code or architecture plans without the final explicit "Yes" on the Intent Lock.
