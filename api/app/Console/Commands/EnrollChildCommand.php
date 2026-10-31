<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Child;
use App\Models\Enrollment;
use App\Models\Pod;
use Illuminate\Console\Command;

class EnrollChildCommand extends Command
{
    /**
     * @var string
     */
    protected $signature = 'tinkerpod:enroll {username : Child username} {pod : Pod slug, public_id, or title}';

    /**
     * @var string
     */
    protected $description = 'Enroll a child profile in a pod by username and pod slug/public_id.';

    public function handle(): int
    {
        $username = strtolower(trim((string) $this->argument('username')));
        $podIdentifier = trim((string) $this->argument('pod'));

        /** @var Child|null $child */
        $child = Child::query()
            ->whereRaw('LOWER(username) = ?', [$username])
            ->first();

        if ($child === null) {
            $this->error("Child with username '{$username}' was not found.");

            return self::FAILURE;
        }

        /** @var Pod|null $pod */
        $pod = Pod::query()
            ->where('slug', strtolower($podIdentifier))
            ->orWhere('public_id', $podIdentifier)
            ->orWhereRaw('LOWER(title) = ?', [strtolower($podIdentifier)])
            ->first();

        if ($pod === null) {
            $this->error("Pod '{$podIdentifier}' was not found.");

            return self::FAILURE;
        }

        $enrollment = Enrollment::query()->updateOrCreate(
            [
                'child_id' => $child->id,
                'pod_id' => $pod->id,
            ],
            [
                'status' => 'active',
                'enrolled_at' => now(),
            ],
        );

        $this->info("Enrolled child '{$child->username}' in pod '{$pod->slug}' (enrollment #{$enrollment->id}).");

        return self::SUCCESS;
    }
}
