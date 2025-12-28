<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Monthly Salary Notification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { background: white; padding: 20px; border: 1px solid #ddd; }
        .payroll-details { background: #f9f9f9; padding: 15px; margin: 15px 0; }
        .amount { font-size: 24px; font-weight: bold; color: #4CAF50; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Monthly Salary Notification</h2>
        </div>

        <div class="content">
            <p>Dear {{ $staff->name }},</p>

            <p>Your monthly salary has been processed for {{ $bsDate }}.</p>

            <div class="payroll-details">
                <p><strong>Payroll Number:</strong> {{ $payroll->payroll_number }}</p>
                <p><strong>Basic Salary:</strong> <span class="amount">Rs. {{ number_format($basicSalary, 2) }}</span></p>
                <p><strong>Pay Period:</strong> {{ $bsDate }}</p>
                <p><strong>Status:</strong> {{ ucfirst($payroll->status) }}</p>
            </div>

            <p>Your salary will be credited to your account as per the payment schedule.</p>

            <p>Best regards,<br>HMS Finance Team</p>
        </div>
    </div>
</body>
</html>