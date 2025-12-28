<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Run the admin seeder.
     */
    public function run(): void
    {
        // Create admin user for the system
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'tetre0173@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);
    }
}