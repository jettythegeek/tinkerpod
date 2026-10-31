<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Enums\PermissionName;
use App\Models\User;
use Filament\Actions\Action;
use Filament\Actions\EditAction;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Model;

abstract class CurriculumResource extends PermissionGatedResource
{
    protected static string|\UnitEnum|null $navigationGroup = 'Curriculum';

    public static function viewPermission(): PermissionName
    {
        return PermissionName::ViewCurriculum;
    }

    public static function managePermission(): ?PermissionName
    {
        return PermissionName::ManageCurriculum;
    }

    public static function publishPermission(): PermissionName
    {
        return PermissionName::PublishCurriculum;
    }

    public static function canViewAny(): bool
    {
        $user = auth()->user();

        if (! $user instanceof User) {
            return false;
        }

        return $user->can(PermissionName::ViewCurriculum->value)
            || $user->can(PermissionName::ViewContent->value);
    }

    protected static function canManage(): bool
    {
        $user = auth()->user();

        if (! $user instanceof User) {
            return false;
        }

        return $user->can(PermissionName::ManageCurriculum->value)
            || $user->can(PermissionName::ManageContent->value);
    }

    public static function canPublish(): bool
    {
        $user = auth()->user();

        if (! $user instanceof User) {
            return false;
        }

        return $user->can(PermissionName::PublishCurriculum->value)
            || $user->can(PermissionName::PublishContent->value);
    }

    public static function publishRecord(Model $record, ?string $reason = null): void
    {
        if (! static::canPublish()) {
            throw new AuthorizationException('You do not have permission to publish curriculum content.');
        }

        $actor = auth()->user();
        if (method_exists($record, 'publish')) {
            $record->publish(
                $actor instanceof User ? $actor : null,
                $reason ?? 'Published from Filament curriculum resource.'
            );
        }
    }

    public static function archiveRecord(Model $record, ?string $reason = null): void
    {
        if (! static::canPublish()) {
            throw new AuthorizationException('You do not have permission to archive curriculum content.');
        }

        $actor = auth()->user();
        if (method_exists($record, 'archive')) {
            $record->archive(
                $actor instanceof User ? $actor : null,
                $reason ?? 'Archived from Filament curriculum resource.'
            );
        }
    }

    /**
     * @return list<Action|EditAction>
     */
    protected static function publicationActions(): array
    {
        return [
            EditAction::make(),
            Action::make('publish')
                ->label('Publish')
                ->color('success')
                ->visible(static fn (): bool => static::canPublish())
                ->action(static fn (Model $record) => static::publishRecord($record)),
            Action::make('archive')
                ->label('Archive')
                ->color('warning')
                ->visible(static fn (): bool => static::canPublish())
                ->action(static fn (Model $record) => static::archiveRecord($record)),
        ];
    }
}
