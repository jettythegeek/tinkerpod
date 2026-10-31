<?php

declare(strict_types=1);

namespace App\Filament\Resources;

use App\Domain\Rewards\RewardService;
use App\Enums\RewardCurrency;
use App\Filament\Resources\RewardLedgerResource\Pages\ListRewardLedgers;
use App\Models\Child;
use App\Models\RewardLedger;
use App\Models\User;
use Filament\Actions\Action;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Pages\PageRegistration;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class RewardLedgerResource extends RewardsResource
{
    protected static ?string $model = RewardLedger::class;

    protected static string|\BackedEnum|null $navigationIcon = Heroicon::OutlinedBanknotes;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function canEdit(Model $record): bool
    {
        return false;
    }

    public static function canDelete(Model $record): bool
    {
        return false;
    }

    public static function adjustChildReward(
        Child $child,
        RewardCurrency|string $currency,
        int $amount,
        string $reason,
        ?string $idempotencyKey = null,
    ): RewardLedger {
        $actor = auth()->user();
        if (! $actor instanceof User) {
            throw new AuthorizationException('Staff authentication is required to adjust child rewards.');
        }

        return app(RewardService::class)->adjust(
            child: $child,
            staff: $actor,
            currency: $currency,
            amount: $amount,
            reason: $reason,
            idempotencyKey: $idempotencyKey ?? strtolower((string) Str::ulid()),
        );
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('child.username')->label('Child Username')->searchable()->sortable(),
                TextColumn::make('child.first_name')->label('Child First Name')->searchable(),
                TextColumn::make('currency')->badge()->sortable(),
                TextColumn::make('amount')->label('Amount (+/-)')->sortable(),
                TextColumn::make('source_type')->label('Source Type')->sortable(),
                TextColumn::make('source_id')->label('Source ID'),
                TextColumn::make('rule_version')->label('Rule v')->sortable(),
                TextColumn::make('reason')->label('Reason')->toggleable(),
                TextColumn::make('created_at')->label('Created At')->dateTime()->sortable(),
            ])
            ->filters([
                SelectFilter::make('child_id')
                    ->label('Child')
                    ->relationship('child', 'username'),
                SelectFilter::make('currency')
                    ->options([
                        RewardCurrency::Xp->value => 'XP',
                        RewardCurrency::Coins->value => 'Coins',
                        RewardCurrency::Gems->value => 'Gems',
                    ]),
            ])
            ->headerActions([
                Action::make('adjust_reward')
                    ->label('Adjust reward')
                    ->icon(Heroicon::OutlinedAdjustmentsHorizontal)
                    ->color('warning')
                    ->visible(static fn (): bool => static::canAdjust())
                    ->schema([
                        Select::make('child_id')
                            ->label('Child')
                            ->options(static fn (): array => Child::query()
                                ->orderBy('username')
                                ->pluck('username', 'id')
                                ->all())
                            ->searchable()
                            ->required(),
                        Select::make('currency')
                            ->label('Currency')
                            ->options([
                                RewardCurrency::Xp->value => 'XP',
                                RewardCurrency::Coins->value => 'Coins',
                                RewardCurrency::Gems->value => 'Gems',
                            ])
                            ->default(RewardCurrency::Coins->value)
                            ->required(),
                        TextInput::make('amount')
                            ->label('Amount (+ or -)')
                            ->numeric()
                            ->required(),
                        Textarea::make('reason')
                            ->label('Reason (required)')
                            ->rows(3)
                            ->required(),
                    ])
                    ->action(static function (array $data): void {
                        /** @var Child $child */
                        $child = Child::query()->findOrFail((int) $data['child_id']);
                        static::adjustChildReward(
                            child: $child,
                            currency: (string) $data['currency'],
                            amount: (int) $data['amount'],
                            reason: (string) $data['reason'],
                        );
                    }),
            ])
            ->recordActions([]);
    }

    /**
     * @return array<string, PageRegistration>
     */
    public static function getPages(): array
    {
        return [
            'index' => ListRewardLedgers::route('/'),
        ];
    }
}
