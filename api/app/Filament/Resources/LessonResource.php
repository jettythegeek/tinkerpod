<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Enums\ContentStatus;
use App\Enums\LessonCompletionMode;
use App\Filament\Resources\LessonResource\Pages\CreateLesson;
use App\Filament\Resources\LessonResource\Pages\EditLesson;
use App\Filament\Resources\LessonResource\Pages\ListLessons;
use App\Models\Lesson;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Pages\PageRegistration;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class LessonResource extends CurriculumResource
{
    protected static ?string $model = Lesson::class;

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('world_id')
                ->relationship('world', 'title')
                ->required(),
            Select::make('module_id')
                ->relationship('module', 'title')
                ->required(),
            TextInput::make('lesson_number')
                ->numeric()
                ->default(1)
                ->required(),
            TextInput::make('title')
                ->required()
                ->maxLength(160),
            TextInput::make('slug')
                ->required()
                ->maxLength(120),
            Textarea::make('summary')
                ->rows(2),
            Textarea::make('body')
                ->rows(5),
            TextInput::make('intro_video_url')
                ->maxLength(255),
            TextInput::make('intro_video_duration_seconds')
                ->numeric()
                ->default(80),
            TextInput::make('duration_minutes')
                ->numeric()
                ->default(8),
            TextInput::make('difficulty')
                ->default('Beginner')
                ->maxLength(40),
            TextInput::make('steps_count')
                ->numeric()
                ->default(5),
            Select::make('completion_mode')
                ->options([
                    LessonCompletionMode::Manual->value => 'Manual ("I\'m done")',
                    LessonCompletionMode::WatchPercent->value => 'Watch Percentage',
                    LessonCompletionMode::QuizPass->value => 'Quiz Passed',
                ])
                ->default(LessonCompletionMode::Manual->value)
                ->required(),
            TextInput::make('required_watch_percent')
                ->numeric()
                ->default(80),
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
                TextColumn::make('lesson_number')->label('#')->sortable(),
                TextColumn::make('title')->searchable()->sortable(),
                TextColumn::make('world.title')->label('World')->sortable(),
                TextColumn::make('module.title')->label('Module')->sortable(),
                TextColumn::make('completion_mode')->badge(),
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
            'index' => ListLessons::route('/'),
            'create' => CreateLesson::route('/create'),
            'edit' => EditLesson::route('/{record}/edit'),
        ];
    }
}
