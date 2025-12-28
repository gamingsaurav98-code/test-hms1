<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: #f9f9f9;
        }
        .header {
            background: #2196F3;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px;
        }
        .content {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            border-left: 4px solid #2196F3;
        }
        .details {
            background: #f5f5f5;
            padding: 15px;
            margin: 15px 0;
            border-radius: 3px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #ddd;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: bold;
            color: #2196F3;
        }
        .status-approved {
            background: #C8E6C9;
            border-left: 4px solid #4CAF50;
            padding: 15px;
            margin: 15px 0;
            border-radius: 3px;
            color: #2E7D32;
        }
        .status-rejected {
            background: #FFCDD2;
            border-left: 4px solid #F44336;
            padding: 15px;
            margin: 15px 0;
            border-radius: 3px;
            color: #C62828;
        }
        .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Check-In/Check-Out Request Update</h2>
        </div>

        <div class="content">
            <p>Dear <?php echo e($studentName); ?>,</p>

            <div class="<?php if($status === 'approved'): ?> status-approved <?php else: ?> status-rejected <?php endif; ?>">
                <?php if($status === 'approved'): ?>
                    ✓ Your check-in/check-out request has been <strong>APPROVED</strong>
                <?php else: ?>
                    ✗ Your check-in/check-out request has been <strong>REJECTED</strong>
                <?php endif; ?>
            </div>

            <div class="details">
                <div class="detail-row">
                    <span class="label">Check-out Date:</span>
                    <span><?php echo e($record->date ?? 'N/A'); ?></span>
                </div>
                <div class="detail-row">
                    <span class="label">Check-out Time:</span>
                    <span><?php echo e($record->checkout_time ?? $record->requested_checkout_time ?? 'N/A'); ?></span>
                </div>
                <div class="detail-row">
                    <span class="label">Check-in Time:</span>
                    <span><?php echo e($record->checkin_time ?? $record->estimated_checkin_date ?? 'N/A'); ?></span>
                </div>
                <div class="detail-row">
                    <span class="label">Duration:</span>
                    <span><?php echo e($record->checkout_duration ?? 0); ?> days</span>
                </div>
                <div class="detail-row">
                    <span class="label">Rule Applied:</span>
                    <span><?php echo e($record->rule_applied ?? 'None'); ?></span>
                </div>
                <div class="detail-row">
                    <span class="label">Monthly Fee:</span>
                    <span>Rs. <?php echo e(number_format($record->student->monthly_fee ?? 0, 2)); ?></span>
                </div>
                <div class="detail-row">
                    <span class="label">Deduction Amount:</span>
                    <span>Rs. <?php echo e(number_format($record->deduction_amount ?? 0, 2)); ?></span>
                </div>
                <div class="detail-row">
                    <span class="label">Adjusted Fee:</span>
                    <span>Rs. <?php echo e(number_format($record->adjusted_fee ?? ($record->student->monthly_fee ?? 0), 2)); ?></span>
                </div>
                <div class="detail-row">
                    <span class="label">Status:</span>
                    <span style="color: <?php if($status === 'approved'): ?> #4CAF50 <?php else: ?> #F44336 <?php endif; ?>; font-weight: bold;">
                        <?php echo e(ucfirst($status)); ?>

                    </span>
                </div>
                <?php if($record->remark): ?>
                <div class="detail-row">
                    <span class="label">Remarks:</span>
                    <span><?php echo e($record->remark); ?></span>
                </div>
                <?php endif; ?>
            </div>

            <?php if($status === 'rejected'): ?>
                <p><strong>Note:</strong> If you have any questions about the rejection, please contact the administration office.</p>
            <?php else: ?>
                <p>Your request has been processed successfully. Please ensure you comply with the check-in/check-out procedures.</p>
            <?php endif; ?>

            <p>Thank you,<br>
            <strong>HMS Administration</strong></p>
        </div>

        <div class="footer">
            <p>This is an automated email from HMS System. Please do not reply to this email.</p>
            <p>&copy; <?php echo e(now()->year); ?> Hostel Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
<?php /**PATH /var/www/html/resources/views/emails/checkin_checkout_approved.blade.php ENDPATH**/ ?>