<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\StreakSettingResource\Pages\CreateStreakSetting;
use App\Filament\Resources\StreakSettingResource\Pages\EditStreakSetting;
use App\Filament\Resources\StreakSettingResource\Pages\ListStreakSettings;
use App\Models\StreakSetting;
use Filament\Actions\EditAction;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Pages\PageRegistration;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class StreakSettingResource extends RewardsResource
{
    protected static ?string $model = StreakSetting::class;

    protected static string|\BackedEnum|null $navigationIcon = Heroicon::OutlinedFire;

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('grace_days')
                ->label('Grace Days Allowed')
                ->numeric()
                ->default(1)
                ->required(),
            TextInput::make('timezone')
                ->default('Africa/Lagos')
                ->required()
                ->maxLength(64),
            TextInput::make('version')
                ->numeric()
                ->default(1)
                ->required(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('grace_days')->label('Grace Days')->sortable(),
                TextColumn::make('timezone')->label('Timezone'),
                TextColumn::make('version')->label('Version')->badge()->sortable(),
                TextColumn::make('updated_at')->dateTime()->sortable(),
            ])
            ->recordActions([
                EditAction::make(),
            ]);
    }

    /**
     * @return array<string, PageRegistration>
     */
    public static function getPages(): array
    {
        return [
            'index' => ListStreakSettings::route('/'),
            'create' => CreateStreakSetting::route('/create'),
            'edit' => EditStreakSetting::route('/{record}/edit'),
        ];
    }
}
