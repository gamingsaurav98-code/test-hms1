<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Monthly Fee Invoice</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #9C27B0; color: white; padding: 20px; text-align: center; }
        .content { background: white; padding: 20px; border: 1px solid #ddd; }
        .invoice-details { background: #f9f9f9; padding: 15px; margin: 15px 0; }
        .amount { font-size: 24px; font-weight: bold; color: #9C27B0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Monthly Fee Invoice</h2>
        </div>

        <div class="content">
            <p>Dear {{ $student->student_name }},</p>

            <p>Your monthly fee invoice has been generated for {{ $bsDate }}.</p>

            <div class="invoice-details">
                <p><strong>Invoice Number:</strong> {{ $invoice->invoice_number }}</p>
                <p><strong>Amount:</strong> <span class="amount">Rs. {{ number_format($amount, 2) }}</span></p>
                <p><strong>Due Date:</strong> {{ $dueDate }}</p>
                <p><strong>Billing Period:</strong> {{ $bsDate }}</p>
            </div>

            <p>Please ensure payment is made by the due date to avoid any late fees.</p>

            <p>Best regards,<br>HMS Finance Team</p>
        </div>
    </div>
</body>
</html>