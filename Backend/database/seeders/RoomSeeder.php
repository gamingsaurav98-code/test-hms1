<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Room;
use App\Models\Block;
use Faker\Factory as Faker;

class RoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        
        // Get all blocks
        $blocks = Block::all();
        
        if ($blocks->isEmpty()) {
            $this->command->warn('No blocks found! Please run BlockSeeder first.');
            return;
        }

        // Define room types and their properties
        $roomTypes = [
            'single' => ['capacity' => 1, 'weight' => 0.15], // 15% single rooms
            'double' => ['capacity' => 2, 'weight' => 0.40], // 40% double rooms
            'triple' => ['capacity' => 3, 'weight' => 0.30], // 30% triple rooms
            'four-bed' => ['capacity' => 4, 'weight' => 0.15], // 15% four-bed rooms
        ];

        // Room statuses
        $roomStatuses = [
            'available' => 0.70, // 70% available
            'occupied' => 0.20,  // 20% occupied (will be updated when students are assigned)
            'maintenance' => 0.10 // 10% under maintenance
        ];

        $totalRooms = 0;

        foreach ($blocks as $block) {
            // Determine number of rooms per block (8-15 rooms per block)
            $roomsPerBlock = $faker->numberBetween(8, 15);
            
            $this->command->info("Creating {$roomsPerBlock} rooms for {$block->block_name}...");

            for ($i = 1; $i <= $roomsPerBlock; $i++) {
                // Select room type based on weights
                $roomType = $this->getWeightedRandomElement($roomTypes);
                $capacity = $roomTypes[$roomType]['capacity'];
                
                // Generate room name
                $roomNumber = str_pad($i, 2, '0', STR_PAD_LEFT);
                $roomName = $block->block_name . '-' . $roomNumber;
                
                // Select status based on weights
                $status = $this->getWeightedRandomStatus($roomStatuses);
                
                // Create room data
                $roomData = [
                    'room_name' => $roomName,
                    'block_id' => $block->id,
                    'capacity' => $capacity,
                    'status' => $status,
                    'room_type' => $roomType,
                    'room_attachment' => null, // Can be updated later with actual file paths
                    'created_at' => $faker->dateTimeBetween('-2 years', '-3 months'),
                    'updated_at' => $faker->dateTimeBetween('-3 months', 'now'),
                ];

                $room = Room::create($roomData);
                $totalRooms++;
            }
            
            $this->command->info("Created {$roomsPerBlock} rooms for {$block->block_name}");
        }

        // Create some premium/special rooms
        $this->createSpecialRooms($blocks, $faker);

        $this->command->info("Room seeder completed! Created {$totalRooms} regular rooms + special rooms.");
        $this->showRoomStatistics();
    }

    /**
     * Create special/premium rooms
     */
    private function createSpecialRooms($blocks, $faker)
    {
        $specialRoomTypes = [
            'executive-single' => ['capacity' => 1],
            'executive-double' => ['capacity' => 2],
            'suite' => ['capacity' => 2],
            'deluxe' => ['capacity' => 1],
        ];

        // Add 2-3 special rooms per block
        foreach ($blocks as $block) {
            $specialRoomCount = $faker->numberBetween(2, 3);
            
            for ($i = 1; $i <= $specialRoomCount; $i++) {
                $roomType = $faker->randomElement(array_keys($specialRoomTypes));
                $capacity = $specialRoomTypes[$roomType]['capacity'];
                
                // Special room naming convention
                $roomName = $block->block_name . '-SP' . str_pad($i, 2, '0', STR_PAD_LEFT);
                
                $roomData = [
                    'room_name' => $roomName,
                    'block_id' => $block->id,
                    'capacity' => $capacity,
                    'status' => $faker->randomElement(['available', 'maintenance']),
                    'room_type' => $roomType,
                    'room_attachment' => null,
                    'created_at' => $faker->dateTimeBetween('-1 year', '-1 month'),
                    'updated_at' => $faker->dateTimeBetween('-1 month', 'now'),
                ];

                Room::create($roomData);
            }
        }
    }

    /**
     * Get weighted random element
     */
    private function getWeightedRandomElement($elements)
    {
        $random = mt_rand() / mt_getrandmax();
        $cumulativeWeight = 0;
        
        foreach ($elements as $type => $data) {
            $cumulativeWeight += $data['weight'];
            if ($random <= $cumulativeWeight) {
                return $type;
            }
        }
        
        // Fallback to first element
        return array_key_first($elements);
    }

    /**
     * Get weighted random status
     */
    private function getWeightedRandomStatus($statuses)
    {
        $random = mt_rand() / mt_getrandmax();
        $cumulativeWeight = 0;
        
        foreach ($statuses as $status => $weight) {
            $cumulativeWeight += $weight;
            if ($random <= $cumulativeWeight) {
                return $status;
            }
        }
        
        return 'available'; // Fallback
    }

    /**
     * Display room statistics
     */
    private function showRoomStatistics()
    {
        $totalRooms = Room::count();
        $roomsByType = Room::select('room_type', \DB::raw('count(*) as count'))
                          ->groupBy('room_type')
                          ->orderBy('count', 'desc')
                          ->get();

        $roomsByStatus = Room::select('status', \DB::raw('count(*) as count'))
                           ->groupBy('status')
                           ->get();

        $this->command->info('');
        $this->command->info('=== ROOM STATISTICS ===');
        $this->command->info("Total Rooms: {$totalRooms}");
        
        $this->command->info('');
        $this->command->info('Rooms by Type:');
        foreach ($roomsByType as $type) {
            $this->command->info("  {$type->room_type}: {$type->count} rooms");
        }
        
        $this->command->info('');
        $this->command->info('Rooms by Status:');
        foreach ($roomsByStatus as $status) {
            $this->command->info("  {$status->status}: {$status->count} rooms");
        }

        $totalCapacity = Room::sum('capacity');
        $this->command->info('');
        $this->command->info("Total Accommodation Capacity: {$totalCapacity} students");
    }
}
