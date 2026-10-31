<?php

declare(strict_types=1);

namespace App\Filament\Resources\TrackResource\Pages;

use App\Filament\Resources\TrackResource;
use Filament\Resources\Pages\EditRecord;

class EditTrack extends EditRecord
{
    protected static string $resource = TrackResource::class;
}
