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
        .footer {
            text-align: center;
            color: #666;
            font-size: 12px;
            margin-top: 20px;
        }
        .amount {
            font-size: 20px;
            color: #2196F3;
            font-weight: bold;
        }
        .alert {
            background: #E3F2FD;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin: 15px 0;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Payment Notification</h2>
        </div>

        <div class="content">
            <p>Dear Admin,</p>

            <p>A new payment has been registered in the Hostel Management System.</p>

            <div class="alert">
                <strong>{{ ucfirst($payeeType) }}</strong> has made a payment request.
            </div>

            <div class="details">
                <div class="detail-row">
                    <span class="label">{{ ucfirst($payeeType) }} Name:</span>
                    <span>{{ $studentName }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Payment Type:</span>
                    <span>{{ ucfirst(str_replace('_', ' ', $payment->payment_type)) }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Amount:</span>
                    <span class="amount">₹{{ number_format($payment->amount, 2) }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Status:</span>
                    <span style="color: #2196F3;">{{ ucfirst($payment->status) }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Description:</span>
                    <span>{{ $payment->description ?? 'N/A' }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Transaction ID:</span>
                    <span>{{ $payment->transaction_id ?? 'Pending' }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Payment Date:</span>
                    <span>{{ $payment->created_at->format('M d, Y H:i A') }}</span>
                </div>
                @if($payment->notes)
                <div class="detail-row">
                    <span class="label">Notes:</span>
                    <span>{{ $payment->notes }}</span>
                </div>
                @endif
            </div>

            <p>Please review and process this payment accordingly in the HMS System.</p>

            <p>Best regards,<br>
            <strong>HMS Automated System</strong></p>
        </div>

        <div class="footer">
            <p>This is an automated email from HMS System.</p>
            <p>&copy; {{ now()->year }} Hostel Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
