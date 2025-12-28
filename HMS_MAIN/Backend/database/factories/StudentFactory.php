<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Student>
 */
class StudentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'contact_number' => $this->faker->phoneNumber(),
            'monthly_fee' => 10000,
            'is_active' => true,
            'district' => $this->faker->city(),
            'city_name' => $this->faker->city(),
            'ward_no' => $this->faker->numberBetween(1, 20),
            'street_name' => $this->faker->streetName(),
            'date_of_birth' => $this->faker->date(),
            'blood_group' => 'O+',
            'food' => 'veg',
            'declaration_agreed' => true,
            'rules_agreed' => true,
        ];
    }
}
