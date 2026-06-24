<?php

use App\Mail\OtpMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

test('user receives error if email is not registered for forgot password', function () {
    $response = $this->postJson('/api/forgot-password/send', [
        'email' => 'nonexistent@example.com',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'message' => 'Email tidak terdaftar.',
        ]);
});

test('user receives success if email is registered and mail is sent', function () {
    Mail::fake();

    $user = User::factory()->create([
        'email' => 'user@example.com',
    ]);

    $response = $this->postJson('/api/forgot-password/send', [
        'email' => 'user@example.com',
    ]);

    $response->assertOk()
        ->assertJson([
            'message' => 'Kode OTP berhasil dikirim ke email Anda.',
        ]);

    $this->assertDatabaseHas('password_reset_tokens', [
        'email' => 'user@example.com',
    ]);

    Mail::assertSent(OtpMail::class, function ($mail) use ($user) {
        return $mail->hasTo($user->email) && strlen($mail->otpCode) === 6;
    });
});

test('user cannot verify invalid OTP code', function () {
    $user = User::factory()->create([
        'email' => 'user@example.com',
    ]);

    DB::table('password_reset_tokens')->insert([
        'email' => 'user@example.com',
        'token' => '123456',
        'created_at' => now(),
    ]);

    $response = $this->postJson('/api/forgot-password/verify', [
        'email' => 'user@example.com',
        'token' => '111111', // wrong OTP
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'message' => 'Kode OTP salah.',
        ]);
});

test('user cannot verify expired OTP code', function () {
    $user = User::factory()->create([
        'email' => 'user@example.com',
    ]);

    DB::table('password_reset_tokens')->insert([
        'email' => 'user@example.com',
        'token' => '123456',
        'created_at' => now()->subMinutes(6), // expired (5 minutes timeout)
    ]);

    $response = $this->postJson('/api/forgot-password/verify', [
        'email' => 'user@example.com',
        'token' => '123456',
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'message' => 'Kode OTP telah kedaluwarsa (lebih dari 5 menit).',
        ]);
});

test('user can verify correct OTP code', function () {
    $user = User::factory()->create([
        'email' => 'user@example.com',
    ]);

    DB::table('password_reset_tokens')->insert([
        'email' => 'user@example.com',
        'token' => '123456',
        'created_at' => now(),
    ]);

    $response = $this->postJson('/api/forgot-password/verify', [
        'email' => 'user@example.com',
        'token' => '123456',
    ]);

    $response->assertOk()
        ->assertJson([
            'message' => 'Kode OTP cocok dan masih berlaku.',
        ]);
});

test('user can reset password with correct OTP', function () {
    $user = User::factory()->create([
        'email' => 'user@example.com',
        'password' => Hash::make('oldpassword'),
    ]);

    DB::table('password_reset_tokens')->insert([
        'email' => 'user@example.com',
        'token' => '123456',
        'created_at' => now(),
    ]);

    $response = $this->postJson('/api/forgot-password/reset', [
        'email' => 'user@example.com',
        'token' => '123456',
        'password' => 'newpassword123',
        'password_confirmation' => 'newpassword123',
    ]);

    $response->assertOk()
        ->assertJson([
            'message' => 'Password berhasil diperbarui.',
        ]);

    $this->assertDatabaseMissing('password_reset_tokens', [
        'email' => 'user@example.com',
    ]);

    // Re-verify password update in database
    $user->refresh();
    $this->assertTrue(Hash::check('newpassword123', $user->password));
});
