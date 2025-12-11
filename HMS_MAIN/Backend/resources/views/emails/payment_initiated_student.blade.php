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
        .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 20px;
        }
        .amount {
            font-size: 24px;
            color: #4CAF50;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Payment Request Initiated</h2>
        </div>

        <div class="content">
            <p>Dear {{ $studentName }},</p>

            <p>We hope this email finds you well. A payment request has been initiated for your account in our Hostel Management System.</p>

            <div class="details">
                <div class="detail-row">
                    <span class="label">Payment Type:</span>
                    <span>{{ ucfirst(str_replace('_', ' ', $payment->payment_type)) }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Amount Due:</span>
                    <span class="amount">₹{{ number_format($payment->amount, 2) }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Status:</span>
                    <span style="color: #FF9800;">{{ ucfirst($payment->status) }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Description:</span>
                    <span>{{ $payment->description ?? 'N/A' }}</span>
                </div>
                @if($payment->notes)
                <div class="detail-row">
                    <span class="label">Notes:</span>
                    <span>{{ $payment->notes }}</span>
                </div>
                @endif
            </div>

            <p><strong>Please complete this payment at your earliest convenience.</strong></p>

            <p>If you have any questions or concerns regarding this payment request, please contact the administration office.</p>

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
