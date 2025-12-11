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
            background: #9C27B0;
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
            border-left: 4px solid #9C27B0;
        }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin: 10px 0;
            font-size: 14px;
        }
        .status-created {
            background: #E3F2FD;
            color: #1976D2;
        }
        .status-assigned {
            background: #FFF3E0;
            color: #F57C00;
        }
        .status-resolved {
            background: #E8F5E9;
            color: #388E3C;
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
            color: #9C27B0;
        }
        .alert {
            padding: 15px;
            margin: 15px 0;
            border-radius: 3px;
            border-left: 4px solid #9C27B0;
        }
        .alert-created {
            background: #E3F2FD;
            border-left-color: #1976D2;
        }
        .alert-assigned {
            background: #FFF3E0;
            border-left-color: #F57C00;
        }
        .alert-resolved {
            background: #E8F5E9;
            border-left-color: #388E3C;
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
            <h2>Complaint Status Update</h2>
        </div>

        <div class="content">
            <p>Dear {{ $complain->complainant_name ?? 'Student' }},</p>

            @if($updateType === 'created')
                <div class="alert alert-created">
                    <strong>Your complaint has been received!</strong> We will review it shortly and get back to you.
                </div>
                <p>Thank you for bringing this matter to our attention. Your complaint is important to us.</p>
            @elseif($updateType === 'assigned')
                <div class="alert alert-assigned">
                    <strong>Update:</strong> Your complaint has been assigned to our staff for investigation.
                </div>
                <p>A team member will contact you soon with more information.</p>
            @elseif($updateType === 'resolved')
                <div class="alert alert-resolved">
                    <strong>Resolution:</strong> Your complaint has been resolved!
                </div>
                <p>We appreciate your patience and hope the resolution meets your expectations.</p>
            @endif

            <div class="details">
                <div class="detail-row">
                    <span class="label">Complaint ID:</span>
                    <span>#{{ $complain->id }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Category:</span>
                    <span>{{ $complain->category ?? 'General' }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Submitted:</span>
                    <span>{{ $complain->created_at->format('M d, Y H:i A') }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Last Updated:</span>
                    <span>{{ $complain->updated_at->format('M d, Y H:i A') }}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Status:</span>
                    <span>
                        @if($updateType === 'created')
                            <span class="status-badge status-created">Received</span>
                        @elseif($updateType === 'assigned')
                            <span class="status-badge status-assigned">In Progress</span>
                        @elseif($updateType === 'resolved')
                            <span class="status-badge status-resolved">Resolved</span>
                        @endif
                    </span>
                </div>
            </div>

            <div style="background: #f0f0f0; padding: 15px; margin: 15px 0; border-radius: 3px;">
                <p><strong>Description:</strong></p>
                <p>{{ $complain->description }}</p>
            </div>

            <p>If you need any further assistance or have additional information to provide, please don't hesitate to contact us.</p>

            <p>Best regards,<br>
            <strong>HMS Support Team</strong></p>
        </div>

        <div class="footer">
            <p>This is an automated email from HMS System. Please do not reply to this email.</p>
            <p>&copy; {{ now()->year }} Hostel Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
