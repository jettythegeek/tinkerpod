<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Enums\ContentStatus;
use App\Filament\Resources\ModuleResource\Pages\CreateModule;
use App\Filament\Resources\ModuleResource\Pages\EditModule;
use App\Filament\Resources\ModuleResource\Pages\ListModules;
use App\Models\Module;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Pages\PageRegistration;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ModuleResource extends CurriculumResource
{
    protected static ?string $model = Module::class;

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('course_id')
                ->relationship('course', 'title')
                ->required(),
            TextInput::make('title')
                ->required()
                ->maxLength(160),
            TextInput::make('slug')
                ->required()
                ->maxLength(120),
            Textarea::make('description')
                ->rows(3),
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
                TextColumn::make('title')->searchable()->sortable(),
                TextColumn::make('course.title')->label('Course')->sortable(),
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
            'index' => ListModules::route('/'),
            'create' => CreateModule::route('/create'),
            'edit' => EditModule::route('/{record}/edit'),
        ];
    }
}
