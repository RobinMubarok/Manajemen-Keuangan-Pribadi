<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated user can retrieve budget and settings', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/budget');

    $response->assertOk()
        ->assertJsonStructure([
            'harian',
            'bulanan',
            'kategori',
            'notifikasi',
            'alertHampirHabis',
            'alertMelebihi',
        ]);
});

test('authenticated user can save budget and settings', function () {
    $user = User::factory()->create();

    $payload = [
        'harian' => 50000,
        'bulanan' => 1500000,
        'kategori' => 'Bulanan',
        'notifikasi' => true,
        'alertHampirHabis' => true,
        'alertMelebihi' => false,
    ];

    $response = $this->actingAs($user)->postJson('/api/budget', $payload);

    $response->assertOk()
        ->assertJson([
            'harian' => 0,
            'bulanan' => 1500000,
            'kategori' => 'Bulanan',
            'notifikasi' => true,
            'alertHampirHabis' => true,
            'alertMelebihi' => false,
        ]);

    $this->assertDatabaseHas('user_settings', [
        'user_id' => $user->id,
        'daily_reminder_enabled' => true,
        'alert_hampir_habis' => true,
        'alert_melebihi' => false,
    ]);

    $this->assertDatabaseHas('budgets', [
        'user_id' => $user->id,
        'period' => 'harian',
        'amount' => 0,
    ]);

    $this->assertDatabaseHas('budgets', [
        'user_id' => $user->id,
        'period' => 'bulanan',
        'amount' => 1500000,
    ]);
});
