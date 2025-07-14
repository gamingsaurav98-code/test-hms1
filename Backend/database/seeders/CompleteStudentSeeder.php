<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Student;
use App\Models\StudentAmenities;
use App\Models\Room;
use App\Models\Block;
use Faker\Factory as Faker;
use Carbon\Carbon;

class CompleteStudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * This seeder creates blocks, rooms, and students if they don't exist.
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        // First, ensure we have some blocks and rooms
        $this->createBlocksAndRooms();
        
        // Get available rooms
        $rooms = Room::all();
        
        if ($rooms->isEmpty()) {
            $this->command->error('Failed to create rooms! Cannot proceed with student seeding.');
            return;
        }

        // Define common data arrays for realistic seeding
        $bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        $foodPreferences = ['vegetarian', 'non-vegetarian', 'egg-only'];
        $levelOfStudy = [
            'High School', 'Higher Secondary', 'Diploma', 'Bachelors', 'Masters', 'PhD',
            'Certificate', 'Associate Degree', 'Professional Course'
        ];
        $classTimings = ['Morning', 'Day', 'Evening', 'Night', '6:00 AM - 10:00 AM', '10:00 AM - 4:00 PM', '4:00 PM - 8:00 PM'];
        $expectedStayDuration = ['6 months', '1 year', '2 years', '3 years', '4 years', '5 years'];
        $districts = [
            'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Chitwan', 'Pokhara', 'Butwal', 'Birgunj',
            'Dharan', 'Hetauda', 'Janakpur', 'Nepalgunj', 'Gorkha', 'Syangja', 'Kaski',
            'Rupandehi', 'Parsa', 'Bara', 'Rautahat', 'Sarlahi', 'Mahottari'
        ];
        $occupations = [
            'Farmer', 'Teacher', 'Driver', 'Business Person', 'Government Employee', 'Doctor',
            'Engineer', 'Shopkeeper', 'Laborer', 'Housewife', 'Retired', 'Student', 'Nurse',
            'Police Officer', 'Accountant', 'Mechanic', 'Tailor', 'Cook'
        ];
        $institutions = [
            'Tribhuvan University', 'Kathmandu University', 'Pokhara University', 'Purbanchal University',
            'Nepal Open University', 'Agriculture and Forestry University', 'Mid-Western University',
            'Far-Western University', 'Lumbini Buddhist University', 'B.P. Koirala Institute of Health Sciences',
            'National College', 'Amrit Campus', 'Padma Kanya Campus', 'Ratna Rajya Campus',
            'Mahendra Multiple Campus', 'Birendra Multiple Campus', 'Prithvi Narayan Campus'
        ];
        $guardianRelations = ['Uncle', 'Aunt', 'Elder Brother', 'Elder Sister', 'Cousin', 'Family Friend', 'Relative'];
        
        // Sample diseases/health conditions
        $healthConditions = [
            null, null, null, // Many students will have no health issues
            'Asthma', 
            'Diabetes', 
            'High Blood Pressure', 
            'Allergy to nuts', 
            'Migraine', 
            'Back pain',
            'Skin allergy',
            'Gastritis',
            'None'
        ];

        // Sample amenities that students might have
        $commonAmenities = [
            ['name' => 'WiFi', 'description' => 'High-speed internet access'],
            ['name' => 'Laundry', 'description' => 'Weekly laundry service'],
            ['name' => 'Meals', 'description' => '3 times daily meals'],
            ['name' => 'Study Table', 'description' => 'Personal study table and chair'],
            ['name' => 'Wardrobe', 'description' => 'Personal storage space'],
            ['name' => 'Air Conditioning', 'description' => 'Climate control'],
            ['name' => 'Hot Water', 'description' => '24/7 hot water supply'],
            ['name' => 'Security', 'description' => '24/7 security service'],
            ['name' => 'Parking', 'description' => 'Bike/scooter parking space'],
            ['name' => 'Common Room', 'description' => 'Access to common recreational area'],
        ];

        // Create 30 sample students
        for ($i = 1; $i <= 30; $i++) {
            // Generate realistic Nepali names
            $maleFirstNames = ['Anil', 'Sunil', 'Rajesh', 'Ramesh', 'Krishna', 'Hari', 'Shyam', 'Gopal', 'Mohan', 'Rohan', 'Arjun', 'Bikash', 'Deepak', 'Santosh', 'Prakash'];
            $femaleFirstNames = ['Sita', 'Gita', 'Rita', 'Sunita', 'Anita', 'Puja', 'Priya', 'Sarita', 'Kamala', 'Shanti', 'Laxmi', 'Maya', 'Devi', 'Kumari', 'Sushma'];
            $lastNames = ['Sharma', 'Shrestha', 'Tamang', 'Gurung', 'Magar', 'Rai', 'Limbu', 'Thapa', 'Poudel', 'Adhikari', 'Khadka', 'Basnet', 'Karki', 'Regmi', 'Koirala'];
            
            $isGender = $faker->randomElement(['male', 'female']);
            $firstName = $isGender === 'male' ? $faker->randomElement($maleFirstNames) : $faker->randomElement($femaleFirstNames);
            $lastName = $faker->randomElement($lastNames);
            $fullName = $firstName . ' ' . $lastName;
            
            // Generate unique email
            $email = strtolower(str_replace(' ', '.', $firstName . '.' . $lastName)) . $i . '@example.com';
            
            // Select a random room for this student
            $room = $faker->randomElement($rooms);
            
            // Create student data
            $studentData = [
                'student_name' => $fullName,
                'user_id' => null, // Can be set if User model exists
                'date_of_birth' => $faker->dateTimeBetween('-30 years', '-18 years')->format('Y-m-d'),
                'contact_number' => '98' . $faker->numberBetween(10000000, 99999999), // Nepali mobile format
                'email' => $email,
                'district' => $faker->randomElement($districts),
                'city_name' => $faker->city,
                'ward_no' => $faker->numberBetween(1, 32),
                'street_name' => $faker->streetName,
                'citizenship_no' => $faker->numberBetween(100000000, 999999999),
                'date_of_issue' => $faker->dateTimeBetween('-10 years', '-1 year')->format('Y-m-d'),
                'citizenship_issued_district' => $faker->randomElement($districts),
                'educational_institution' => $faker->randomElement($institutions),
                'class_time' => $faker->randomElement($classTimings),
                'level_of_study' => $faker->randomElement($levelOfStudy),
                'expected_stay_duration' => $faker->randomElement($expectedStayDuration),
                'blood_group' => $faker->randomElement($bloodGroups),
                'food' => $faker->randomElement($foodPreferences),
                'disease' => $faker->randomElement($healthConditions),
                'father_name' => $faker->name('male'),
                'father_contact' => '98' . $faker->numberBetween(10000000, 99999999),
                'father_occupation' => $faker->randomElement($occupations),
                'mother_name' => $faker->name('female'),
                'mother_contact' => '98' . $faker->numberBetween(10000000, 99999999),
                'mother_occupation' => $faker->randomElement($occupations),
                'spouse_name' => $faker->optional(0.2)->name(), // Only 20% have spouse
                'spouse_contact' => $faker->optional(0.2)->phoneNumber,
                'spouse_occupation' => $faker->optional(0.2)->randomElement($occupations),
                'local_guardian_name' => $faker->name(),
                'local_guardian_address' => $faker->address,
                'local_guardian_contact' => '98' . $faker->numberBetween(10000000, 99999999),
                'local_guardian_occupation' => $faker->randomElement($occupations),
                'local_guardian_relation' => $faker->randomElement($guardianRelations),
                'verified_by' => $faker->optional(0.8)->name(), // 80% are verified
                'verified_on' => $faker->optional(0.8)->dateTimeBetween('-1 year', 'now'),
                'student_id' => 'STU' . str_pad($i, 4, '0', STR_PAD_LEFT), // STU0001, STU0002, etc.
                'room_id' => $room->id,
                'student_image' => null, // Set to null for seeding, you can add actual image paths later
                'student_citizenship_image' => null, // Set to null for seeding
                'registration_form_image' => null, // Set to null for seeding
                'is_active' => $faker->boolean(90), // 90% are active
                'is_existing_student' => $faker->boolean(20), // 20% are existing students
                'declaration_agreed' => $faker->boolean(95), // 95% agreed to declaration
                'rules_agreed' => $faker->boolean(98), // 98% agreed to rules
                'created_at' => $faker->dateTimeBetween('-2 years', 'now'),
                'updated_at' => now(),
            ];

            // Create the student
            $student = Student::create($studentData);

            // Add amenities for each student (2-5 random amenities)
            $numAmenities = $faker->numberBetween(2, 5);
            $selectedAmenities = $faker->randomElements($commonAmenities, $numAmenities);
            
            foreach ($selectedAmenities as $amenity) {
                StudentAmenities::create([
                    'student_id' => $student->id,
                    'name' => $amenity['name'],
                    'description' => $amenity['description'],
                ]);
            }

            $this->command->info("Created student: {$student->student_name} (ID: {$student->student_id})");
        }

        $this->command->info('Complete student seeder finished! Created 30 students with amenities.');
    }

    /**
     * Create blocks and rooms if they don't exist
     */
    private function createBlocksAndRooms()
    {
        $faker = Faker::create();

        // Create blocks if none exist
        if (Block::count() === 0) {
            $blockData = [
                ['block_name' => 'Block A', 'location' => 'North Wing', 'manager_name' => 'Ram Bahadur', 'manager_contact' => '9841234567', 'remarks' => 'Main residential block'],
                ['block_name' => 'Block B', 'location' => 'South Wing', 'manager_name' => 'Sita Devi', 'manager_contact' => '9842345678', 'remarks' => 'Secondary residential block'],
                ['block_name' => 'Block C', 'location' => 'East Wing', 'manager_name' => 'Hari Sharma', 'manager_contact' => '9843456789', 'remarks' => 'New residential block'],
            ];

            foreach ($blockData as $data) {
                Block::create($data);
            }
            
            $this->command->info('Created 3 blocks');
        }

        // Create rooms if none exist
        if (Room::count() === 0) {
            $blocks = Block::all();
            $roomTypes = ['single', 'double', 'triple', 'four-bed'];
            
            foreach ($blocks as $block) {
                // Create 10 rooms per block
                for ($i = 1; $i <= 10; $i++) {
                    $roomType = $faker->randomElement($roomTypes);
                    $capacity = match($roomType) {
                        'single' => 1,
                        'double' => 2,
                        'triple' => 3,
                        'four-bed' => 4,
                        default => 2
                    };
                    
                    Room::create([
                        'room_name' => $block->block_name . '-' . str_pad($i, 2, '0', STR_PAD_LEFT),
                        'block_id' => $block->id,
                        'capacity' => $capacity,
                        'status' => 'available',
                        'room_type' => $roomType,
                        'room_attachment' => null,
                    ]);
                }
            }
            
            $this->command->info('Created 30 rooms (10 per block)');
        }
    }
}
