#!/bin/bash

# HMS Payment System - Quick Setup Script

echo "================================"
echo "HMS Payment System Setup"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd Backend

# Step 1: Run migrations
echo -e "${YELLOW}Step 1: Running database migrations...${NC}"
php artisan migrate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migrations completed${NC}"
else
    echo -e "${RED}✗ Migration failed${NC}"
    exit 1
fi

echo ""

# Step 2: Seed test data
echo -e "${YELLOW}Step 2: Seeding test data...${NC}"
php artisan db:seed --class=StudentPaymentSeeder
php artisan db:seed --class=AdminSeeder
php artisan db:seed --class=StaffSeeder

echo ""

# Step 3: Verify Mailtrap configuration
echo -e "${YELLOW}Step 3: Checking mail configuration...${NC}"
if grep -q "live.smtp.mailtrap.io" .env; then
    echo -e "${GREEN}✓ Mailtrap SMTP is configured${NC}"
else
    echo -e "${RED}⚠ WARNING: Mailtrap configuration not found in .env${NC}"
    echo "  Please update your .env file with Mailtrap credentials"
fi

echo ""

# Step 4: Show test command
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Test email delivery with:"
echo ""
echo -e "${YELLOW}# Send test student payment email${NC}"
echo "php artisan payment:test-email student avi@example.com"
echo ""
echo -e "${YELLOW}# Send test staff salary email${NC}"
echo "php artisan payment:test-email staff staff1@hms.com"
echo ""
echo -e "${YELLOW}# Send test admin notification${NC}"
echo "php artisan payment:test-email admin admin@hms.com"
echo ""
echo "View emails in your Mailtrap inbox:"
echo "https://mailtrap.io/inboxes"
echo ""
echo -e "${YELLOW}Test Data:${NC}"
echo "  Student: avi@example.com (verified)"
echo "  Admin: admin@hms.com (from seeder)"
echo "  Staff: staff1@hms.com - staff10@hms.com (from seeder)"
echo ""
echo "For more details, see: PAYMENT_SETUP.md"
echo ""
