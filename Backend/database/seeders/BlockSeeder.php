<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Block;
use Faker\Factory as Faker;

class BlockSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        // Define realistic block data
        $blockData = [
            [
                'block_name' => 'Block A',
                'location' => 'North Wing - Main Campus',
                'manager_name' => 'Ram Bahadur Thapa',
                'manager_contact' => '9841234567',
                'remarks' => 'Main residential block with modern facilities. Houses senior students and has excellent ventilation.',
                'block_attachment' => null,
            ],
            [
                'block_name' => 'Block B',
                'location' => 'South Wing - Main Campus',
                'manager_name' => 'Sita Devi Sharma',
                'manager_contact' => '9842345678',
                'remarks' => 'Secondary residential block with common areas. Ideal for new students with mentorship programs.',
                'block_attachment' => null,
            ],
            [
                'block_name' => 'Block C',
                'location' => 'East Wing - Extension Campus',
                'manager_name' => 'Hari Krishna Poudel',
                'manager_contact' => '9843456789',
                'remarks' => 'Newly constructed block with premium amenities. Features study halls and recreational facilities.',
                'block_attachment' => null,
            ],
            [
                'block_name' => 'Block D',
                'location' => 'West Wing - Extension Campus',
                'manager_name' => 'Maya Kumari Gurung',
                'manager_contact' => '9844567890',
                'remarks' => 'Specialized block for female students with enhanced security and privacy features.',
                'block_attachment' => null,
            ],
            [
                'block_name' => 'Block E',
                'location' => 'Central Building - Main Campus',
                'manager_name' => 'Deepak Raj Joshi',
                'manager_contact' => '9845678901',
                'remarks' => 'Executive block for graduate students and researchers. Includes meeting rooms and library access.',
                'block_attachment' => null,
            ],
            [
                'block_name' => 'Block F',
                'location' => 'Northern Annex - Extended Area',
                'manager_name' => 'Anita Devi Shrestha',
                'manager_contact' => '9846789012',
                'remarks' => 'Budget-friendly accommodation with basic amenities. Perfect for cost-conscious students.',
                'block_attachment' => null,
            ],
            [
                'block_name' => 'Block G',
                'location' => 'Southern Annex - Extended Area',
                'manager_name' => 'Bijay Kumar Magar',
                'manager_contact' => '9847890123',
                'remarks' => 'Sports-oriented block near gymnasium and playground. Ideal for athletes and sports enthusiasts.',
                'block_attachment' => null,
            ],
            [
                'block_name' => 'Block H',
                'location' => 'Hillside Campus - Elevated Area',
                'manager_name' => 'Kamala Devi Tamang',
                'manager_contact' => '9848901234',
                'remarks' => 'Scenic block with mountain views. Peaceful environment ideal for focused study and meditation.',
                'block_attachment' => null,
            ],
        ];

        // Create the predefined blocks
        foreach ($blockData as $data) {
            $data['created_at'] = $faker->dateTimeBetween('-2 years', '-6 months');
            $data['updated_at'] = $faker->dateTimeBetween($data['created_at'], 'now');
            
            $block = Block::create($data);
            $this->command->info("Created block: {$block->block_name} - {$block->location}");
        }

        // Create additional blocks with generated data
        $blockNames = ['Block I', 'Block J', 'Block K', 'Block L'];
        $locations = [
            'Technology Wing - IT Campus',
            'Medical Wing - Health Campus',
            'Arts Wing - Creative Campus',
            'Science Wing - Research Campus'
        ];
        $managerFirstNames = ['Rajesh', 'Sunita', 'Prakash', 'Geeta', 'Mukesh', 'Radha', 'Santosh', 'Puja'];
        $managerLastNames = ['Sharma', 'Thapa', 'Gurung', 'Shrestha', 'Magar', 'Rai', 'Tamang', 'Poudel'];

        for ($i = 0; $i < count($blockNames); $i++) {
            $managerFirstName = $faker->randomElement($managerFirstNames);
            $managerLastName = $faker->randomElement($managerLastNames);
            $managerFullName = $managerFirstName . ' ' . $managerLastName;

            $blockData = [
                'block_name' => $blockNames[$i],
                'location' => $locations[$i],
                'manager_name' => $managerFullName,
                'manager_contact' => '98' . $faker->numberBetween(10000000, 99999999),
                'remarks' => $faker->paragraph(2),
                'block_attachment' => null,
                'created_at' => $faker->dateTimeBetween('-2 years', '-6 months'),
                'updated_at' => $faker->dateTimeBetween('-6 months', 'now'),
            ];

            $block = Block::create($blockData);
            $this->command->info("Created block: {$block->block_name} - {$block->location}");
        }

        $this->command->info('Block seeder completed! Created ' . count($blockData) + count($blockNames) . ' blocks.');
    }
}
