<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\RewardLevelResource\Pages\CreateRewardLevel;
use App\Filament\Resources\RewardLevelResource\Pages\EditRewardLevel;
use App\Filament\Resources\RewardLevelResource\Pages\ListRewardLevels;
use App\Models\RewardLevel;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Pages\PageRegistration;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class RewardLevelResource extends RewardsResource
{
    protected static ?string $model = RewardLevel::class;

    protected static string|\BackedEnum|null $navigationIcon = Heroicon::OutlinedChartBar;

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('level_number')
                ->label('Level Number')
                ->numeric()
                ->required(),
            TextInput::make('xp_required')
                ->label('Cumulative XP Required')
                ->numeric()
                ->required(),
            Select::make('naija_title_id')
                ->relationship('naijaTitle', 'name')
                ->label('Naija Title'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('level_number')->label('Level')->sortable(),
                TextColumn::make('xp_required')->label('XP Required')->sortable(),
                TextColumn::make('naijaTitle.name')->label('Naija Title')->sortable(),
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
            'index' => ListRewardLevels::route('/'),
            'create' => CreateRewardLevel::route('/create'),
            'edit' => EditRewardLevel::route('/{record}/edit'),
        ];
    }
}
