<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Enums\ContentStatus;
use App\Filament\Resources\WorldResource\Pages\CreateWorld;
use App\Filament\Resources\WorldResource\Pages\EditWorld;
use App\Filament\Resources\WorldResource\Pages\ListWorlds;
use App\Models\World;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Pages\PageRegistration;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class WorldResource extends CurriculumResource
{
    protected static ?string $model = World::class;

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('pod_id')
                ->relationship('pod', 'title')
                ->required(),
            Select::make('course_id')
                ->relationship('course', 'title'),
            TextInput::make('world_number')
                ->numeric()
                ->default(1)
                ->required(),
            TextInput::make('title')
                ->required()
                ->maxLength(160),
            TextInput::make('slug')
                ->required()
                ->maxLength(120),
            Textarea::make('description')
                ->rows(3),
            TextInput::make('icon')
                ->maxLength(80),
            TextInput::make('map_x')
                ->numeric()
                ->default(150),
            TextInput::make('map_y')
                ->numeric()
                ->default(500),
            TextInput::make('sort_order')
                ->numeric()
                ->default(1)
                ->required(),
            Select::make('status')
                ->options([
                    ContentStatus::Draft->value => 'Draft',
                    ContentStatus::Published->value => 'Published',
                    ContentStatus::Archived->value => 'Archived',
                ])
                ->default(ContentStatus::Draft->value)
                ->disabled(static fn (): bool => ! static::canPublish())
                ->dehydrated(static fn (): bool => static::canPublish())
                ->required(),
            Toggle::make('is_demo')
                ->label('Demo Content')
                ->default(false),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('world_number')->label('#')->sortable(),
                TextColumn::make('title')->searchable()->sortable(),
                TextColumn::make('pod.title')->label('Pod')->sortable(),
                TextColumn::make('status')->badge()->sortable(),
                IconColumn::make('is_demo')->boolean()->label('Demo'),
                TextColumn::make('sort_order')->sortable(),
            ])
            ->recordActions(static::publicationActions());
    }

    /**
     * @return array<string, PageRegistration>
     */
    public static function getPages(): array
    {
        return [
            'index' => ListWorlds::route('/'),
            'create' => CreateWorld::route('/create'),
            'edit' => EditWorld::route('/{record}/edit'),
        ];
    }
}
