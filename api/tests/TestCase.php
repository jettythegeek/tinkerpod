<?php

declare(strict_types=1);

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Auth;

abstract class TestCase extends BaseTestCase
{
    public function withToken(string $token, string $type = 'Bearer'): static
    {
        Auth::forgetGuards();

        return parent::withToken($token, $type);
    }
}
