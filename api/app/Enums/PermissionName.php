<?php

declare(strict_types=1);

namespace App\Enums;

enum PermissionName: string
{
    case AccessAdminPanel = 'panel.admin.access';
    case AccessMentorPanel = 'panel.mentor.access';

    case ViewUsers = 'users.view';
    case ManageUsers = 'users.manage';
    case ManageRoles = 'roles.manage';

    case ViewChildren = 'children.view';
    case ManageChildren = 'children.manage';
    case UnlockChildren = 'children.unlock';
    case ResetChildPin = 'children.reset_pin';

    case ViewContent = 'content.view';
    case ManageContent = 'content.manage';
    case PublishContent = 'content.publish';

    case ViewPacks = 'packs.view';
    case ManagePacks = 'packs.manage';
    case PublishPacks = 'packs.publish';

    case ViewPods = 'pods.view';
    case ManagePods = 'pods.manage';

    case ViewReviews = 'reviews.view';
    case ManageReviews = 'reviews.manage';

    case ViewLiveClasses = 'live_classes.view';
    case ManageLiveClasses = 'live_classes.manage';

    case ViewGamification = 'gamification.view';
    case ManageGamification = 'gamification.manage';
    case ManageTournaments = 'tournaments.manage';

    case ViewBilling = 'billing.view';
    case ManageBilling = 'billing.manage';
    case ReconcileBilling = 'billing.reconcile';

    case ViewSupport = 'support.view';
    case ManageSupport = 'support.manage';

    case ViewAuditLogs = 'audit_logs.view';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(
            static fn (self $permission): string => $permission->value,
            self::cases(),
        );
    }
}
