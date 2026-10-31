<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\ContentStatus;
use App\Models\Child;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonAttachment;
use App\Models\Module;
use App\Models\Pod;
use App\Models\Track;
use App\Models\User;
use App\Models\World;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class LessonAttachmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_private_attachments_use_short_lived_signed_urls_gated_by_learning_access_and_reject_expired_or_tampered_links(): void
    {
        Storage::fake('local');

        $parent = User::factory()->create();
        $enrolledChild = Child::factory()->for($parent, 'parent')->create(['first_name' => 'Tobi']);

        $otherParent = User::factory()->create();
        $unenrolledChild = Child::factory()->for($otherParent, 'parent')->create(['first_name' => 'Ngozi']);

        $pod = Pod::factory()->create(['status' => ContentStatus::Published]);
        $track = Track::factory()->for($pod)->create(['status' => ContentStatus::Published]);
        $course = Course::factory()->for($pod)->for($track)->create(['status' => ContentStatus::Published]);
        $world = World::factory()->for($pod)->for($course)->create(['status' => ContentStatus::Published]);
        $module = Module::factory()->for($course)->create(['status' => ContentStatus::Published]);

        $publishedLesson = Lesson::factory()
            ->for($world)
            ->for($module)
            ->create([
                'title' => 'Repeat and Count',
                'status' => ContentStatus::Published,
            ]);

        $draftLesson = Lesson::factory()
            ->for($world)
            ->for($module)
            ->create([
                'title' => 'Draft Lesson',
                'status' => ContentStatus::Draft,
            ]);

        $fileContents = "# TinkerPod Loops Worksheet\nfor i in range(3):\n    print(i)\n";
        Storage::disk('local')->put('lessons/loops-worksheet.py', $fileContents);

        $attachment = LessonAttachment::factory()
            ->for($publishedLesson, 'lesson')
            ->create([
                'title' => 'Loops Starter Code',
                'disk' => 'local',
                'storage_path' => 'lessons/loops-worksheet.py',
                'original_filename' => 'loops-worksheet.py',
                'mime_type' => 'text/x-python',
                'size_bytes' => strlen($fileContents),
            ]);

        $draftAttachment = LessonAttachment::factory()
            ->for($draftLesson, 'lesson')
            ->create([
                'title' => 'Draft Notes',
                'disk' => 'local',
                'storage_path' => 'lessons/loops-worksheet.py',
            ]);

        $enrollment = Enrollment::factory()->for($enrolledChild)->for($pod)->create(['status' => 'active']);

        $enrolledToken = $enrolledChild->createToken('enrolled-tablet', ['child:*'])->plainTextToken;
        $unenrolledToken = $unenrolledChild->createToken('unenrolled-tablet', ['child:*'])->plainTextToken;

        // 1. Enrolled child gets a 5-minute signed URL
        $signedRes = $this->withToken($enrolledToken)
            ->postJson("/api/v1/kid/lessons/{$publishedLesson->public_id}/attachments/{$attachment->public_id}/signed-url");

        $signedRes->assertOk()
            ->assertJsonPath('data.attachment.id', $attachment->public_id)
            ->assertJsonPath('data.ttl_seconds', 300);

        $signedUrl = (string) $signedRes->json('data.signed_url');
        $this->assertNotEmpty($signedUrl);

        // 2. Valid signed URL downloads the private file
        $downloadRes = $this->get($signedUrl);
        $downloadRes->assertOk();
        $this->assertSame($fileContents, $downloadRes->streamedContent());

        // 3. Tampered signed URL is rejected with 403
        $tamperedSignatureUrl = $signedUrl.'tampered';
        $this->getJson($tamperedSignatureUrl)->assertForbidden();

        $tamperedChildUrl = str_replace(
            'child='.$enrolledChild->public_id,
            'child='.$unenrolledChild->public_id,
            $signedUrl
        );
        $this->getJson($tamperedChildUrl)->assertForbidden();

        // 4. Unenrolled child or draft lesson cannot obtain a signed URL (403)
        $this->withToken($unenrolledToken)
            ->postJson("/api/v1/kid/lessons/{$publishedLesson->public_id}/attachments/{$attachment->public_id}/signed-url")
            ->assertForbidden();

        $this->withToken($enrolledToken)
            ->postJson("/api/v1/kid/lessons/{$draftLesson->public_id}/attachments/{$draftAttachment->public_id}/signed-url")
            ->assertForbidden();

        // 5. Expired signed URL (after 6 minutes) is rejected with 403
        $this->travel(6)->minutes();
        $this->getJson($signedUrl)->assertForbidden();
        $this->travelBack();

        // 6. If enrollment is revoked before expiry, even a valid signature is rejected by LearningAccess
        $freshSignedUrl = (string) $this->withToken($enrolledToken)
            ->postJson("/api/v1/kid/lessons/{$publishedLesson->public_id}/attachments/{$attachment->public_id}/signed-url")
            ->json('data.signed_url');

        $enrollment->update(['status' => 'paused']);
        $this->getJson($freshSignedUrl)->assertForbidden();
    }
}
