<!DOCTYPE html>
<html>
<head>
    <title>{{ $title }}</title>
</head>
<body>
    <h1>{{ $title }}</h1>

    <p>Dear {{ $recipientName }},</p>

    <div>
        {!! nl2br(e($content)) !!}
    </div>

    <p>Best regards,<br>
    HMS Administration</p>
</body>
</html>