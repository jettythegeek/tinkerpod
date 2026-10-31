<?php

declare(strict_types=1);

namespace App\Models\Concerns;

use App\Enums\ContentStatus;
use App\Models\PublicationLog;
use App\Services\AuditLogger;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Support\Facades\Auth;

trait HasPublicationStatus
{
    protected ?Model $pendingPublicationActor = null;

    public static function bootHasPublicationStatus(): void
    {
        static::saving(static function (self $model): void {
            if (! $model->isDirty('status')) {
                return;
            }

            $statusValue = $model->statusValue();

            if ($statusValue === ContentStatus::Published->value && $model->getAttribute('published_at') === null) {
                $model->setAttribute('published_at', now());
            }

            if ($statusValue === ContentStatus::Archived->value && $model->getAttribute('archived_at') === null) {
                $model->setAttribute('archived_at', now());
            }
        });

        static::created(static function (self $model): void {
            $toStatus = $model->statusValue();
            if ($toStatus !== ContentStatus::Draft->value) {
                $actor = $model->consumePendingPublicationActor();
                app(AuditLogger::class)->logPublicationChange(
                    subject: $model,
                    fromStatus: null,
                    toStatus: $toStatus,
                    actor: $actor,
                );
            }
        });

        static::updated(static function (self $model): void {
            if (! $model->wasChanged('status')) {
                return;
            }

            $rawFrom = $model->getOriginal('status');
            $fromStatus = $rawFrom instanceof ContentStatus
                ? $rawFrom->value
                : (is_string($rawFrom) ? $rawFrom : null);
            $toStatus = $model->statusValue();

            if ($fromStatus === $toStatus) {
                return;
            }

            $actor = $model->consumePendingPublicationActor();

            app(AuditLogger::class)->logPublicationChange(
                subject: $model,
                fromStatus: $fromStatus,
                toStatus: $toStatus,
                actor: $actor,
            );
        });
    }

    /**
     * @return MorphMany<PublicationLog, $this>
     */
    public function publicationLogs(): MorphMany
    {
        return $this->morphMany(
            PublicationLog::class,
            'publishable',
            'publishable_type',
            'publishable_id',
            'public_id',
        )->orderBy('id');
    }

    public function statusValue(): string
    {
        $raw = $this->getAttribute('status');

        if ($raw instanceof ContentStatus) {
            return $raw->value;
        }

        return is_string($raw) && $raw !== '' ? $raw : ContentStatus::Draft->value;
    }

    public function isPublished(): bool
    {
        return $this->statusValue() === ContentStatus::Published->value;
    }

    public function transitionStatus(ContentStatus|string $nextStatus, ?Model $actor = null): static
    {
        $this->pendingPublicationActor = $actor;
        $this->setAttribute('status', $nextStatus instanceof ContentStatus ? $nextStatus->value : $nextStatus);
        $this->save();

        return $this;
    }

    public function publish(?Model $actor = null): static
    {
        return $this->transitionStatus(ContentStatus::Published, $actor);
    }

    public function archive(?Model $actor = null): static
    {
        return $this->transitionStatus(ContentStatus::Archived, $actor);
    }

    public function markDraft(?Model $actor = null): static
    {
        return $this->transitionStatus(ContentStatus::Draft, $actor);
    }

    protected function consumePendingPublicationActor(): ?Model
    {
        $actor = $this->pendingPublicationActor;
        $this->pendingPublicationActor = null;

        if ($actor instanceof Model) {
            return $actor;
        }

        $authUser = Auth::user();

        return $authUser instanceof Model ? $authUser : null;
    }
}
