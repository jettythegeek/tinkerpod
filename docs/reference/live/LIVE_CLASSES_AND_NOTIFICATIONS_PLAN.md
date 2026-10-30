# Live classes and notifications plan

Source PRD: sections 9, 10, 13, 17.

## Live classes

Classes can attach to track, course, pod, age group, and level. Store start/end plus IANA timezone. Providers are external Zoom, Google Meet, YouTube, or custom links. Meeting URLs are returned only to eligible learners and only within the configured join window.

Lifecycle: Scheduled → Live → Completed, or Cancelled. Rescheduling/cancellation records history and notifies registrants. Attendance supports registered, attended, and missed.

## Notifications

Channels: in-app, Expo push, and email. Every notification has a domain type, recipient, child context where applicable, payload, timestamps, and delivery result. Users can manage optional categories; critical account/payment notices remain enabled.

## Scheduled work

- Class reminders 24 hours and 1 hour before.
- Project due reminders.
- Renewal reminder 7 days before and daily expiry transition.
- Weekly inactive learner prompt.
- Monthly parent progress summary.

Jobs must be idempotent so scheduler retries never send duplicate reminders.

