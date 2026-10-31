<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\ContentStatus;
use App\Enums\LessonCompletionMode;
use App\Models\Child;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\Pod;
use App\Models\Project;
use App\Models\Quiz;
use App\Models\QuizOption;
use App\Models\QuizQuestion;
use App\Models\Track;
use App\Models\World;
use Illuminate\Database\Seeder;

class DemoCurriculumSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $pod = Pod::query()->updateOrCreate(
            ['slug' => 'coding-pod'],
            [
                'title' => 'Coding Pod',
                'description' => 'DEMO CONTENT: Learn logic, functions, loops, and game building with Captain Jetty.',
                'icon' => 'laptop-code',
                'status' => ContentStatus::Published->value,
                'is_demo' => true,
                'sort_order' => 1,
                'published_at' => $now,
            ]
        );

        $track = Track::query()->updateOrCreate(
            ['pod_id' => $pod->id, 'slug' => 'python-adventures-demo'],
            [
                'title' => 'Python Adventures (Demo)',
                'description' => 'DEMO CONTENT: Introductory Python coding track from the TinkerPod mockups.',
                'status' => ContentStatus::Published->value,
                'is_demo' => true,
                'sort_order' => 1,
                'published_at' => $now,
            ]
        );

        $course = Course::query()->updateOrCreate(
            ['pod_id' => $pod->id, 'slug' => 'coding-pod-foundations-demo'],
            [
                'track_id' => $track->id,
                'title' => 'Coding Pod Foundations (Demo)',
                'description' => 'DEMO CONTENT: Six worlds from Welcome Island to Project Lab.',
                'difficulty' => 'Beginner',
                'status' => ContentStatus::Published->value,
                'is_demo' => true,
                'sort_order' => 1,
                'published_at' => $now,
            ]
        );

        $worldsConfig = [
            [
                'world_number' => 1,
                'slug' => 'welcome-island',
                'title' => 'Welcome Island',
                'description' => 'DEMO CONTENT: Meet Captain Jetty and run your first commands.',
                'icon' => 'island',
                'map_x' => 112,
                'map_y' => 830,
            ],
            [
                'world_number' => 2,
                'slug' => 'logic-land',
                'title' => 'Logic Land',
                'description' => 'DEMO CONTENT: Make smart choices with if and else blocks.',
                'icon' => 'puzzle',
                'map_x' => 274,
                'map_y' => 690,
            ],
            [
                'world_number' => 3,
                'slug' => 'functions-forest',
                'title' => 'Functions Forest',
                'description' => 'DEMO CONTENT: Bundle reusable commands into neat functions.',
                'icon' => 'trees',
                'map_x' => 108,
                'map_y' => 550,
            ],
            [
                'world_number' => 4,
                'slug' => 'loops-valley',
                'title' => 'Loops Valley',
                'description' => 'DEMO CONTENT: Repeat actions and count with Python loops.',
                'icon' => 'repeat',
                'map_x' => 266,
                'map_y' => 410,
            ],
            [
                'world_number' => 5,
                'slug' => 'game-builder',
                'title' => 'Game Builder',
                'description' => 'DEMO CONTENT: Combine loops and logic into playable mini-games.',
                'icon' => 'gamepad',
                'map_x' => 114,
                'map_y' => 265,
            ],
            [
                'world_number' => 6,
                'slug' => 'project-lab',
                'title' => 'Project Lab',
                'description' => 'DEMO CONTENT: Build and share your own flagship coding creation.',
                'icon' => 'flask',
                'map_x' => 222,
                'map_y' => 120,
            ],
        ];

        $worldsBySlug = [];
        foreach ($worldsConfig as $wConfig) {
            $worldsBySlug[$wConfig['slug']] = World::query()->updateOrCreate(
                ['pod_id' => $pod->id, 'slug' => $wConfig['slug']],
                [
                    'course_id' => $course->id,
                    'world_number' => $wConfig['world_number'],
                    'title' => $wConfig['title'],
                    'description' => $wConfig['description'],
                    'icon' => $wConfig['icon'],
                    'map_x' => $wConfig['map_x'],
                    'map_y' => $wConfig['map_y'],
                    'status' => ContentStatus::Published->value,
                    'is_demo' => true,
                    'sort_order' => $wConfig['world_number'],
                    'published_at' => $now,
                ]
            );
        }

        // Starter modules & lessons for Worlds 1–3 and 5–6
        $starterWorldLessons = [
            'welcome-island' => ['module_title' => 'Welcome Island Module (Demo)', 'lesson_title' => 'Hello, Captain Jetty'],
            'logic-land' => ['module_title' => 'Logic Land Module (Demo)', 'lesson_title' => 'True or False Decisions'],
            'functions-forest' => ['module_title' => 'Functions Forest Module (Demo)', 'lesson_title' => 'Build Your First Function'],
            'game-builder' => ['module_title' => 'Game Builder Module (Demo)', 'lesson_title' => 'Score Counter Loop'],
            'project-lab' => ['module_title' => 'Project Lab Module (Demo)', 'lesson_title' => 'Launch Pad Showcase'],
        ];

        foreach ($starterWorldLessons as $worldSlug => $meta) {
            $world = $worldsBySlug[$worldSlug];
            $module = Module::query()->updateOrCreate(
                ['course_id' => $course->id, 'slug' => $worldSlug.'-module-demo'],
                [
                    'title' => $meta['module_title'],
                    'description' => 'DEMO CONTENT: Module for '.$world->title,
                    'status' => ContentStatus::Published->value,
                    'is_demo' => true,
                    'sort_order' => $world->world_number,
                    'published_at' => $now,
                ]
            );

            Lesson::query()->updateOrCreate(
                ['world_id' => $world->id, 'slug' => $worldSlug.'-lesson-1'],
                [
                    'module_id' => $module->id,
                    'lesson_number' => 1,
                    'title' => $meta['lesson_title'],
                    'summary' => 'DEMO CONTENT: Starter lesson in '.$world->title.'.',
                    'body' => 'Welcome to '.$world->title.'! Follow Captain Jetty through each step.',
                    'learning_objectives' => [
                        'Explore '.$world->title.' with Captain Jetty',
                        'Run starter Python code blocks',
                    ],
                    'thumbnail_asset' => 'design/assets/pip/pip-idle.svg',
                    'intro_video_url' => null,
                    'intro_video_duration_seconds' => 60,
                    'duration_minutes' => 6,
                    'difficulty' => 'Beginner',
                    'steps_count' => 4,
                    'completion_mode' => LessonCompletionMode::Manual->value,
                    'required_watch_percent' => 80,
                    'reward_xp_preview' => 40,
                    'reward_coins_preview' => 10,
                    'reward_gems_preview' => 0,
                    'status' => ContentStatus::Published->value,
                    'is_demo' => true,
                    'sort_order' => 1,
                    'published_at' => $now,
                ]
            );
        }

        // World 4: Loops Valley (5 lessons, featuring Lesson 2 "Repeat and Count")
        $loopsWorld = $worldsBySlug['loops-valley'];
        $loopsModule = Module::query()->updateOrCreate(
            ['course_id' => $course->id, 'slug' => 'loops-valley-module-demo'],
            [
                'title' => 'Loops Valley (Demo)',
                'description' => 'DEMO CONTENT: Master Python for-loops and range() with Captain Jetty.',
                'status' => ContentStatus::Published->value,
                'is_demo' => true,
                'sort_order' => 4,
                'published_at' => $now,
            ]
        );

        $loopsLessons = [
            [
                'lesson_number' => 1,
                'slug' => 'meet-the-loop',
                'title' => 'Meet the Loop',
                'summary' => 'Discover why coders use loops instead of repeating lines of code.',
                'completion_mode' => LessonCompletionMode::Manual->value,
            ],
            [
                'lesson_number' => 2,
                'slug' => 'repeat-and-count',
                'title' => 'Repeat and Count',
                'summary' => 'Teach Captain Jetty to repeat actions without typing the same code ten times.',
                'completion_mode' => LessonCompletionMode::QuizPass->value,
            ],
            [
                'lesson_number' => 3,
                'slug' => 'count-by-twos',
                'title' => 'Count by Twos',
                'summary' => 'Step through numbers faster using range(start, stop, step).',
                'completion_mode' => LessonCompletionMode::Manual->value,
            ],
            [
                'lesson_number' => 4,
                'slug' => 'nested-patterns',
                'title' => 'Nested Patterns',
                'summary' => 'Place a loop inside a loop to draw star grids.',
                'completion_mode' => LessonCompletionMode::Manual->value,
            ],
            [
                'lesson_number' => 5,
                'slug' => 'loops-valley-checkpoint',
                'title' => 'Loops Valley Checkpoint',
                'summary' => 'Help Captain Jetty power the bridge across Loops Valley.',
                'completion_mode' => LessonCompletionMode::Manual->value,
            ],
        ];

        foreach ($loopsLessons as $lItem) {
            Lesson::query()->updateOrCreate(
                ['world_id' => $loopsWorld->id, 'slug' => $lItem['slug']],
                [
                    'module_id' => $loopsModule->id,
                    'lesson_number' => $lItem['lesson_number'],
                    'title' => $lItem['title'],
                    'summary' => $lItem['summary'],
                    'body' => "In this demo lesson, Captain Jetty shows how Python's `for i in range(n):` loop repeats commands cleanly and accurately.",
                    'learning_objectives' => [
                        'Understand why loops save time',
                        'Write a simple repeat block',
                        'Count from 1 to 10 with a loop',
                        'Fix a loop that runs one too many times',
                    ],
                    'thumbnail_asset' => 'design/assets/pip/pip-idle.svg',
                    'intro_video_url' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                    'intro_video_duration_seconds' => 80,
                    'duration_minutes' => 8,
                    'difficulty' => 'Beginner',
                    'steps_count' => 5,
                    'completion_mode' => $lItem['completion_mode'],
                    'required_watch_percent' => 80,
                    'reward_xp_preview' => 50,
                    'reward_coins_preview' => 15,
                    'reward_gems_preview' => 1,
                    'status' => ContentStatus::Published->value,
                    'is_demo' => true,
                    'sort_order' => $lItem['lesson_number'],
                    'published_at' => $now,
                ]
            );
        }

        $repeatAndCountLesson = Lesson::query()
            ->where('world_id', $loopsWorld->id)
            ->where('slug', 'repeat-and-count')
            ->firstOrFail();

        Project::query()->updateOrCreate(
            ['lesson_id' => $repeatAndCountLesson->id, 'title' => 'Build a Counter Loop'],
            [
                'description' => 'DEMO CONTENT: Guided mini-project for Repeat and Count.',
                'starter_code' => "for i in range(3):\n    print(i)\n",
                'language' => 'python',
                'steps_count' => 5,
                'status' => ContentStatus::Published->value,
                'is_demo' => true,
                'sort_order' => 1,
                'published_at' => $now,
            ]
        );

        $quiz = Quiz::query()->updateOrCreate(
            ['lesson_id' => $repeatAndCountLesson->id, 'title' => 'Repeat and Count: range() Quiz'],
            [
                'description' => 'DEMO CONTENT: Practice how Python range() loops count numbers.',
                'pass_mark_percent' => 75,
                'max_attempts' => 3,
                'status' => ContentStatus::Published->value,
                'is_demo' => true,
                'sort_order' => 1,
                'published_at' => $now,
            ]
        );

        $questionsData = [
            [
                'question_number' => 1,
                'prompt' => 'Where does Python range(3) start counting from?',
                'code_snippet' => "for i in range(3):\n    print(i)",
                'hint' => 'Remember: Python starts counting at 0.',
                'explanation' => 'Python range() starts at 0 unless you give it a custom starting number.',
                'options' => [
                    ['key' => 'A', 'label' => '0', 'is_correct' => true],
                    ['key' => 'B', 'label' => '1', 'is_correct' => false],
                    ['key' => 'C', 'label' => '3', 'is_correct' => false],
                    ['key' => 'D', 'label' => '-1', 'is_correct' => false],
                ],
            ],
            [
                'question_number' => 2,
                'prompt' => 'What will this loop print?',
                'code_snippet' => "for i in range(3):\n    print(i)",
                'hint' => 'Remember: range(3) starts at 0 and stops before 3.',
                'explanation' => 'range(3) starts at 0 and stops before 3, so it prints 0, 1, and 2.',
                'options' => [
                    ['key' => 'A', 'label' => '0  1  2', 'is_correct' => true],
                    ['key' => 'B', 'label' => '1  2  3', 'is_correct' => false],
                    ['key' => 'C', 'label' => '0  1  2  3', 'is_correct' => false],
                    ['key' => 'D', 'label' => '3  2  1', 'is_correct' => false],
                ],
            ],
            [
                'question_number' => 3,
                'prompt' => 'How many times will this loop repeat?',
                'code_snippet' => "for step in range(5):\n    move_forward()",
                'hint' => 'Count the numbers 0, 1, 2, 3, and 4.',
                'explanation' => 'range(5) produces five numbers (0, 1, 2, 3, 4), so the loop repeats 5 times.',
                'options' => [
                    ['key' => 'A', 'label' => '4 times', 'is_correct' => false],
                    ['key' => 'B', 'label' => '5 times', 'is_correct' => true],
                    ['key' => 'C', 'label' => '6 times', 'is_correct' => false],
                    ['key' => 'D', 'label' => '1 time', 'is_correct' => false],
                ],
            ],
            [
                'question_number' => 4,
                'prompt' => 'Which loop prints only 0 and 1?',
                'code_snippet' => '# Choose the loop that stops before 2',
                'hint' => 'range(n) stops right before n.',
                'explanation' => 'range(2) starts at 0 and stops before 2, printing 0 and 1.',
                'options' => [
                    ['key' => 'A', 'label' => 'for i in range(1):', 'is_correct' => false],
                    ['key' => 'B', 'label' => 'for i in range(2):', 'is_correct' => true],
                    ['key' => 'C', 'label' => 'for i in range(3):', 'is_correct' => false],
                    ['key' => 'D', 'label' => 'for i in range(0):', 'is_correct' => false],
                ],
            ],
        ];

        foreach ($questionsData as $qData) {
            $question = QuizQuestion::query()->updateOrCreate(
                [
                    'quiz_id' => $quiz->id,
                    'question_number' => $qData['question_number'],
                ],
                [
                    'prompt' => $qData['prompt'],
                    'code_snippet' => $qData['code_snippet'],
                    'hint' => $qData['hint'],
                    'explanation' => $qData['explanation'],
                    'points' => 10,
                    'sort_order' => $qData['question_number'],
                ]
            );

            foreach ($qData['options'] as $optIndex => $optData) {
                QuizOption::query()->updateOrCreate(
                    [
                        'quiz_question_id' => $question->id,
                        'option_key' => $optData['key'],
                    ],
                    [
                        'label' => $optData['label'],
                        'is_correct' => $optData['is_correct'],
                        'sort_order' => $optIndex + 1,
                    ]
                );
            }
        }

        // Enroll any existing child profiles in the demo Coding Pod
        foreach (Child::query()->cursor() as $child) {
            Enrollment::query()->firstOrCreate(
                ['child_id' => $child->id, 'pod_id' => $pod->id],
                ['status' => 'active', 'enrolled_at' => $now]
            );
        }
    }
}
