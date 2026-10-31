<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Kid;

use App\Domain\Learning\LearningAccess;
use App\Http\Controllers\Controller;
use App\Models\Child;
use App\Models\Lesson;
use App\Models\LessonAttachment;
use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Symfony\Component\HttpFoundation\StreamedResponse;

class KidLessonAttachmentController extends Controller
{
    public function signedUrlForLessonAttachment(
        Request $request,
        Lesson $lesson,
        LessonAttachment $attachment,
        LearningAccess $access,
    ): JsonResponse {
        if ($attachment->lesson_id !== $lesson->id) {
            return ApiResponse::error(
                message: 'Attachment not found for this lesson.',
                data: null,
                status: 404,
            );
        }

        return $this->signedUrl($request, $attachment, $access);
    }

    public function signedUrl(
        Request $request,
        LessonAttachment $attachment,
        LearningAccess $access,
    ): JsonResponse {
        $child = $this->requireChild($request);
        $child->loadMissing('enrollments');

        $attachment->load([
            'lesson.world.pod',
            'lesson.module.course.track',
        ]);

        $access->assertCanAccessAttachment($child, $attachment);

        $ttlMinutes = max(1, (int) config('tinkerpod.learning.signed_url_ttl_minutes', 5));
        $expiresAt = now()->addMinutes($ttlMinutes);

        $signedUrl = URL::temporarySignedRoute(
            'api.v1.kid.attachments.download',
            $expiresAt,
            [
                'attachment' => $attachment->public_id,
                'child' => $child->public_id,
            ]
        );

        return ApiResponse::success(
            message: 'Signed attachment URL generated.',
            data: [
                'attachment' => [
                    'id' => $attachment->public_id,
                    'title' => $attachment->title,
                    'filename' => $attachment->original_filename,
                    'mime_type' => $attachment->mime_type,
                    'size_bytes' => $attachment->size_bytes,
                ],
                'signed_url' => $signedUrl,
                'expires_at' => $expiresAt->toIso8601String(),
                'ttl_seconds' => $ttlMinutes * 60,
            ],
        );
    }

    public function download(
        Request $request,
        LessonAttachment $attachment,
        LearningAccess $access,
    ): StreamedResponse|JsonResponse {
        if (! $request->hasValidSignature()) {
            throw new AuthorizationException('This download link has expired or is invalid.');
        }

        $childPublicId = strtolower(trim((string) $request->query('child', '')));
        if ($childPublicId === '') {
            throw new AuthorizationException('This download link is missing a valid child context.');
        }

        /** @var Child|null $child */
        $child = Child::query()
            ->where('public_id', $childPublicId)
            ->with('enrollments')
            ->first();

        if ($child === null) {
            throw new AuthorizationException('This download link is invalid.');
        }

        $actor = $request->user('sanctum');
        if ($actor instanceof Child && $actor->id !== $child->id) {
            throw new AuthorizationException('This download link belongs to another child profile.');
        }

        $attachment->load([
            'lesson.world.pod',
            'lesson.module.course.track',
        ]);

        $access->assertCanAccessAttachment($child, $attachment);

        $disk = Storage::disk($attachment->disk);
        if (! $disk->exists($attachment->storage_path)) {
            return ApiResponse::error(
                message: 'Attachment file is unavailable.',
                data: null,
                status: 404,
            );
        }

        return $disk->download(
            $attachment->storage_path,
            $attachment->original_filename,
            [
                'Content-Type' => $attachment->mime_type,
                'Cache-Control' => 'private, no-store, max-age=0',
            ]
        );
    }

    private function requireChild(Request $request): Child
    {
        $actor = $request->user();
        if (! $actor instanceof Child || ! $actor->tokenCan('child:*')) {
            throw new AuthorizationException('Child authentication is required for this endpoint.');
        }

        return $actor;
    }
}
