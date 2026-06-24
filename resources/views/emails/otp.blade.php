<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Kode OTP Verifikasi - Money Manager</title>
    <style>
        body {
            background-color: #070b09;
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .card {
            background-color: #0d1310;
            border: 1px border #1f2823;
            border-radius: 24px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .logo {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 56px;
            height: 56px;
            border-radius: 16px;
            background-color: #121c17;
            border: 1px solid rgba(16, 185, 129, 0.4);
            margin-bottom: 24px;
        }
        .logo svg {
            width: 28px;
            height: 28px;
            fill: none;
            stroke: #10b981;
            stroke-width: 2;
        }
        h1 {
            font-size: 24px;
            font-weight: 700;
            margin-top: 0;
            margin-bottom: 12px;
            color: #ffffff;
            letter-spacing: -0.025em;
        }
        p {
            font-size: 15px;
            color: #a0aec0;
            line-height: 1.6;
            margin-bottom: 24px;
        }
        .otp-code {
            display: inline-block;
            font-size: 32px;
            font-weight: 800;
            letter-spacing: 0.15em;
            color: #05cd99;
            background-color: #121c17;
            border: 1px solid #1f2823;
            padding: 14px 28px;
            border-radius: 16px;
            margin: 10px 0 24px 0;
            text-shadow: 0 0 10px rgba(5, 205, 153, 0.2);
        }
        .footer {
            font-size: 12px;
            color: #4a5568;
            margin-top: 32px;
            border-top: 1px solid #1a202c;
            padding-top: 24px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="logo">
                <!-- SVG Icon similar to Money Manager Logo -->
                <svg viewBox="0 0 24 24" stroke="currentColor">
                    <rect width="20" height="14" x="2" y="5" rx="2" stroke-linecap="round" stroke-linejoin="round" />
                    <line x1="2" x2="22" y1="10" y2="10" stroke-linecap="round" stroke-linejoin="round" />
                    <line x1="6" x2="10" y1="15" y2="15" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>
            <h1>Reset Password</h1>
            <p>Kami menerima permintaan untuk mereset password akun Money Manager Anda. Gunakan kode verifikasi OTP di bawah ini untuk melanjutkan:</p>
            <div class="otp-code">{{ $otpCode }}</div>
            <p style="font-size: 13px; color: #718096; margin-top: 0;">Kode ini hanya berlaku selama <strong>5 menit</strong>. Jangan bagikan kode ini kepada siapapun.</p>
            <div class="footer">
                &copy; {{ date('Y') }} Money Manager. Hak cipta dilindungi undang-undang.
            </div>
        </div>
    </div>
</body>
</html>
