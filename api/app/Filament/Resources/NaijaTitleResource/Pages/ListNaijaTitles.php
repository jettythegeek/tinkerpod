<?php

declare(strict_types=1);

namespace App\Filament\Resources\NaijaTitleResource\Pages;

use App\Filament\Resources\NaijaTitleResource;
use Filament\Resources\Pages\ListRecords;

class ListNaijaTitles extends ListRecords
{
    protected static string $resource = NaijaTitleResource::class;
}
