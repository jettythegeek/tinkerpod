<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Domain\Rewards\RewardEvent;
use App\Filament\Resources\RewardRuleResource\Pages\CreateRewardRule;
use App\Filament\Resources\RewardRuleResource\Pages\EditRewardRule;
use App\Filament\Resources\RewardRuleResource\Pages\ListRewardRules;
use App\Models\RewardRule;
use App\Models\User;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Pages\PageRegistration;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Model;

class RewardRuleResource extends RewardsResource
{
    protected static ?string $model = RewardRule::class;

    protected static string|\BackedEnum|null $navigationIcon = Heroicon::OutlinedSparkles;

    public static function canDelete(Model $record): bool
    {
        return false;
    }

    public static function publishNewVersion(
        string $eventType,
        int $xpAmount,
        int $coinsAmount,
        int $gemsAmount = 0,
    ): RewardRule {
        if (! static::canManage()) {
            throw new AuthorizationException('You do not have permission to manage reward rules.');
        }

        $actor = auth()->user();

        return RewardRule::createNextVersion(
            eventType: $eventType,
            xpAmount: $xpAmount,
            coinsAmount: $coinsAmount,
            gemsAmount: $gemsAmount,
            createdBy: $actor instanceof User ? $actor->id : null,
        );
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('event_type')
                ->options([
                    RewardEvent::TYPE_LESSON_COMPLETED => 'Lesson Completed (First Time)',
                    RewardEvent::TYPE_QUIZ_PASSED => 'Quiz Passed (First Time)',
                    RewardEvent::TYPE_PERFECT_QUIZ => 'Perfect Quiz (100% Bonus)',
                    RewardEvent::TYPE_STREAK_DAY => 'Daily Streak Activity',
                ])
                ->required(),
            TextInput::make('xp_amount')
                ->label('XP Amount')
                ->numeric()
                ->default(50)
                ->required(),
            TextInput::make('coins_amount')
                ->label('Coins Amount')
                ->numeric()
                ->default(20)
                ->required(),
            TextInput::make('gems_amount')
                ->label('Gems Amount')
                ->numeric()
                ->default(0)
                ->required(),
            Toggle::make('is_active')
                ->label('Active Version')
                ->default(true),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('event_type')->label('Event')->sortable()->searchable(),
                TextColumn::make('version')->label('Version')->badge()->sortable(),
                TextColumn::make('xp_amount')->label('XP')->sortable(),
                TextColumn::make('coins_amount')->label('Coins')->sortable(),
                TextColumn::make('gems_amount')->label('Gems')->sortable(),
                IconColumn::make('is_active')->boolean()->label('Active'),
                TextColumn::make('created_at')->dateTime()->sortable(),
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
            'index' => ListRewardRules::route('/'),
            'create' => CreateRewardRule::route('/create'),
            'edit' => EditRewardRule::route('/{record}/edit'),
        ];
    }
}
