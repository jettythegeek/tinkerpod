<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\NaijaTitleResource\Pages\CreateNaijaTitle;
use App\Filament\Resources\NaijaTitleResource\Pages\EditNaijaTitle;
use App\Filament\Resources\NaijaTitleResource\Pages\ListNaijaTitles;
use App\Models\NaijaTitle;
use Filament\Actions\EditAction;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Pages\PageRegistration;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class NaijaTitleResource extends RewardsResource
{
    protected static ?string $model = NaijaTitle::class;

    protected static string|\BackedEnum|null $navigationIcon = Heroicon::OutlinedTrophy;

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')
                ->required()
                ->maxLength(80),
            TextInput::make('slug')
                ->required()
                ->maxLength(80),
            TextInput::make('min_level')
                ->label('Minimum Level')
                ->numeric()
                ->default(1)
                ->required(),
            TextInput::make('sort_order')
                ->numeric()
                ->default(1)
                ->required(),
            Toggle::make('is_active')
                ->default(true),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('sort_order')->label('#')->sortable(),
                TextColumn::make('name')->searchable()->sortable(),
                TextColumn::make('slug')->sortable(),
                TextColumn::make('min_level')->label('Min Level')->sortable(),
                IconColumn::make('is_active')->boolean()->label('Active'),
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
            'index' => ListNaijaTitles::route('/'),
            'create' => CreateNaijaTitle::route('/create'),
            'edit' => EditNaijaTitle::route('/{record}/edit'),
        ];
    }
}
