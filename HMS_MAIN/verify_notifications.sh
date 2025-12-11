#!/bin/bash

# HMS Notification System Verification Script
# This script verifies all notification system components are properly set up

echo "================================================"
echo "HMS Notification System Verification"
echo "================================================"
echo ""

# Check Mailable Classes
echo "1. Checking Mailable Classes..."
MAILABLE_FILES=(
    "Backend/app/Mail/PaymentInitiatedStudent.php"
    "Backend/app/Mail/PaymentNotificationAdmin.php"
    "Backend/app/Mail/SalaryPaymentNotification.php"
    "Backend/app/Mail/StudentFinancialUpdate.php"
    "Backend/app/Mail/CheckInCheckOutApproved.php"
    "Backend/app/Mail/AdminNoticeCreated.php"
    "Backend/app/Mail/ComplaintUpdate.php"
)

for file in "${MAILABLE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ MISSING: $file"
    fi
done

echo ""
echo "2. Checking Email Templates..."
TEMPLATE_FILES=(
    "Backend/resources/views/emails/payment_initiated_student.blade.php"
    "Backend/resources/views/emails/payment_notification_admin.blade.php"
    "Backend/resources/views/emails/salary_payment_notification.blade.php"
    "Backend/resources/views/emails/student_financial_update.blade.php"
    "Backend/resources/views/emails/checkin_checkout_approved.blade.php"
    "Backend/resources/views/emails/admin_notice_created.blade.php"
    "Backend/resources/views/emails/complaint_update.blade.php"
)

for file in "${TEMPLATE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ MISSING: $file"
    fi
done

echo ""
echo "3. Checking Observers..."
OBSERVER_FILES=(
    "Backend/app/Observers/StudentFinancialObserver.php"
    "Backend/app/Observers/StudentCheckInCheckOutObserver.php"
    "Backend/app/Observers/ComplainObserver.php"
    "Backend/app/Observers/NoticeObserver.php"
)

for file in "${OBSERVER_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ MISSING: $file"
    fi
done

echo ""
echo "4. Checking AppServiceProvider Registration..."
if grep -q "StudentFinancialObserver" "Backend/app/Providers/AppServiceProvider.php"; then
    echo "   ✅ StudentFinancialObserver registered"
else
    echo "   ❌ StudentFinancialObserver NOT registered"
fi

if grep -q "StudentCheckInCheckOutObserver" "Backend/app/Providers/AppServiceProvider.php"; then
    echo "   ✅ StudentCheckInCheckOutObserver registered"
else
    echo "   ❌ StudentCheckInCheckOutObserver NOT registered"
fi

if grep -q "ComplainObserver" "Backend/app/Providers/AppServiceProvider.php"; then
    echo "   ✅ ComplainObserver registered"
else
    echo "   ❌ ComplainObserver NOT registered"
fi

if grep -q "NoticeObserver" "Backend/app/Providers/AppServiceProvider.php"; then
    echo "   ✅ NoticeObserver registered"
else
    echo "   ❌ NoticeObserver NOT registered"
fi

echo ""
echo "5. Checking Email Configuration..."
if grep -q "MAIL_HOST=live.smtp.mailtrap.io" "Backend/.env"; then
    echo "   ✅ Mailtrap SMTP configured"
else
    echo "   ⚠️  Mailtrap SMTP may not be configured correctly"
fi

if grep -q "tetre0173@gmail.com" "Backend/database/seeders/AdminSeeder.php"; then
    echo "   ✅ Admin email configured (tetre0173@gmail.com)"
else
    echo "   ⚠️  Admin email may not be configured"
fi

if grep -q "gamingsaurav98@gmail.com" "Backend/database/seeders/StudentPaymentSeeder.php"; then
    echo "   ✅ Student email configured (gamingsaurav98@gmail.com)"
else
    echo "   ⚠️  Student email may not be configured"
fi

if grep -q "dm4206203@gmail.com" "Backend/database/seeders/StaffSeeder.php"; then
    echo "   ✅ Staff email configured (dm4206203@gmail.com)"
else
    echo "   ⚠️  Staff email may not be configured"
fi

echo ""
echo "================================================"
echo "Verification Complete!"
echo "================================================"
echo ""
echo "Next Steps:"
echo "1. Update MAIL_PASSWORD in Backend/.env with your Mailtrap API token"
echo "2. Run: php artisan migrate"
echo "3. Run: php artisan db:seed"
echo "4. Test with: php artisan test:payment-email"
echo ""
