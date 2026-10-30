# Course and content plan

Source PRD: sections 3, 7–9, 18, 20, 24.

## Taxonomy

Tracks: Coding, AI for Kids, Robotics, Design & Digital Creativity, Web/App Design, Problem Solving, and Young Founders. Content is filtered by age group and learning level.

User-facing hierarchy: Pod → pathway levels → courses → modules → lessons/tasks/quizzes → projects → rewards. Tracks remain a broad internal taxonomy. For MVP a course has one primary Pod; future many-to-many support is allowed through `pod_courses`.

## Publishing workflow

Draft → Published → Archived. Publication validates required title/slug, eligibility, ordered modules/lessons, valid media, and at least one accessible learning item. Published content changes that affect learner progress should be version-aware or additive.

## Lesson delivery

Support video, text, PDF, quiz, external link, recording, and project instruction. Provider URLs are stored behind resources; private attachments use signed URLs. A lesson completes manually, at configured watch percentage, or after quiz pass.

## Progress rules

- Enrollment is unique per child/course.
- Progress updates are monotonic unless an authorized reset occurs.
- Server calculates course completion from required published lessons.
- Resume position is throttled/client-batched but completion is confirmed server-side.

## Starter content release

Seed one beginner course for each of Coding, AI, Robotics, and Design, then fully editorially approve one flagship course before expanding. Each course needs learning outcomes, module outline, lesson assets, task/quiz, project, rubric, estimated duration, and certificate rule.

Launch with five Pod worlds: Coding, AI, Design, Robotics, and Young Founders. Every launch Pod requires identity, slogan, color/icon, age/level eligibility, pathway ranks, at least one course, current project, first challenge, mentor/live-class slots, badges, and recommended tools.
