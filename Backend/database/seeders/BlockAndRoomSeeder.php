<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Block;
use App\Models\Room;

class BlockAndRoomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * This seeder creates both blocks and rooms in the correct order.
     */
    public function run(): void
    {
        $this->command->info('🏢 Starting Block and Room Seeder...');
        $this->command->info('');

        // Check if data already exists
        $existingBlocks = Block::count();
        $existingRooms = Room::count();

        if ($existingBlocks > 0 || $existingRooms > 0) {
            $this->command->warn("⚠️  Found existing data:");
            $this->command->warn("   Blocks: {$existingBlocks}");
            $this->command->warn("   Rooms: {$existingRooms}");
            $this->command->warn('');
            
            if (!$this->command->confirm('Do you want to continue? This will add more data.')) {
                $this->command->info('Seeding cancelled.');
                return;
            }
        }

        // Run Block Seeder first
        $this->command->info('📋 Step 1: Creating Blocks...');
        $this->call(BlockSeeder::class);
        
        $this->command->info('');
        $this->command->info('🏠 Step 2: Creating Rooms...');
        $this->call(RoomSeeder::class);

        // Final summary
        $this->showFinalSummary();
    }

    /**
     * Show final summary of created data
     */
    private function showFinalSummary()
    {
        $totalBlocks = Block::count();
        $totalRooms = Room::count();
        $totalCapacity = Room::sum('capacity');

        $this->command->info('');
        $this->command->info('🎉 === SEEDING COMPLETED SUCCESSFULLY ===');
        $this->command->info('');
        $this->command->info("📊 Final Statistics:");
        $this->command->info("   Total Blocks: {$totalBlocks}");
        $this->command->info("   Total Rooms: {$totalRooms}");
        $this->command->info("   Total Capacity: {$totalCapacity} students");
        $this->command->info('');

        // Show blocks with room counts
        $blocksWithRooms = Block::withCount('rooms')->get();
        $this->command->info("📋 Blocks Overview:");
        foreach ($blocksWithRooms as $block) {
            $this->command->info("   {$block->block_name}: {$block->rooms_count} rooms - {$block->location}");
        }

        $this->command->info('');
        $this->command->info('🚀 You can now:');
        $this->command->info('   1. Run student seeders to populate students');
        $this->command->info('   2. View blocks in your admin panel');
        $this->command->info('   3. Manage room assignments');
        $this->command->info('   4. Start using the hostel management system');
        $this->command->info('');
    }
}
