<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed default users for development/testing.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'demo@moneymanager.id'],
            [
                'name' => 'Demo User',
                'password' => Hash::make('password123'),
            ]
        );
    }
}
