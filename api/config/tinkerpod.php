<?php

declare(strict_types=1);

return [
    'admin' => [
        'email' => env('ADMIN_EMAIL', ''),
        'password' => env('ADMIN_PASSWORD', ''),
    ],

    'auth' => [
        'password_reset_ttl_minutes' => (int) env('PASSWORD_RESET_TTL_MINUTES', 10),
        'parent_token_ttl_days' => (int) env('PARENT_TOKEN_TTL_DAYS', 30),
        'kid_token_ttl_days' => (int) env('KID_TOKEN_TTL_DAYS', 7),
        'pin_max_attempts' => 5,
        'lockout_minutes_schedule' => [15, 60, 1440],
    ],

    'learning' => [
        'attachments_disk' => env('LEARNING_ATTACHMENTS_DISK', 'local'),
        'signed_url_ttl_minutes' => (int) env('LEARNING_SIGNED_URL_TTL_MINUTES', 5),
    ],
];
