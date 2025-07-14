@echo off
REM Complete HMS Seeder Runner Script for Windows
REM This script runs all seeders in the correct order

echo 🏠 Complete HMS Seeder
echo =====================
echo.
echo This will create:
echo   📋 Blocks (12 blocks with managers)
echo   🏠 Rooms (120-180 rooms of various types)
echo   👥 Students (30 students with full details)
echo   🎯 Amenities (2-5 per student)
echo.

set /p confirm="Do you want to continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo Seeding cancelled.
    pause
    exit /b
)

echo.
echo 🚀 Starting complete HMS seeding process...
echo.

REM Step 1: Create blocks and rooms
echo 📋 Step 1: Creating blocks and rooms...
php artisan db:seed --class=BlockAndRoomSeeder

echo.

REM Step 2: Create students with amenities
echo 👥 Step 2: Creating students with amenities...
php artisan db:seed --class=StudentSeeder

echo.
echo 🎉 Complete HMS seeding finished!
echo.
echo 📊 Your HMS system now has:
echo   ✅ Realistic hostel blocks with managers
echo   ✅ Various room types (single, double, triple, four-bed)
echo   ✅ Students with comprehensive information
echo   ✅ Student amenities and room assignments
echo.
echo 🚀 You can now:
echo   1. Start your Laravel backend: php artisan serve
echo   2. Start your Next.js frontend: npm run dev
echo   3. Visit the student management page
echo   4. View all the seeded data in detailed view
echo.

pause
