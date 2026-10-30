<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Concerns\GatesByPermission;
use Filament\Resources\Resource;

abstract class PermissionGatedResource extends Resource
{
    use GatesByPermission;
}
