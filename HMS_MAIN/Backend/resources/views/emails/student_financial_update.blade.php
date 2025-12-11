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
            background: #4CAF50;
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
            border-left: 4px solid #4CAF50;
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
            color: #4CAF50;
        }
        .amount {
            font-size: 18px;
            color: #4CAF50;
            font-weight: bold;
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
            <h2>Financial Update Notification</h2>
        </div>

        <div class="content">
            <p>Dear {{ $studentName }},</p>

            @if($updateType === 'created')
                <p>A new financial record has been created for your account.</p>
            @elseif($updateType === 'updated')
                <p>Your financial record has been updated.</p>
            @elseif($updateType === 'payment_received')
                <p>Payment received! Thank you for your payment.</p>
            @endif

            <div class="details">
                <div class="detail-row">
                    <span class="label">Amount:</span>
                    <span class="amount">₹{{ number_format($financial->amount ?? 0, 2) }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Payment Date:</span>
                    <span>{{ optional($financial->payment_date)->format('M d, Y') ?? 'N/A' }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Balance Type:</span>
                    <span>{{ ucfirst($financial->balance_type ?? 'N/A') }}</span>
                </div>
                @if($financial->remark)
                <div class="detail-row">
                    <span class="label">Remarks:</span>
                    <span>{{ $financial->remark }}</span>
                </div>
                @endif
            </div>

            <p>If you have any questions regarding this financial update, please contact the administration office.</p>

            <p>Thank you,<br>
            <strong>HMS Administration</strong></p>
        </div>

        <div class="footer">
            <p>This is an automated email from HMS System. Please do not reply to this email.</p>
            <p>&copy; {{ now()->year }} Hostel Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
