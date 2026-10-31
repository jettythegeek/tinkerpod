<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class RejectClientRewardFields
{
    /**
     * Client-sent reward fields that are strictly forbidden on API requests (M3.3).
     *
     * @var list<string>
     */
    public const FORBIDDEN_FIELDS = [
        'xp',
        'xp_amount',
        'reward_xp',
        'coin',
        'coins',
        'coins_amount',
        'reward_coins',
        'gem',
        'gems',
        'gems_amount',
        'reward_gems',
        'level',
        'level_number',
        'badge',
        'badges',
        'badge_id',
        'badge_slug',
        'naija_title',
        'reward_amount',
    ];

    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $payload = $request->all();
        $violations = $this->findForbiddenFields($payload);

        if ($violations !== []) {
            $errors = [];
            foreach ($violations as $field) {
                $errors[$field] = [
                    sprintf('The [%s] field is prohibited because rewards, levels, and badges are server-authoritative.', $field),
                ];
            }

            throw ValidationException::withMessages($errors);
        }

        return $next($request);
    }

    /**
     * @param  array<array-key, mixed>  $data
     * @return list<string>
     */
    private function findForbiddenFields(array $data, string $prefix = ''): array
    {
        $found = [];
        $forbiddenLookup = array_fill_keys(self::FORBIDDEN_FIELDS, true);

        foreach ($data as $key => $value) {
            $keyStr = is_string($key) ? strtolower(trim($key)) : '';
            $path = $prefix !== '' ? "{$prefix}.{$key}" : (string) $key;

            if ($keyStr !== '' && isset($forbiddenLookup[$keyStr])) {
                $found[] = $path;
            }

            if (is_array($value)) {
                foreach ($this->findForbiddenFields($value, $path) as $nested) {
                    $found[] = $nested;
                }
            }
        }

        return array_values(array_unique($found));
    }
}
