<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\HasPublicUlid;
use Database\Factories\LessonAttachmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $public_id
 * @property int $lesson_id
 * @property string $title
 * @property string $disk
 * @property string $storage_path
 * @property string $original_filename
 * @property string $mime_type
 * @property int $size_bytes
 * @property int $sort_order
 */
#[Fillable([
    'public_id',
    'lesson_id',
    'title',
    'disk',
    'storage_path',
    'original_filename',
    'mime_type',
    'size_bytes',
    'sort_order',
])]
#[Hidden(['id', 'disk', 'storage_path'])]
class LessonAttachment extends Model
{
    /** @use HasFactory<LessonAttachmentFactory> */
    use HasFactory, HasPublicUlid;

    protected $table = 'lesson_attachments';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'lesson_id' => 'integer',
            'size_bytes' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Lesson, $this>
     */
    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class, 'lesson_id');
    }
}
