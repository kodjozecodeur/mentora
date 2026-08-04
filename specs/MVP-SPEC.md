# Mentora AI — MVP Specification

Version: 1.0

Status: Locked

Project: Djanta Hackathon MVP

---

# 1. Purpose

Mentora AI is an intelligent exam-readiness platform.

It helps students preparing for the BEPC understand their real level of preparation and know exactly what to revise next.

Mentora is NOT:

- a chatbot
- a generic e-learning platform
- a simple question bank
- a Duolingo clone

The core value of Mentora is:

Diagnostic → Analysis → Personalized Revision.

---

# 2. Target User

Primary user

- 3ème student
- Preparing for BEPC
- Mathematics
- Togo

---

# 3. MVP Scope

Only the following flow must be implemented.

Splash

↓

Welcome

↓

Exam Selection

↓

Subject Selection

↓

Diagnostic Introduction

↓

Mini Evaluation

↓

Analysis

↓

Results

↓

Personalized Study Plan

↓

Targeted Revision

↓

Updated Home

Nothing else.

---

# 4. Non Goals

Do NOT implement:

- Authentication
- Backend
- Teacher dashboard
- School dashboard
- WhatsApp
- Payments
- Premium
- Multiple exams
- Multiple subjects
- AI Chat
- Notifications
- Offline synchronization
- Gamification
- Leaderboards

---

# 5. Technology

Framework

- Next.js
- TypeScript

Styling

- Tailwind CSS

State

- localStorage only

Content

- JSON

Deployment

- Vercel

Math Rendering

- KaTeX

No database.

No API.

---

# 6. Design Source of Truth

All UI implementation must follow:

designs/

Specifically:

designs/figma/

Never redesign screens.

Never invent layouts.

If something is unclear, ask before implementing.

---

# 7. Brand Guidelines

Typography

Satoshi

Colors

Background

#FDF2FF

Primary Button

#F4CE1A

Highlight Card

#873694

Do not replace these colors.

Do not introduce another primary color.

---

# 8. Design Principles

Mobile-first.

Reference width:

390px

Maximum content width:

430px

Large touch targets.

Minimal text.

High readability.

Friendly but serious.

No visual clutter.

---

# 9. Product Principles

The product should feel like:

A personal academic coach.

Not:

An exam.

Not:

A quiz game.

Every interaction must reduce uncertainty.

The student should always understand:

- where they are;
- what they should do next;
- why.

---

# 10. Pedagogical Principles

Mentora follows the Approche Par Compétences (APC).

Questions must evaluate competencies, not only memorization.

Content is based on:

- annual progression
- official curriculum
- BEPC level
- teacher validation

---

# 11. Diagnostic Engine

Each exercise is linked to:

Lesson

↓

Competency

↓

Correct Answer

↓

Explanation

↓

Revision Content

The engine calculates:

- competency mastery
- overall readiness
- revision priorities

No AI scoring.

Only deterministic rules.

---

# 12. Readiness Levels

0–39%

Priority

40–69%

In Progress

70–100%

Mastered

---

# 13. Revision Engine

Each weak competency generates:

- explanation
- worked example
- targeted exercise
- correction

The first recommendation must always be the weakest competency.

---

# 14. Folder Structure

src/

components/

features/

services/

hooks/

lib/

types/

data/

styles/

public/

designs/

specs/

---

# 15. Development Rules

Always:

- write clean TypeScript
- keep components reusable
- use semantic naming
- avoid duplication

Never:

- redesign UI
- change copy
- change navigation
- introduce unnecessary packages
- over-engineer

---

# 16. Done Definition

A feature is complete only if:

- matches Figma
- responsive
- mobile-first
- accessible
- lint passes
- build passes
- no TypeScript errors
- no console errors

---

# 17. Claude Code Rules

Before every task:

Read this specification.

Respect the specification.

If implementation conflicts with the specification,

stop and explain why.

Never silently change product decisions.

This document is the single source of truth for development.
