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
            background: #FF9800;
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
            border-left: 4px solid #FF9800;
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
            color: #FF9800;
        }
        .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 20px;
        }
        .amount {
            font-size: 24px;
            color: #FF9800;
            font-weight: bold;
        }
        .success {
            background: #C8E6C9;
            border-left: 4px solid #4CAF50;
            padding: 15px;
            margin: 15px 0;
            border-radius: 3px;
            color: #2E7D32;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Salary Payment Notification</h2>
        </div>

        <div class="content">
            <p>Dear {{ $staffName }},</p>

            <div class="success">
                ✓ Your salary payment has been processed successfully!
            </div>

            <p>We are pleased to inform you that your salary has been credited to your account.</p>

            <div class="details">
                <div class="detail-row">
                    <span class="label">Payment Amount:</span>
                    <span class="amount">₹{{ number_format($payment->amount, 2) }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Payment Type:</span>
                    <span>Salary</span>
                </div>
                <div class="detail-row">
                    <span class="label">Status:</span>
                    <span style="color: #4CAF50;">{{ ucfirst($payment->status) }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Transaction ID:</span>
                    <span>{{ $payment->transaction_id ?? 'N/A' }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Payment Date:</span>
                    <span>{{ ($payment->paid_at ?? $payment->created_at)->format('M d, Y H:i A') }}</span>
                </div>
                @if($payment->notes)
                <div class="detail-row">
                    <span class="label">Notes:</span>
                    <span>{{ $payment->notes }}</span>
                </div>
                @endif
            </div>

            <p>If you have any questions regarding your salary payment, please contact the Human Resources Department or the Administration Office.</p>

            <p>Thank you for your dedicated service!<br>
            <strong>HMS Administration</strong></p>
        </div>

        <div class="footer">
            <p>This is an automated email from HMS System. Please do not reply to this email.</p>
            <p>&copy; {{ now()->year }} Hostel Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
