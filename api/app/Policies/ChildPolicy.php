<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Child;
use App\Models\User;

class ChildPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->tokenCan('parent:*');
    }

    public function view(User $user, Child $child): bool
    {
        return $user->tokenCan('parent:*') && $child->parent_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->tokenCan('parent:*');
    }

    public function update(User $user, Child $child): bool
    {
        return $user->tokenCan('parent:*') && $child->parent_id === $user->id;
    }

    public function delete(User $user, Child $child): bool
    {
        return $user->tokenCan('parent:*') && $child->parent_id === $user->id;
    }
}
