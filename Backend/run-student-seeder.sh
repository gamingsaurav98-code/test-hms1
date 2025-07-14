#!/bin/bash

# Student Seeder Runner Script
# This script runs the student seeder with all dependencies

echo "🏠 HMS Student Seeder"
echo "==================="

echo "📝 Running student seeder..."

# Run the complete student seeder (includes blocks and rooms)
php artisan db:seed --class=CompleteStudentSeeder

echo "✅ Student seeder completed!"
echo ""
echo "🔍 You can now check the students in your application:"
echo "   - Total students created: 30"
echo "   - Each student has 2-5 amenities"
echo "   - Students are assigned to rooms"
echo "   - All form fields are populated with realistic data"
echo ""
echo "🚀 Start your application and view the student index page to see all the data!"
