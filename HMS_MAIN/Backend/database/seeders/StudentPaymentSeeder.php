<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Student;

class StudentPaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a test student with verified email
        Student::updateOrCreate(
            ['email' => 'gamingsaurav98@gmail.com'],
            [
                'student_name' => 'Saurav',
                'date_of_birth' => '2002-05-15',
                'contact_number' => '9800000001',
                'email' => 'gamingsaurav98@gmail.com',
                'district' => 'Kathmandu',
                'city_name' => 'Kathmandu',
                'ward_no' => '1',
                'street_name' => 'Main Street',
                'citizenship_no' => '123456789',
                'date_of_issue' => '2020-01-01',
                'citizenship_issued_district' => 'Kathmandu',
                'educational_institution' => 'Tribhuwan University',
                'class_time' => 'Day',
                'level_of_study' => 'Bachelor',
                'expected_stay_duration' => '4 years',
                'is_active' => true,
                'student_id' => 'ST0001',
            ]
        );

        echo "Student seeder completed. Test student 'avi@example.com' created/updated.\n";
    }
}
