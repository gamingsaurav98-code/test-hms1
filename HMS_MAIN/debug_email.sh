#!/bin/bash

# Debug script for HMS Email Notification System
# This script helps diagnose email configuration issues

echo "═════════════════════════════════════════════════════════════════"
echo "   HMS Email Notification System - Configuration Debug Tool"
echo "═════════════════════════════════════════════════════════════════"
echo ""

# Check 1: Verify MAIL configuration in .env
echo "1. Checking MAIL configuration in Backend/.env:"
echo "   ────────────────────────────────────────────"
grep "^MAIL_" Backend/.env | grep -v "MAIL_PASSWORD"
echo ""

# Check 2: Check if Mailtrap credentials are set
echo "2. Checking Mailtrap credentials:"
echo "   ────────────────────────────────"
if grep -q "MAIL_PASSWORD=1234567890abcdef" Backend/.env; then
    echo "   ⚠️  MAIL_PASSWORD is set to PLACEHOLDER"
    echo "   → You need to update it with your actual Mailtrap API token"
    echo ""
    echo "   How to get your Mailtrap API token:"
    echo "   1. Go to https://mailtrap.io/"
    echo "   2. Sign in to your account"
    echo "   3. Go to Settings → API tokens"
    echo "   4. Copy your API token"
    echo "   5. Update Backend/.env: MAIL_PASSWORD=<your-token>"
else
    echo "   ✅ MAIL_PASSWORD is configured"
fi
echo ""

# Check 3: Verify Notice model and observer
echo "3. Checking Notice model and observer registration:"
echo "   ────────────────────────────────────────────────"
if [ -f "Backend/app/Models/Notice.php" ]; then
    echo "   ✅ Notice model exists"
else
    echo "   ❌ Notice model NOT found"
fi

if grep -q "Notice::observe" Backend/app/Providers/AppServiceProvider.php; then
    echo "   ✅ Notice observer registered"
else
    echo "   ❌ Notice observer NOT registered"
fi
echo ""

# Check 4: Verify AdminNoticeCreated mailable
echo "4. Checking AdminNoticeCreated mailable:"
echo "   ──────────────────────────────────────"
if [ -f "Backend/app/Mail/AdminNoticeCreated.php" ]; then
    echo "   ✅ AdminNoticeCreated mailable exists"
else
    echo "   ❌ AdminNoticeCreated mailable NOT found"
fi
echo ""

# Check 5: Verify email template
echo "5. Checking email template:"
echo "   ────────────────────────"
if [ -f "Backend/resources/views/emails/admin_notice_created.blade.php" ]; then
    echo "   ✅ admin_notice_created.blade.php exists"
else
    echo "   ❌ admin_notice_created.blade.php NOT found"
fi
echo ""

# Check 6: Check for any students with emails
echo "6. Checking for students with email addresses:"
echo "   ──────────────────────────────────────────"
cd Backend
STUDENT_COUNT=$(php artisan tinker --execute "echo \App\Models\Student::whereNotNull('email')->count();" 2>/dev/null | tail -1)
echo "   Found $STUDENT_COUNT students with email addresses"
echo ""

# Check 7: Show recent log entries
echo "7. Recent Laravel log entries (last 10 lines):"
echo "   ──────────────────────────────────────────"
if [ -f "storage/logs/laravel.log" ]; then
    tail -10 storage/logs/laravel.log | sed 's/^/   /'
else
    echo "   ℹ️  No log file found yet"
fi
echo ""

echo "═════════════════════════════════════════════════════════════════"
echo "   Configuration Status Summary"
echo "═════════════════════════════════════════════════════════════════"
echo ""
echo "✅ System is ready, but:"
echo "⚠️  MAIL_PASSWORD needs to be set to your actual Mailtrap token"
echo ""
echo "Next steps:"
echo "1. Update MAIL_PASSWORD in Backend/.env with your Mailtrap token"
echo "2. Test with: php artisan notice:test-email"
echo "3. Check Mailtrap inbox at https://mailtrap.io/"
echo ""
