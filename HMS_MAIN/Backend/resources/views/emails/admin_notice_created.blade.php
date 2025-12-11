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
        .alert {
            background: #FFF3E0;
            border-left: 4px solid #FF9800;
            padding: 15px;
            margin: 15px 0;
            border-radius: 3px;
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
            <h2>Important Notice from Administration</h2>
        </div>

        <div class="content">
            <p>Dear {{ $recipientName }},</p>

            <div class="alert">
                <strong>Notice:</strong> {{ $notice->title }}
            </div>

            <div class="details">
                <div class="detail-row">
                    <span class="label">Title:</span>
                    <span>{{ $notice->title }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Date:</span>
                    <span>{{ $notice->created_at->format('M d, Y H:i A') }}</span>
                </div>
            </div>

            <div style="background: #f0f0f0; padding: 15px; margin: 15px 0; border-radius: 3px; line-height: 1.8;">
                <p>{{ $notice->description }}</p>
            </div>

            <p>Please review this notice carefully and take necessary action if required.</p>

            <p>If you have any questions or concerns, please contact the administration office.</p>

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
