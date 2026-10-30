<?php

declare(strict_types=1);

namespace App\Rules;

use App\Models\Child;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ChildUsernameRule implements ValidationRule
{
    public const MESSAGE = "That name won't work. Try another fun one!";

    private const WORD_LIST_FILES = [
        'profanity/en.txt',
        'profanity/pcm.txt',
        'profanity/yo.txt',
        'profanity/ig.txt',
        'profanity/ha.txt',
    ];

    /**
     * @var list<string>|null
     */
    private static ?array $cachedProfanityWords = null;

    public function __construct(
        private readonly string $firstName = '',
        private readonly ?string $lastName = null,
        private readonly ?int $ignoreChildId = null,
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            $fail(self::MESSAGE);

            return;
        }

        $trimmed = trim($value);
        $len = strlen($trimmed);

        if ($len < 3 || $len > 20) {
            $fail(self::MESSAGE);

            return;
        }

        // Reject email-like values (contains @ or common email/domain patterns)
        if ($this->isEmailLike($trimmed)) {
            $fail(self::MESSAGE);

            return;
        }

        // Allowed characters: letters, digits, _ and .
        if (preg_match('/^[a-zA-Z0-9_.]+$/', $trimmed) !== 1) {
            $fail(self::MESSAGE);

            return;
        }

        // Reject phone-like values (7+ digits)
        if (preg_match_all('/\d/', $trimmed) >= 7) {
            $fail(self::MESSAGE);

            return;
        }

        // Reject child's own first or last name
        if ($this->containsRealName($trimmed)) {
            $fail(self::MESSAGE);

            return;
        }

        // Reject rude/profane words across English, Pidgin, Yoruba, Igbo, and Hausa
        if ($this->containsProfanity($trimmed)) {
            $fail(self::MESSAGE);

            return;
        }

        // Case-insensitive uniqueness check
        $query = Child::query()->whereRaw('LOWER(username) = ?', [strtolower($trimmed)]);

        if ($this->ignoreChildId !== null) {
            $query->where('id', '!=', $this->ignoreChildId);
        }

        if ($query->exists()) {
            $fail(self::MESSAGE);
        }
    }

    private function isEmailLike(string $value): bool
    {
        $lower = strtolower($value);

        if (str_contains($lower, '@')) {
            return true;
        }

        return preg_match('/\.(com|ng|org|net|edu|gov|io|co|me|mail)$/i', $lower) === 1
            || preg_match('/(gmail|yahoo|hotmail|outlook|icloud)\./i', $lower) === 1;
    }

    private function containsRealName(string $username): bool
    {
        $candidates = $this->normalizedVariants($username);

        foreach ([$this->firstName, $this->lastName ?? ''] as $namePart) {
            $cleanName = preg_replace('/[^a-z0-9]/', '', strtolower(trim($namePart))) ?? '';

            if (strlen($cleanName) < 2) {
                continue;
            }

            foreach ($candidates as $candidate) {
                if (str_contains($candidate, $cleanName)) {
                    return true;
                }
            }
        }

        return false;
    }

    private function containsProfanity(string $username): bool
    {
        $variants = $this->normalizedVariants($username);

        foreach (self::profanityWords() as $badWord) {
            foreach ($variants as $variant) {
                if (str_contains($variant, $badWord)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Build normalized strings stripping `_` and `.` and mapping look-alikes (`0->o`, `1->i`/`l`, `3->e`, `4->a`, `5->s`, `@->a`).
     *
     * @return list<string>
     */
    private function normalizedVariants(string $raw): array
    {
        $lower = strtolower($raw);
        $stripped = str_replace(['_', '.'], '', $lower);

        $leetToI = strtr($stripped, [
            '0' => 'o',
            '1' => 'i',
            '3' => 'e',
            '4' => 'a',
            '5' => 's',
            '@' => 'a',
        ]);

        $leetToL = strtr($stripped, [
            '0' => 'o',
            '1' => 'l',
            '3' => 'e',
            '4' => 'a',
            '5' => 's',
            '@' => 'a',
        ]);

        return array_values(array_unique([
            $stripped,
            $leetToI,
            $leetToL,
        ]));
    }

    /**
     * @return list<string>
     */
    public static function profanityWords(): array
    {
        if (self::$cachedProfanityWords !== null) {
            return self::$cachedProfanityWords;
        }

        $words = [];

        foreach (self::WORD_LIST_FILES as $relativePath) {
            $fullPath = resource_path($relativePath);
            if (! is_file($fullPath)) {
                continue;
            }

            $lines = file($fullPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            if (! is_array($lines)) {
                continue;
            }

            foreach ($lines as $line) {
                $trimmed = strtolower(trim($line));
                if ($trimmed === '' || str_starts_with($trimmed, '#')) {
                    continue;
                }

                $normalized = preg_replace('/[^a-z0-9]/', '', $trimmed) ?? '';
                if (strlen($normalized) >= 3) {
                    $words[] = $normalized;
                }
            }
        }

        self::$cachedProfanityWords = array_values(array_unique($words));

        return self::$cachedProfanityWords;
    }
}
