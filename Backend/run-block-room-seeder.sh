#!/bin/bash

# Block and Room Seeder Runner Script
# This script runs the block and room seeders

echo "🏢 HMS Block and Room Seeder"
echo "============================"

echo "📝 Running block and room seeders..."

# Run the combined block and room seeder
php artisan db:seed --class=BlockAndRoomSeeder

echo "✅ Block and room seeder completed!"
echo ""
echo "🔍 Summary:"
echo "   - Blocks created with realistic managers and locations"
echo "   - Rooms created with various types (single, double, triple, four-bed)"
echo "   - Special rooms (executive, suite, deluxe) included"
echo "   - Room capacities and statuses properly set"
echo ""
echo "🚀 Next steps:"
echo "   1. Run student seeder: php artisan db:seed --class=CompleteStudentSeeder"
echo "   2. Start your application and manage hostel data"
