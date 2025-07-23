.flag {
            font-size: 48px;
            text-align: center;
            margin-bottom: 16px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🇮🇳 Free-me Independence Special - 80% OFF</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        
        body {
            margin: 0;
            padding: 0;
            font-family: 'Manrope', Arial, sans-serif;
            background-color: #000000;
            color: #ffffff;
            line-height: 1.6;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #FF9933 0%, #FFFFFF 33%, #FFFFFF 66%, #138808 100%);
            padding: 2px;
        }
        
        .email-content {
            background-color: #000000;
            padding: 32px 24px;
            border-radius: 8px;
        }
        
        .flag {
            font-size: 48px;
            text-align: center;
            margin-bottom: 16px;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        .badge {
            background: linear-gradient(135deg, #FF9933, #FFFFFF, #138808);
            color: #000000;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            text-align: center;
            margin: 0 auto 20px;
            display: inline-block;
            width: fit-content;
        }
        
        .headline {
            font-size: 36px;
            font-weight: 800;
            text-align: center;
            margin-bottom: 16px;
            line-height: 1.2;
        }
        
        .gradient-text {
            background: linear-gradient(135deg, #20CEB6, #2E2ADC);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .subtitle {
            font-size: 18px;
            color: #CECFD2;
            text-align: center;
            margin-bottom: 32px;
            line-height: 1.5;
        }
        
        .pricing-card {
            background: linear-gradient(135deg, #4F46E5, #7C3AED);
            padding: 24px;
            border-radius: 16px;
            text-align: center;
            margin-bottom: 32px;
            border: 2px solid transparent;
            background-clip: padding-box;
        }
        
        .pricing-card::before {
            content: '';
            position: absolute;
            inset: 0;
            padding: 2px;
            background: linear-gradient(135deg, #FF9933, #FFFFFF, #138808);
            border-radius: inherit;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: exclude;
        }
        
        .price-comparison {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            margin: 20px 0;
        }
        
        .old-price {
            color: #ff6b6b;
            text-decoration: line-through;
            font-size: 18px;
        }
        
        .new-price {
            font-size: 48px;
            font-weight: 900;
            color: #ffd43b;
        }
        
        .arrow {
            font-size: 32px;
            color: #ffffff;
        }
        
        .features {
            background: rgba(255, 255, 255, 0.1);
            padding: 16px;
            border-radius: 12px;
            margin: 20px 0;
            backdrop-filter: blur(10px);
        }
        
        .feature-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .feature-item:last-child {
            margin-bottom: 0;
        }
        
        .checkmark {
            color: #4ade80;
            font-weight: bold;
        }
        
        .cta-button {
            background: linear-gradient(135deg, #10B981, #059669);
            color: white;
            padding: 16px 32px;
            border-radius: 25px;
            text-decoration: none;
            font-weight: 700;
            font-size: 18px;
            display: inline-block;
            text-align: center;
            width: 100%;
            box-sizing: border-box;
            margin-bottom: 16px;
            transition: transform 0.2s;
        }
        
        .cta-button:hover {
            transform: scale(1.05);
        }
        
        .urgency {
            background: rgba(255, 165, 0, 0.2);
            border: 1px solid #ffa500;
            padding: 12px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 24px;
            font-size: 14px;
            color: #ffd700;
        }
        
        .countdown {
            text-align: center;
            margin: 24px 0;
        }
        
        .countdown-digits {
            display: flex;
            justify-content: center;
            gap: 16px;
            margin-top: 12px;
        }
        
        .countdown-digit {
            background: linear-gradient(135deg, #FF9933, #138808);
            color: white;
            padding: 12px;
            border-radius: 8px;
            font-weight: 800;
            font-size: 24px;
            min-width: 50px;
            text-align: center;
        }
        
        .countdown-label {
            font-size: 12px;
            color: #B0B0B0;
            margin-top: 4px;
        }
        
        .benefits {
            display: flex;
            justify-content: space-around;
            margin: 24px 0;
            font-size: 13px;
            color: #B0B0B0;
        }
        
        .footer {
            text-align: center;
            font-size: 14px;
            color: #888;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #333;
        }
        
        .unsubscribe {
            font-size: 12px;
            color: #666;
            margin-top: 16px;
        }
        
        .unsubscribe a {
            color: #20CEB6;
            text-decoration: none;
        }
        
        @media (max-width: 600px) {
            .email-content {
                padding: 24px 16px;
            }
            
            .headline {
                font-size: 28px;
            }
            
            .new-price {
                font-size: 36px;
            }
            
            .countdown-digits {
                gap: 8px;
            }
            
            .countdown-digit {
                padding: 8px;
                font-size: 18px;
                min-width: 40px;
            }
            
            .benefits {
                flex-direction: column;
                gap: 8px;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-content">
            <!-- Badge -->
            <div style="text-align: center;">
                <div class="badge">Free-me Independence Special</div>
            </div>
            
            <!-- Headline -->
            <h1 class="headline">
                Free-me from<br>
                <span class="gradient-text">Job Application Hell!</span>
            </h1>
            
            <!-- Subtitle -->
            <p class="subtitle">
                This Independence Day, break free from endless rejections. Our AI applies to 50+ jobs daily while you focus on interviews.
            </p>
            
            <!-- Pricing Card -->
                            <div class="pricing-card" style="position: relative;">
                <h3 style="margin: 0 0 16px 0; font-size: 24px;">Free-me Special</h3>
                
                <div class="price-comparison">
                    <div>
                        <div class="old-price">₹999</div>
                        <div style="font-size: 14px; color: #ff6b6b;">Regular</div>
                    </div>
                    <div class="arrow">→</div>
                    <div>
                        <div class="new-price">₹194.7</div>
                        <div style="font-size: 16px;">First Month</div>
                    </div>
                </div>
                
                <div class="features">
                    <div class="feature-item">
                        <span class="checkmark">✓</span>
                        <span>50+ daily job applications</span>
                    </div>
                    <div class="feature-item">
                        <span class="checkmark">✓</span>
                        <span>Live application tracking</span>
                    </div>
                    <div class="feature-item">
                        <span class="checkmark">✓</span>
                        <span>CAPTCHA solving included</span>
                    </div>
                    <div class="feature-item">
                        <span class="checkmark">✓</span>
                        <span>24/7 automated applying</span>
                    </div>
                </div>
                
                <a href="https://aipply.io/free-me" class="cta-button">
                    Free-me Now - ₹194.7
                </a>
            </div>
            
            <!-- Countdown -->
            <div class="countdown">
                <h3 style="margin: 0 0 12px 0; font-size: 18px;">Offer Ends In:</h3>
                <div class="countdown-digits">
                    <div style="text-align: center;">
                        <div class="countdown-digit">18</div>
                        <div class="countdown-label">Days</div>
                    </div>
                    <div style="text-align: center;">
                        <div class="countdown-digit">00</div>
                        <div class="countdown-label">Hours</div>
                    </div>
                    <div style="text-align: center;">
                        <div class="countdown-digit">00</div>
                        <div class="countdown-label">Minutes</div>
                    </div>
                </div>
            </div>
            
            <!-- Urgency -->
            <div class="urgency">
                <strong>Limited Time:</strong> Offer expires August 15th, 2025 - Independence Day!
            </div>
            
            <!-- Benefits -->
            <div class="benefits">
                <span>✓ No Setup Required</span>
                <span>✓ Cancel Anytime</span>
                <span>✓ Results in 7 Days</span>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <p>Questions? Email <span style="color: #20CEB6;">support@aipply.io</span></p>
                
                <div class="unsubscribe">
                    <p>You're receiving this because you signed up for aipply.io updates.</p>
                    <p><a href="#">Unsubscribe</a> | <a href="#">Update Preferences</a></p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
