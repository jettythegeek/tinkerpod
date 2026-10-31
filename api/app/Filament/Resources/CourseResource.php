<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Enums\ContentStatus;
use App\Filament\Resources\CourseResource\Pages\CreateCourse;
use App\Filament\Resources\CourseResource\Pages\EditCourse;
use App\Filament\Resources\CourseResource\Pages\ListCourses;
use App\Models\Course;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Pages\PageRegistration;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class CourseResource extends CurriculumResource
{
    protected static ?string $model = Course::class;

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('pod_id')
                ->relationship('pod', 'title')
                ->required(),
            Select::make('track_id')
                ->relationship('track', 'title')
                ->required(),
            TextInput::make('title')
                ->required()
                ->maxLength(160),
            TextInput::make('slug')
                ->required()
                ->maxLength(120),
            Textarea::make('description')
                ->rows(3),
            TextInput::make('difficulty')
                ->default('Beginner')
                ->maxLength(32),
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
                TextColumn::make('track.title')->label('Track')->sortable(),
                TextColumn::make('difficulty')->badge(),
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
            'index' => ListCourses::route('/'),
            'create' => CreateCourse::route('/create'),
            'edit' => EditCourse::route('/{record}/edit'),
        ];
    }
}
