<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Lesson;
use App\Models\LessonAttachment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LessonAttachment>
 */
class LessonAttachmentFactory extends Factory
{
    protected $model = LessonAttachment::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'lesson_id' => Lesson::factory(),
            'title' => 'Loops Starter Worksheet',
            'disk' => 'local',
            'storage_path' => 'lessons/starter-worksheet.py',
            'original_filename' => 'starter-worksheet.py',
            'mime_type' => 'text/x-python',
            'size_bytes' => 128,
            'sort_order' => 1,
        ];
    }
}
