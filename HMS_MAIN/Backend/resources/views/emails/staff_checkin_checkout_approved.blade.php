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
            <h2>Staff Check-In/Check-Out Request Update</h2>
        </div>

        <div class="content">
            <p>Dear {{ $staffName }},</p>

            <div class="@if($status === 'approved') status-approved @else status-rejected @endif">
                @if($status === 'approved')
                    ✓ Your check-in/check-out request has been <strong>APPROVED</strong>
                @else
                    ✗ Your check-in/check-out request has been <strong>REJECTED</strong>
                @endif
            </div>

            <div class="details">
                <div class="detail-row">
                    <span class="label">Check-out Date:</span>
                    <span>{{ $record->date ?? 'N/A' }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Check-out Time:</span>
                    <span>{{ $record->checkout_time ?? $record->requested_checkout_time ?? 'N/A' }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Check-in Time:</span>
                    <span>{{ $record->checkin_time ?? $record->estimated_checkin_date ?? 'N/A' }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Duration:</span>
                    <span>{{ $record->checkout_duration ?? 0 }} days</span>
                </div>
                <div class="detail-row">
                    <span class="label">Rule Applied:</span>
                    <span>{{ $record->rule_applied ?? 'None' }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Salary Amount:</span>
                    <span>Rs. {{ number_format($record->staff->salary_amount ?? 0, 2) }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Deduction Amount:</span>
                    <span>Rs. {{ number_format($record->deduction_amount ?? 0, 2) }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Adjusted Salary:</span>
                    <span>Rs. {{ number_format($record->adjusted_amount ?? ($record->staff->salary_amount ?? 0), 2) }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Status:</span>
                    <span style="color: @if($status === 'approved') #4CAF50 @else #F44336 @endif; font-weight: bold;">
                        {{ ucfirst($status) }}
                    </span>
                </div>
                @if($record->remark)
                <div class="detail-row">
                    <span class="label">Remarks:</span>
                    <span>{{ $record->remark }}</span>
                </div>
                @endif
            </div>

            @if($status === 'rejected')
                <p><strong>Note:</strong> If you have any questions about the rejection, please contact the administration office.</p>
            @else
                <p>Your request has been processed successfully. Please ensure you comply with the check-in/check-out procedures.</p>
            @endif

            <p>Thank you,<br>
            <strong>Staff Administration</strong></p>
        </div>

        <div class="footer">
            <p>This is an automated email from HMS System. Please do not reply to this email.</p>
            <p>&copy; {{ now()->year }} Hostel Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>