<?php

declare(strict_types=1);

namespace App\Filament\Resources\WorldResource\Pages;

use App\Filament\Resources\WorldResource;
use Filament\Resources\Pages\CreateRecord;

class CreateWorld extends CreateRecord
{
    protected static string $resource = WorldResource::class;
}
