# TinkerPod Product Requirements Document (PRD)

**Product:** TinkerPod  
**Version:** v1.0 MVP + scalable foundation  
**Backend:** Laravel REST API  
**Mobile App:** React Native Expo  
**Admin Dashboard:** Laravel Filament recommended  
**Public Website:** Landing page only, no user login  
**Primary Users:** Parents, Kids/Learners, Mentors, Admins

---

## 1. Product Summary

TinkerPod is a year-round edtech platform for children and teenagers to learn coding, AI, robotics, design, digital creativity, and problem-solving through structured lessons, weekend live classes, hands-on projects, mentor support, and progress tracking.

TinkerPod extends the existing holiday-based Kids Code Camp model into a continuous subscription-based learning ecosystem. Parents subscribe for their children, children learn through the app, submit projects, join live sessions, receive mentor feedback, and earn badges/certificates.

Core learning loop:

**Learn → Build → Submit → Get Mentor Feedback → Improve → Showcase**

---

## 2. Product Goals

### Business Goals

- Turn seasonal Kids Code Camp into a recurring subscription edtech product.
- Allow parents to subscribe for children and manage learning from the mobile app.
- Enable children to learn throughout the year instead of waiting for holiday camps.
- Support mentor-led learning pods.
- Create project-based outcomes that parents can see.
- Support future expansion into schools, kits, camps, and young founder programs.

### Product Goals

- Parent can register, add one or more children, subscribe, and track progress.
- Child can access lessons, projects, live classes, mentor feedback, badges, and certificates.
- Mentor can manage assigned children, review projects, give feedback, and track pod performance.
- Admin can manage users, courses, subscriptions, mentors, pods, projects, live classes, payments, reports, and content.

---

## 3. TinkerPod Ecosystem

- **TinkerPod** — the main edtech platform.
- **TinkerPod Academy** — structured year-round learning.
- **TinkerPod Live** — weekend live classes.
- **TinkerPod Projects** — monthly hands-on projects.
- **TinkerPod Mentors** — mentor support system.
- **TinkerPod Kit** — toolbox that contains hardware/software for kids to build.
- **TinkerPod Camps** — Easter and Summer holiday bootcamps.
- **TinkerPod for Schools** — school partnership model.
- **TinkerPod for Young Founders** — teen innovation, ideation, problem-solving, and pitch pathway.

---

## 4. User Roles

### Parent

The parent is the paying account owner.

Parent can:

- Create account and log in.
- Add and manage child profiles.
- Choose child age, level, and interests.
- Subscribe to a plan.
- View child progress.
- View lessons completed.
- View projects submitted.
- Read mentor feedback.
- View upcoming live classes.
- View/download certificates.
- Manage subscription and payment.
- Receive notifications.
- Register child for camps, kits, or special programs.
- Switch between multiple child profiles.

### Kid/Learner

A child is linked to a parent account.

Child can:

- Access child dashboard through parent account/profile switcher.
- View assigned courses.
- Watch lessons.
- Complete quizzes/tasks.
- Submit projects.
- View mentor feedback.
- Attend live classes.
- Earn badges.
- View certificates.
- View learning streak/progress.
- Access project gallery.
- Join assigned pod.
- Participate in challenges.

### Mentor

Mentor supports learners.

Mentor can:

- View assigned pods.
- View assigned learners.
- Track learner progress.
- Review project submissions.
- Give written feedback.
- Mark project status: needs improvement, approved, excellent.
- Recommend next steps.
- Join/host live classes if assigned.
- Send pod announcements.
- Flag inactive or struggling learners.

### Admin

Admin manages the platform.

Admin can manage:

- Users, parents, children, mentors.
- Tracks, courses, modules, lessons, quizzes.
- Projects and submissions.
- Pods and mentor assignments.
- Subscriptions and payments.
- Live classes and attendance.
- Badges and certificates.
- Camps, kits, schools.
- Notifications and support tickets.
- Reports and settings.

### Super Admin

Super Admin has all permissions plus:

- Manage admin roles/permissions.
- Configure payment gateways.
- Configure system settings.
- Manage API keys/integrations.
- Access audit logs.
- Export data.

---

## 5. Platforms

### Mobile App

Built with **React Native Expo**.

Users:

- Parents
- Kids/Learners

Mentor mobile app is not required for MVP. Mentors use the admin/mentor dashboard.

### Admin Dashboard

Web dashboard for:

- Admins
- Super Admins
- Mentors
- Content managers
- Support staff

Recommended for speed: **Laravel Filament**.

### Landing Page

Public site only. No user login.

Pages:

- Home
- About
- Programs
- Pricing
- TinkerPod for Schools
- TinkerPod Camps
- TinkerPod for Young Founders
- FAQ
- Contact
- Privacy Policy
- Terms

---

## 6. MVP Scope

### Must-Have Features

- Parent registration/login.
- Parent profile.
- Add/manage child profiles.
- Child profile dashboard.
- Course/track listing.
- Course enrollment based on subscription.
- Lesson video/content delivery.
- Progress tracking.
- Monthly projects.
- Project submission.
- Mentor assignment/pods.
- Mentor feedback.
- Live class schedule.
- Payment/subscription.
- Notifications.
- Badges/certificates.
- Admin dashboard.
- Landing page.
- Basic analytics.
- Support/contact.

### Post-MVP Features

- In-app mentor chat.
- AI learning assistant.
- Leaderboards.
- Kit marketplace.
- School dashboard.
- Offline lesson downloads.
- Public project gallery.
- Advanced quizzes.
- Wallet/referrals.
- Full mentor mobile app.

---

## 7. User Journeys

### Parent Onboarding

1. Parent opens app.
2. Parent sees onboarding screens.
3. Parent signs up with name, email, phone, password.
4. Parent creates first child profile.
5. Parent selects child age, level, interests.
6. App recommends learning path.
7. Parent chooses subscription plan.
8. Parent pays.
9. Child gets access to dashboard.
10. Parent sees progress dashboard.

### Child Learning

1. Child opens child profile.
2. Lands on child dashboard.
3. Sees continue lesson, current project, upcoming live class, mentor/pod, badges.
4. Opens course.
5. Watches lesson.
6. Completes task/quiz.
7. Starts project.
8. Uploads project.
9. Mentor reviews.
10. Child receives feedback.
11. Child improves or gets approved.
12. Badge/certificate unlocks.

### Mentor Review

1. Mentor logs into dashboard.
2. Opens assigned pod.
3. Views pending submissions.
4. Reviews project.
5. Gives feedback and score/rubric.
6. Marks status: needs improvement, approved, excellent, rejected.
7. Parent and child receive notification.
8. Progress updates.

### Admin Content Flow

1. Admin creates learning track.
2. Admin creates course.
3. Admin creates modules.
4. Admin adds lessons.
5. Admin uploads video/content.
6. Admin creates project.
7. Admin links course to plan/age group/level.
8. Admin publishes course.
9. Eligible learners see course in app.

---

## 8. App Information Architecture

### Parent App Navigation

Bottom tabs:

- Home
- Children
- Learning
- Progress
- Account

### Child App Navigation

When child profile is active:

- Home
- Learn
- Projects
- Live
- Rewards

### Parent Screens

Auth:

- Splash
- Onboarding
- Login
- Register
- Forgot Password
- OTP Verification
- Reset Password

Core:

- Parent Home
- Add Child
- Edit Child
- Child Profile Switcher
- Recommended Path
- Subscription Plans
- Payment Checkout
- Payment Success/Failed
- Children List
- Child Progress Overview
- Course Catalog
- Course Detail
- Live Class Schedule
- Mentor Feedback
- Notifications
- Certificates
- Badges
- Account Settings
- Support
- Terms/Privacy

### Child Screens

- Child Welcome
- Child PIN/Login
- Child Dashboard
- Continue Learning
- Course List
- Course Detail
- Module Detail
- Lesson Player
- Lesson Task/Quiz
- Project Detail
- Project Submission
- Submission Status
- Mentor Feedback
- Live Classes
- Badges
- Certificates
- Project Gallery
- Learning Streak
- Profile/Avatar

---

## 9. Feature Requirements

### Authentication

Requirements:

- Parent can register with email/phone/password.
- Parent can login.
- Parent can reset password.
- Parent can log out.
- Parent can enable child PIN.
- Parent can switch active child profile.

Backend:

- Use Laravel Sanctum for token authentication.
- Store token securely in Expo SecureStore.
- Protected endpoints require Bearer token.

### Parent Profile

Parent can:

- View/edit profile.
- Change password.
- Upload profile photo.
- View subscription status.
- View linked children.

### Child Profiles

Child fields:

- First name
- Last name optional
- Age/date of birth
- Gender optional
- Avatar
- Learning level
- Interests
- Child PIN optional
- Parent ID
- Status

Age groups:

- Junior Creators: 5–7
- Young Builders: 8–11
- Teen Innovators: 12–15
- Young Founders: 16–18

Learning levels:

- Beginner
- Intermediate
- Advanced

Interests:

- Coding
- AI
- Robotics
- Design
- Games
- Web/App
- Animation
- Problem Solving
- Entrepreneurship

### Learning Tracks

Tracks:

- Coding
- AI for Kids
- Robotics
- Design & Digital Creativity
- Web/App Design
- Problem Solving
- Young Founders

Track fields:

- Name
- Slug
- Description
- Icon
- Color
- Age group
- Level
- Status
- Sort order

### Courses

A course belongs to a track.

Course fields:

- Track ID
- Title
- Slug
- Description
- Thumbnail
- Intro video
- Age group
- Level
- Estimated duration
- Free preview flag
- Status
- Published date
- Sort order

Course structure:

**Course → Modules → Lessons → Tasks/Quizzes → Project**

### Lessons

Lesson types:

- Video
- Text
- PDF/worksheet
- Quiz
- External link
- Live class recording
- Project instruction

Lesson fields:

- Module ID
- Title
- Description
- Video URL
- Video provider
- Content body
- Attachment file
- Duration
- Sort order
- Preview flag
- Status

Recommended video providers:

- Bunny Stream
- Vimeo private video
- Cloudflare Stream

### Lesson Progress

Track:

- Child ID
- Course ID
- Module ID
- Lesson ID
- Status: not_started, in_progress, completed
- Started at
- Completed at
- Last watched position
- Percentage watched

Completion rule:

- Mark complete manually, or
- Auto-complete after configured watch percentage, e.g. 80%.

### Quizzes/Tasks

Question types:

- Multiple choice
- True/false
- Short answer

Quiz fields:

- Lesson ID
- Title
- Passing score
- Max attempts
- Status

Attempt fields:

- Child ID
- Quiz ID
- Score
- Passed
- Answers JSON
- Attempt number
- Submitted at

### Projects

Project types:

- Course project
- Monthly challenge
- Pod project
- Camp project
- Young founder project

Project fields:

- Title
- Slug
- Description
- Instructions
- Track ID optional
- Course ID optional
- Module ID optional
- Age group
- Level
- Project type
- Due date optional
- Submission requirements
- Rubric JSON
- Thumbnail
- Status

Submission types:

- Text explanation
- Image upload
- Video upload/link
- File upload
- URL/link
- GitHub/link optional for teens
- App design screenshot
- Robotics demo video

### Project Submissions

Fields:

- Project ID
- Child ID
- Parent ID
- Pod ID optional
- Mentor ID optional
- Title
- Description
- Files JSON
- Links JSON
- Status: draft, submitted, under_review, needs_improvement, approved, excellent, rejected
- Score
- Submitted at
- Reviewed at

Mentor review fields:

- Submission ID
- Mentor ID
- Feedback text
- Rubric scores JSON
- Review status
- Attachment optional
- Created at

### Pods

A pod is a small learning group.

Pod fields:

- Name
- Description
- Mentor ID
- Track ID optional
- Age group
- Level
- Max learners
- Status
- Schedule note optional

Pod assignment logic:

- Match by age group.
- Match by track/interest.
- Match by available capacity.
- Admin can override manually.

### Mentors

Mentor fields:

- User ID
- Bio
- Skills JSON
- Assigned tracks
- Availability
- Max pods
- Status

Mentor dashboard shows:

- Assigned pods
- Learners
- Pending submissions
- Reviewed submissions
- Assigned live classes
- Parent notes
- Pod announcements

### TinkerPod Live

Live class fields:

- Title
- Description
- Track ID optional
- Course ID optional
- Pod ID optional
- Age group
- Level
- Mentor/instructor ID
- Start time
- End time
- Timezone
- Meeting provider: Zoom, Google Meet, YouTube Live, Custom
- Meeting URL
- Recording URL optional
- Status: scheduled, live, completed, cancelled

App behavior:

- Child sees upcoming classes.
- Parent sees upcoming classes.
- Push notification 24 hours before and 1 hour before.
- Join button activates based on admin setting.
- Recording can be attached after class.

### Subscriptions

Recommended MVP plans:

#### Basic

- Recorded lessons
- Monthly project
- Basic progress tracking
- Certificates

#### Standard

- Recorded lessons
- Weekly live class
- Monthly projects
- Mentor pod
- Project reviews
- Parent progress report

#### Premium

- Everything in Standard
- Priority project review
- Monthly 1-on-1 mentor session
- Personalized pathway
- Extra support

Plan fields:

- Name
- Slug
- Description
- Price
- Currency
- Billing interval: monthly, quarterly, yearly, one_time
- Max children included
- Features JSON
- Access rules JSON
- Status

Subscription fields:

- Parent ID
- Plan ID
- Status: trialing, active, past_due, cancelled, expired
- Start date
- End date
- Renewal date
- Payment provider
- Provider subscription ID
- Metadata JSON

### Payments

Recommended provider: **Paystack first**.

Payment features:

- Initialize payment.
- Verify payment.
- Store transaction.
- Activate subscription.
- Handle webhook.
- Manual admin payment marking.

Transaction fields:

- Parent ID
- Subscription ID optional
- Plan ID optional
- Amount
- Currency
- Provider
- Provider reference
- Status: pending, successful, failed, refunded
- Paid at
- Metadata JSON

### Notifications

Channels:

- In-app notifications
- Expo push notifications
- Email
- WhatsApp later
- SMS later

Types:

- Welcome
- Payment successful
- Subscription expiring
- Subscription expired
- New lesson available
- Project due soon
- Project submitted
- Mentor feedback received
- Live class reminder
- Certificate unlocked
- Badge earned
- Admin announcement

### Badges

Examples:

- First Lesson Completed
- First Project Submitted
- Coding Starter
- AI Explorer
- Robotics Builder
- Design Creator
- Problem Solver
- Young Founder
- 7-Day Streak
- Project Champion

### Certificates

Awarded when:

- Course completed.
- Track completed.
- Project approved.
- Camp completed.
- Young Founders pathway completed.

Admin can:

- Generate certificate.
- Revoke certificate.
- Download certificate.
- Verify certificate number.

### Project Gallery

MVP: private project history.  
Post-MVP: public/curated gallery.

Child safety:

- No public full child name without consent.
- Parent consent required for public showcase.
- Admin moderation required.

### Support

Options:

- Contact form in app.
- WhatsApp support link.
- FAQ.
- Email support.
- Admin support ticket list.

---

## 10. Admin Dashboard Requirements

Recommended: Laravel Filament.

Modules:

- Dashboard/Home
- Users
- Parents
- Children
- Mentors
- Pods
- Tracks
- Courses
- Modules
- Lessons
- Quizzes
- Projects
- Submissions
- Live Classes
- Subscriptions
- Payments
- Badges
- Certificates
- Camps
- Kits
- Schools
- Notifications
- Support Tickets
- Reports
- Settings
- Roles/Permissions
- Audit Logs

### Admin Home Metrics

Show:

- Total parents
- Total children
- Active subscriptions
- Monthly revenue
- Pending submissions
- Upcoming live classes
- Active mentors
- Active pods
- Course completion rate
- Recent payments
- New registrations
- Expiring subscriptions

### Content Management

Admin/content manager can:

- Create track.
- Create course.
- Create modules.
- Create lessons.
- Upload thumbnails/files.
- Add video URLs.
- Add quizzes.
- Add projects.
- Set access plan.
- Publish/unpublish content.
- Reorder modules/lessons.

### Project Submission Management

Admin can:

- View all submissions.
- Filter by status/project/course/mentor/pod.
- Assign/reassign mentor.
- View review.
- Override status.
- Feature project in gallery.
- Hide/delete inappropriate submission.

### Live Class Management

Admin can:

- Create live class.
- Assign instructor/mentor.
- Attach to course/pod/track.
- Add meeting link.
- Add recording.
- Mark attendance.
- Notify learners.
- Cancel/reschedule class.

### Subscription Management

Admin can:

- Create plans.
- Edit prices.
- View active subscriptions.
- Manually activate subscription.
- Cancel subscription.
- Extend subscription.
- Apply discount.
- View failed payments.
- Export payment records.

### Reports

Reports:

- Revenue report
- Subscription report
- Learner progress report
- Course completion report
- Mentor performance report
- Pod performance report
- Project submission report
- Live class attendance report
- Camp enrollment report
- School enrollment report

Export:

- CSV
- Excel
- PDF optional

---

## 11. Database Design

Use MySQL or PostgreSQL. MySQL is recommended for common Laravel deployment simplicity.

### users

- id
- name
- email nullable unique
- phone nullable unique
- password
- role enum: parent, mentor, admin, super_admin, content_manager, support
- avatar nullable
- email_verified_at nullable
- phone_verified_at nullable
- status enum: active, inactive, suspended
- last_login_at nullable
- remember_token
- created_at
- updated_at

### parent_profiles

- id
- user_id foreign
- address nullable
- city nullable
- state nullable
- country default Nigeria
- referral_source nullable
- metadata json nullable
- created_at
- updated_at

### children

- id
- parent_id foreign users.id
- first_name
- last_name nullable
- date_of_birth nullable
- age cached nullable
- gender nullable
- avatar nullable
- child_pin nullable hashed
- age_group enum: junior_creators, young_builders, teen_innovators, young_founders
- learning_level enum: beginner, intermediate, advanced
- interests json nullable
- status enum: active, inactive, suspended
- created_at
- updated_at

### mentor_profiles

- id
- user_id foreign
- bio text nullable
- skills json nullable
- tracks json nullable
- availability json nullable
- max_pods integer default 3
- status enum: active, inactive, suspended
- created_at
- updated_at

### tracks

- id
- name
- slug unique
- description text nullable
- icon nullable
- color nullable
- age_group nullable
- learning_level nullable
- sort_order integer default 0
- status enum: draft, published, archived
- created_at
- updated_at

### courses

- id
- track_id foreign nullable
- title
- slug unique
- description text nullable
- thumbnail nullable
- intro_video_url nullable
- age_group nullable
- learning_level nullable
- estimated_duration_minutes nullable
- is_free_preview boolean default false
- sort_order integer default 0
- status enum: draft, published, archived
- published_at nullable
- created_at
- updated_at

### modules

- id
- course_id foreign
- title
- description text nullable
- sort_order integer default 0
- status enum: draft, published, archived
- created_at
- updated_at

### lessons

- id
- module_id foreign
- title
- description text nullable
- lesson_type enum: video, text, pdf, quiz, external_link, project_instruction
- content longtext nullable
- video_url nullable
- video_provider nullable
- attachment_url nullable
- external_url nullable
- duration_minutes nullable
- completion_rule enum: manual, watch_percentage, quiz_pass
- required_watch_percentage integer default 80
- is_preview boolean default false
- sort_order integer default 0
- status enum: draft, published, archived
- created_at
- updated_at

### course_enrollments

- id
- child_id foreign
- course_id foreign
- source enum: subscription, manual, camp, school
- status enum: active, completed, paused, cancelled
- started_at nullable
- completed_at nullable
- created_at
- updated_at

### lesson_progress

- id
- child_id foreign
- course_id foreign
- module_id foreign
- lesson_id foreign
- status enum: not_started, in_progress, completed
- watched_seconds integer default 0
- watched_percentage integer default 0
- started_at nullable
- completed_at nullable
- created_at
- updated_at

### quizzes

- id
- lesson_id foreign nullable
- title
- description text nullable
- passing_score integer default 70
- max_attempts integer default 3
- status enum: draft, published, archived
- created_at
- updated_at

### quiz_questions

- id
- quiz_id foreign
- question text
- question_type enum: multiple_choice, true_false, short_answer
- options json nullable
- correct_answer json nullable
- explanation text nullable
- sort_order integer default 0
- created_at
- updated_at

### quiz_attempts

- id
- quiz_id foreign
- child_id foreign
- score integer default 0
- passed boolean default false
- answers json nullable
- attempt_number integer default 1
- submitted_at nullable
- created_at
- updated_at

### projects

- id
- title
- slug unique
- description text nullable
- instructions longtext nullable
- thumbnail nullable
- track_id foreign nullable
- course_id foreign nullable
- module_id foreign nullable
- age_group nullable
- learning_level nullable
- project_type enum: course_project, monthly_challenge, pod_project, camp_project, young_founder_project
- due_date nullable
- submission_requirements json nullable
- rubric json nullable
- status enum: draft, published, archived
- created_at
- updated_at

### project_submissions

- id
- project_id foreign
- child_id foreign
- parent_id foreign users.id
- pod_id foreign nullable
- mentor_id foreign users.id nullable
- title
- description text nullable
- files json nullable
- links json nullable
- status enum: draft, submitted, under_review, needs_improvement, approved, excellent, rejected
- score integer nullable
- submitted_at nullable
- reviewed_at nullable
- created_at
- updated_at

### project_reviews

- id
- submission_id foreign
- mentor_id foreign users.id
- feedback text
- rubric_scores json nullable
- review_status enum: needs_improvement, approved, excellent, rejected
- attachment_url nullable
- created_at
- updated_at

### pods

- id
- name
- description text nullable
- mentor_id foreign users.id nullable
- track_id foreign nullable
- age_group nullable
- learning_level nullable
- max_learners integer default 30
- schedule_note nullable
- status enum: active, inactive, archived
- created_at
- updated_at

### pod_members

- id
- pod_id foreign
- child_id foreign
- status enum: active, inactive, removed
- joined_at nullable
- created_at
- updated_at

### live_classes

- id
- title
- description text nullable
- track_id foreign nullable
- course_id foreign nullable
- pod_id foreign nullable
- instructor_id foreign users.id nullable
- age_group nullable
- learning_level nullable
- start_time datetime
- end_time datetime
- timezone varchar default Africa/Lagos
- meeting_provider enum: zoom, google_meet, youtube, custom
- meeting_url text nullable
- recording_url text nullable
- status enum: scheduled, live, completed, cancelled
- created_at
- updated_at

### live_class_attendances

- id
- live_class_id foreign
- child_id foreign
- status enum: registered, attended, missed
- joined_at nullable
- notes nullable
- created_at
- updated_at

### plans

- id
- name
- slug unique
- description text nullable
- price decimal
- currency varchar default NGN
- billing_interval enum: monthly, quarterly, yearly, one_time
- max_children integer default 1
- features json nullable
- access_rules json nullable
- status enum: active, inactive, archived
- created_at
- updated_at

### subscriptions

- id
- parent_id foreign users.id
- plan_id foreign
- status enum: trialing, active, past_due, cancelled, expired
- starts_at datetime nullable
- ends_at datetime nullable
- renews_at datetime nullable
- payment_provider enum: paystack, flutterwave, manual nullable
- provider_subscription_id nullable
- metadata json nullable
- created_at
- updated_at

### transactions

- id
- parent_id foreign users.id
- subscription_id foreign nullable
- plan_id foreign nullable
- amount decimal
- currency varchar default NGN
- provider enum: paystack, flutterwave, manual
- provider_reference unique nullable
- status enum: pending, successful, failed, refunded
- paid_at nullable
- metadata json nullable
- created_at
- updated_at

### notifications

- id
- user_id foreign nullable
- child_id foreign nullable
- type
- title
- body text
- data json nullable
- read_at nullable
- sent_at nullable
- created_at
- updated_at

### push_tokens

- id
- user_id foreign
- token text
- device_type nullable
- last_used_at nullable
- created_at
- updated_at

### badges

- id
- name
- description text nullable
- icon nullable
- criteria json nullable
- status enum: active, inactive
- created_at
- updated_at

### child_badges

- id
- child_id foreign
- badge_id foreign
- awarded_at
- metadata json nullable
- created_at
- updated_at

### certificates

- id
- child_id foreign
- course_id foreign nullable
- track_id foreign nullable
- project_id foreign nullable
- certificate_number unique
- title
- description text nullable
- file_url nullable
- issued_at
- revoked_at nullable
- created_at
- updated_at

### support_tickets

- id
- parent_id foreign users.id
- child_id foreign nullable
- assigned_admin_id foreign users.id nullable
- subject
- message text
- status enum: open, pending, resolved, closed
- priority enum: low, normal, high, urgent
- created_at
- updated_at

### support_ticket_replies

- id
- ticket_id foreign
- user_id foreign
- message text
- attachment_url nullable
- created_at
- updated_at

### camps

- id
- title
- slug unique
- description text nullable
- camp_type enum: easter, summer, weekend, special
- start_date
- end_date
- location nullable
- delivery_mode enum: physical, online, hybrid
- price decimal nullable
- status enum: draft, published, closed, completed
- created_at
- updated_at

### camp_registrations

- id
- camp_id foreign
- parent_id foreign users.id
- child_id foreign
- status enum: pending, confirmed, cancelled, completed
- payment_status enum: unpaid, paid, refunded
- created_at
- updated_at

### kits

- id
- name
- slug unique
- description text nullable
- kit_type enum: hardware, software, hybrid
- price decimal nullable
- contents json nullable
- image_url nullable
- status enum: draft, active, inactive
- created_at
- updated_at

### kit_orders

- id
- parent_id foreign users.id
- child_id foreign nullable
- kit_id foreign
- quantity integer default 1
- amount decimal
- status enum: pending, paid, processing, shipped, delivered, cancelled
- delivery_address text nullable
- metadata json nullable
- created_at
- updated_at

### schools

- id
- name
- contact_name nullable
- contact_email nullable
- contact_phone nullable
- address nullable
- city nullable
- state nullable
- status enum: prospect, active, inactive
- created_at
- updated_at

### school_students

- id
- school_id foreign
- child_id foreign
- class_level nullable
- status enum: active, inactive
- created_at
- updated_at

### audit_logs

- id
- user_id foreign nullable
- action
- entity_type
- entity_id nullable
- old_values json nullable
- new_values json nullable
- ip_address nullable
- user_agent nullable
- created_at

### settings

- id
- key unique
- value json nullable
- created_at
- updated_at

---

## 12. Backend Architecture

### Laravel Modules

- Auth
- Users
- Children
- Learning
- Projects
- Mentorship
- LiveClasses
- Subscriptions
- Payments
- Notifications
- Rewards
- Admin
- Support
- Camps
- Kits
- Schools
- Reports
- Settings

### Recommended Packages

- Laravel latest stable.
- Laravel Sanctum.
- Spatie Laravel Permission.
- Filament Admin.
- Laravel Queues.
- Laravel Scheduler.
- Laravel Storage.
- Redis optional for queues/cache.
- Paystack PHP package or custom Paystack service.

### API Standards

Base URL:

`https://api.tinkerpod.ng/api/v1`

Success response:

```json
{
  "success": true,
  "message": "Request successful",
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {}
}
```

HTTP codes:

- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 422 Validation Error
- 500 Server Error

---

## 13. API Endpoints

### Auth

- POST /auth/register
- POST /auth/login
- POST /auth/logout
- POST /auth/forgot-password
- POST /auth/reset-password
- POST /auth/verify-email
- POST /auth/verify-phone
- GET /me

### Parent

- GET /parent/profile
- PUT /parent/profile
- PUT /parent/password
- GET /parent/dashboard
- GET /parent/children
- POST /parent/children
- GET /parent/children/{id}
- PUT /parent/children/{id}
- DELETE /parent/children/{id}
- POST /parent/children/{id}/set-pin
- POST /parent/children/{id}/switch

### Child App

- GET /child/{child}/dashboard
- GET /child/{child}/courses
- GET /child/{child}/courses/{course}
- GET /child/{child}/lessons/{lesson}
- POST /child/{child}/lessons/{lesson}/progress
- POST /child/{child}/lessons/{lesson}/complete
- GET /child/{child}/projects
- GET /child/{child}/projects/{project}
- POST /child/{child}/projects/{project}/submit
- GET /child/{child}/submissions
- GET /child/{child}/submissions/{submission}
- GET /child/{child}/badges
- GET /child/{child}/certificates
- GET /child/{child}/live-classes
- POST /child/{child}/live-classes/{id}/register
- GET /child/{child}/pod
- GET /child/{child}/mentor-feedback

### Learning

- GET /tracks
- GET /tracks/{slug}
- GET /courses
- GET /courses/{slug}
- GET /courses/{course}/modules
- GET /modules/{module}/lessons

### Subscriptions and Payments

- GET /plans
- GET /parent/subscription
- POST /subscriptions/initialize
- POST /subscriptions/verify
- POST /subscriptions/cancel
- POST /payments/paystack/webhook
- POST /payments/flutterwave/webhook

### Notifications

- GET /notifications
- POST /notifications/{id}/read
- POST /push-tokens
- DELETE /push-tokens/{id}

### Support

- GET /support/tickets
- POST /support/tickets
- GET /support/tickets/{id}
- POST /support/tickets/{id}/reply

### Camps

- GET /camps
- GET /camps/{slug}
- POST /camps/{id}/register

### Kits

- GET /kits
- GET /kits/{slug}
- POST /kits/{id}/order

---

## 14. React Native Expo App Design

### Recommended Stack

- Expo latest stable.
- TypeScript.
- React Navigation.
- TanStack Query.
- Axios.
- Expo SecureStore.
- Expo Notifications.
- Expo ImagePicker/FileSystem.
- Expo AV or video player package.
- NativeWind or StyleSheet design system.
- React Hook Form + Zod.

### Design System

Brand feel:

- Playful
- Bright
- Rounded
- Clean
- Kid-friendly
- Modern/startup-like

Colors:

- Primary teal: #00B8A9
- Deep navy: #101B4D
- Orange: #FF6B00
- Yellow: #FFC928
- Purple: #6C4CF6
- Green: #63C132
- Coral: #FF5A5F
- Blue: #168BFF
- Background: #FFFFFF / #F8FAFC

Recommended app font:

- Nunito

### Key Mobile Screens

- Splash
- Onboarding
- Register/Login
- Forgot Password
- Parent Home
- Add/Edit Child
- Child Switcher
- Subscription Plans
- Checkout
- Course Catalog
- Course Detail
- Lesson Player
- Project Detail
- Project Submission
- Submission Status
- Mentor Feedback
- Live Classes
- Rewards
- Notifications
- Account
- Support

---

## 15. Access Control Rules

### Parent

Parent can only access:

- Own profile.
- Own children.
- Own subscription.
- Own payment history.
- Own child progress/submissions.

### Child

Child access is parent-controlled.

Backend must verify:

- Child belongs to authenticated parent.
- Parent has active subscription or content is free.
- Child is eligible for course/track.

### Mentor

Mentor can only access:

- Assigned pods.
- Children in assigned pods.
- Assigned submissions.
- Live classes assigned to them.

### Admin

Admin access uses roles/permissions.

Roles:

- super_admin
- admin
- content_manager
- mentor
- support
- finance

---

## 16. File Uploads

Upload types:

- Profile avatars
- Course thumbnails
- Lesson attachments
- Project submission files
- Review attachments
- Certificates
- Camp/kits images

Production storage:

- S3-compatible storage.

Accepted file types:

- Images: jpg, jpeg, png, webp
- Videos: mp4, mov
- Documents: pdf, docx
- Archives optional: zip

File size limits:

- Avatar: 2MB
- Image: 5MB
- PDF: 10MB
- Video: 100MB MVP, preferably link for large videos

---

## 17. Notifications and Scheduled Jobs

Scheduled jobs:

- Live class reminder 24 hours before.
- Live class reminder 1 hour before.
- Project due reminder.
- Daily expired subscription check.
- Subscription renewal reminder 7 days before.
- Weekly inactive learner reminder.
- Monthly parent progress summary.

Queue jobs:

- Send email.
- Send push notification.
- Process file upload.
- Generate certificate PDF.
- Export reports.
- Handle payment webhook.

---

## 18. Parent Progress Report

Report includes:

- Child name.
- Active course.
- Lessons completed.
- Projects submitted.
- Mentor feedback summary.
- Badges earned.
- Live class attendance.
- Recommended next step.

MVP:

- Display in app.
- Monthly notification.

Post-MVP:

- PDF report.
- Email/WhatsApp report.

---

## 19. Security and Child Safety

### Security

- Passwords hashed.
- API authentication with Sanctum.
- Rate limit auth endpoints.
- Validate uploads.
- Use signed URLs for private files.
- Validate payment webhook signatures.
- Audit admin actions.
- Use role-based permissions.
- Never expose another parent’s child data.

### Child Safety

- Parent owns child account.
- Public project sharing requires parent consent.
- No public full child name by default.
- Mentor-child messaging should be monitored/logged if added later.
- Admin moderates public gallery.
- Parents can request child data removal.

---

## 20. Analytics

Track:

- Signups
- Child profiles created
- Subscription conversions
- Course enrollments
- Lesson completions
- Project submissions
- Mentor reviews
- Live class attendance
- Active learners
- Churn/expired subscriptions
- Revenue
- Popular tracks

Optional:

- Firebase Analytics for mobile.

---

## 21. Landing Page Requirements

Sections:

- Hero
- What is TinkerPod
- How it works
- What kids learn
- Mentor-led learning pods
- Projects
- Pricing
- TinkerPod for Schools
- TinkerPod Camps
- TinkerPod for Young Founders
- FAQ
- CTA
- Contact
- Privacy/Terms

Pre-launch CTA:

- Join Waitlist
- Talk to Us on WhatsApp
- Register Interest

Post-launch CTA:

- Download on Play Store
- Download on App Store
- Get Started

---

## 22. Build Phases

### Phase 1: Foundation

- Laravel setup.
- Auth.
- Roles/permissions.
- Parent/child profiles.
- Admin dashboard setup.
- Plans/subscriptions.
- Paystack payment.
- App setup with auth and onboarding.

### Phase 2: Learning Core

- Tracks.
- Courses.
- Modules.
- Lessons.
- Lesson progress.
- Course enrollment.
- App learning screens.

### Phase 3: Projects and Mentors

- Projects.
- Submissions.
- Mentor profiles.
- Pods.
- Mentor review.
- Parent/child feedback screens.

### Phase 4: Live Classes and Notifications

- Live class management.
- Join class links.
- Attendance.
- Expo push notifications.
- Email notifications.
- Reminders.

### Phase 5: Rewards and Reports

- Badges.
- Certificates.
- Parent progress reports.
- Admin reports.
- Dashboard analytics.

### Phase 6: Ecosystem Extensions

- Camps.
- Kits.
- Schools.
- Young Founders pathway.
- Project gallery.

---

## 23. Acceptance Criteria

### Parent

- Parent can register/login.
- Parent can add child.
- Parent can subscribe and pay.
- Parent can view child learning progress.
- Parent can see mentor feedback.
- Parent can view live class schedule.
- Parent can receive notifications.

### Child

- Child can access unlocked courses.
- Child can watch lessons.
- Child progress is saved.
- Child can submit project.
- Child can receive feedback.
- Child can see badges/certificates.
- Child can join live class.

### Mentor

- Mentor can view assigned pods.
- Mentor can see learner submissions.
- Mentor can review submissions.
- Mentor can send feedback.
- Feedback appears in child/parent app.

### Admin

- Admin can manage all users.
- Admin can create courses/modules/lessons.
- Admin can manage subscriptions/payments.
- Admin can assign mentors/pods.
- Admin can manage projects/submissions.
- Admin can manage live classes.
- Admin can view reports.

---

## 24. Recommended MVP Decisions

To start fast:

- Child access should be parent-controlled with child profile switching and optional child PIN.
- Use Paystack first.
- Use Zoom/Google Meet links for live classes.
- Use Vimeo/Bunny Stream for videos.
- Use text feedback first; allow file attachment later.
- Standard plan should include mentor review.
- Basic plan should not include live mentor review.
- One child per plan by default; add-on for extra child.
- Public gallery should be post-MVP.
- Kits, schools, camps should exist in admin but can launch after the core Academy MVP.

---

## 25. Cursor/Codex Build Prompts

### Backend Prompt

Build a Laravel API backend for TinkerPod using Laravel latest stable, Sanctum authentication, Spatie Permission, MySQL, Filament admin dashboard, modular controllers/services, REST API versioning under `/api/v1`, models and migrations based on this PRD, policies for parent/child/mentor/admin access, Paystack integration for subscription payments, Expo push notification support, and Laravel Storage for file uploads.

### Mobile App Prompt

Build a React Native Expo app for TinkerPod using TypeScript, React Navigation, TanStack Query, Axios, Expo SecureStore, Expo Notifications, Expo ImagePicker/FileSystem, a rounded colorful TinkerPod design system, and parent/child flows for onboarding, subscriptions, courses, lessons, projects, live classes, rewards, notifications, and account management.

### Admin Dashboard Prompt

Build the admin dashboard using Laravel Filament with resources for users, parents, children, mentors, pods, tracks, courses, modules, lessons, quizzes, projects, submissions, live classes, plans, subscriptions, transactions, badges, certificates, camps, kits, schools, support tickets, reports, settings, roles, and audit logs.

---

## 26. Open Decisions

Finalize before coding:

- Should child have a separate login or only parent-controlled profile switching?
- Which video hosting provider will be used?
- Paystack only or Paystack + Flutterwave?
- Should mentor feedback be text only in MVP or include audio/video?
- Should live classes be Zoom, Google Meet, or custom links?
- Should Basic plan include mentor review or only Standard/Premium?
- How many children are included per subscription plan?
- Should public project gallery be in MVP or later?
- Will TinkerPod Kit be orderable in MVP or later?
- Will schools be supported in MVP or phase 2?

---

## 27. Final Product Definition

TinkerPod MVP is a mobile-first edtech subscription platform where parents manage children’s year-round tech learning, children learn through structured courses and projects, mentors guide small learning pods, and admins manage the full learning ecosystem through a dashboard.

The MVP must deliver:

- Parent onboarding.
- Child profiles.
- Subscription and payment.
- Course learning.
- Project submission.
- Mentor feedback.
- Live class schedule.
- Progress tracking.
- Admin management.

This foundation should be built cleanly enough to support future expansion into TinkerPod Academy, Live, Projects, Mentors, Kit, Camps, Schools, and Young Founders.
