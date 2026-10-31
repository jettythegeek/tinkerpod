<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Filament\Resources\BadgeResource\Pages\CreateBadge;
use App\Filament\Resources\BadgeResource\Pages\EditBadge;
use App\Filament\Resources\BadgeResource\Pages\ListBadges;
use App\Models\Badge;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Pages\PageRegistration;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class BadgeResource extends RewardsResource
{
    protected static ?string $model = Badge::class;

    protected static string|\BackedEnum|null $navigationIcon = Heroicon::OutlinedShieldCheck;

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')
                ->required()
                ->maxLength(80),
            TextInput::make('slug')
                ->required()
                ->maxLength(80),
            Textarea::make('description')
                ->rows(2),
            TextInput::make('icon')
                ->label('Lucide Icon Name')
                ->default('trophy')
                ->required()
                ->maxLength(60),
            TextInput::make('color')
                ->label('Badge Hex Color')
                ->default('#7C3AED')
                ->required()
                ->maxLength(24),
            Select::make('condition_type')
                ->options([
                    'first_lesson' => 'First Lesson Completed',
                    'lessons_completed_count' => 'Lessons Completed Count',
                    'first_quiz_pass' => 'First Quiz Passed',
                    'perfect_quiz_count' => 'Perfect Quiz (100%) Count',
                    'streak_days' => 'Streak Days Reached',
                    'level_reached' => 'Level Reached',
                ])
                ->required(),
            TextInput::make('condition_value')
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
                TextColumn::make('icon')->label('Lucide Icon'),
                TextColumn::make('condition_type')->label('Condition')->sortable(),
                TextColumn::make('condition_value')->label('Threshold')->sortable(),
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
            'index' => ListBadges::route('/'),
            'create' => CreateBadge::route('/create'),
            'edit' => EditBadge::route('/{record}/edit'),
        ];
    }
}
