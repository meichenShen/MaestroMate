# MaestroMate curriculum implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the approved non-API Play and prepared Chat redesign.
**Architecture:** Typed local curriculum drives independent catalogue, teaching, assessment and creation components. App owns progress and transfers eight-note sketches to the existing pool; the existing audio provider and synth are reused.
**Tech Stack:** React, TypeScript, CSS, Web Audio, Three.js, existing Vite/Worker/Sites.
**Spec:** docs/superpowers/specs/2026-11-24-play-curriculum-design.md

## Global Constraints
- English UI; existing black, cyan, rose, amber and lavender baseline. No green panels.
- No external API integration, secrets, new backend endpoints or data collection.
- Two checks taught before Make; all core desktop operations fit one viewport.
- Preserve one shared recording element, Guide/hide/navigation cancellation, existing feedback and research.

## Review Focus
- Invalid and prototype-like lesson IDs must not resolve; legacy work URLs preserve explicit Program intent.
- Wrong/incomplete answers cannot count completion; progress survives routes and clears on restart.
- Guide, navigation, visibility and mute cancel generated/recorded lesson sound, including pending startup.
- Short desktop and phone controls cannot overlap, overflow horizontally or hide questions.
- Prepared Chat must clearly disclose no live AI, keep questions visible and sources distinguishable from interpretation.

### Task 1: Curriculum and lesson workspace
Files: create web/src/content/curriculum.ts; create web/src/features/curriculum/{PlayCatalog,LessonRoom,LessonVisual,CreationBoard}.tsx and curriculum.css; modify App/routes/BrandHeader/GameRoom; extend PoolAudio/useWorkshopSound for simultaneous teaching layers.
Interfaces: resolveUnit(id):LearningUnit|undefined; evaluateCreation(unit,notes,beats):{correct,message}; UnitProgress {answers,checked,notes,beats,made}; LessonRoom consumes unitId, progress, onChange, enabled, journey, onSendToPool.
- [ ] Write curriculum contract tests for unavailable IDs, two checks, clip bounds, flexible creation rules, incomplete completion; write startup-cancellation audio test.
- [ ] Run tests and observe absent curriculum/layer support failures.
- [ ] Implement typed content, fixed Learn/Try/Make workspace, interactive visuals, two-check assessment and creation with shared audio; wire three pillar catalogues and legacy routes.
- [ ] Run new and existing unit tests; build; commit.

### Task 2: Knowledge and connected journey
Files: create web/src/content/knowledge/{sources,composer}.ts; modify aquarium question exports, Conversation/CSS, ListeningDiscoveries, MusicPool handoff, ProgramComplete, Guide, App, editing guide and AGENTS.
Interfaces: curated composerQuestions/questionPresentation/reference records; Program completion uses curriculumDone(progress,id); App passes a copied eight-note sketch to pool.
- [ ] Write browser checks for visible question rail/disclosure/sources, Learn-Try-Make feedback/retry, retained progress, pool transfer, honest Program summary/restart and invalid routes; observe failures on baseline.
- [ ] Implement local source-backed prepared questions and connections; no API input; summary and restart.
- [ ] Run browser checks and unit suite; commit.

### Task 3: Validate and publish
- [ ] Capture and inspect desktop/short desktop/phone screenshots; test keyboard, reduced motion, audio errors, Guide interruption, feedback and existing rooms.
- [ ] Resolve observed regressions, run affected checks and production build.
- [ ] Run one fresh whole-change review; fix important findings with regression checks.
- [ ] Update verification/editing documentation, commit/push feature branch, synchronize existing Sites source and publish preserving public audience. Record verified deployment URL/version; attach existing PR.
