<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    public function test_health_endpoint_returns_standard_envelope_on_mysql(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response
            ->assertOk()
            ->assertExactJsonStructure([
                'success',
                'message',
                'data' => [
                    'service',
                    'version',
                    'status',
                    'database',
                    'timezone',
                    'timestamp',
                ],
            ])
            ->assertJson([
                'success' => true,
                'message' => 'TinkerPod API is healthy.',
                'data' => [
                    'service' => 'tinkerpod-api',
                    'version' => 'v1',
                    'status' => 'ok',
                    'database' => 'connected',
                    'timezone' => 'Africa/Lagos',
                ],
            ]);

        $this->assertSame('mysql', DB::connection()->getDriverName());
    }

    public function test_unknown_api_route_returns_standard_json_error_envelope(): void
    {
        $response = $this->getJson('/api/v1/does-not-exist');

        $response
            ->assertNotFound()
            ->assertExactJsonStructure([
                'success',
                'message',
                'data',
            ])
            ->assertJson([
                'success' => false,
                'data' => null,
            ]);
    }

    public function test_filament_admin_panel_boots_and_serves_login_page(): void
    {
        $this->get('/admin')->assertRedirect('/admin/login');

        $this->get('/admin/login')
            ->assertOk()
            ->assertSee('TinkerPod Admin');
    }
}
