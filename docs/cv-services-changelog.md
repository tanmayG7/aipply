# CV Services Payment Integration - Changelog

## v1.0.0 (January 2025)

### Payment System
- Razorpay payment integration with checkout modal
- Order creation API (`/api/cv-services/create-order`)
- Payment verification API (`/api/cv-services/verify-payment`)
- Webhook handler for automated payment status updates
- HMAC-SHA256 payment signature verification

### Email Notifications
- Resend email service integration
- Customer confirmation emails with order details
- Admin notification emails for new orders

### Dashboard Integration
- CV Orders card component for user dashboard
- Real-time order tracking with status badges
- Order history display

### Security
- Removed manual card input fields (was a PCI-DSS violation)
- All payment data handled by Razorpay (never touches our servers)
- Firebase authentication required for purchases

### Performance
- Reduced blur effects from 350px to 120px
- Conditional rendering of blur effects (desktop only, >1024px)
- GPU acceleration with `will-change: transform`

### Database

New collection: `cv_orders`
- Fields: orderId, userId, customerDetails, payment, serviceDetails, status, timestamps
- Security: Users can only read their own orders

### API Endpoints

```
POST /api/cv-services/create-order
POST /api/cv-services/verify-payment
POST /api/razorpay/webhook (extended for CV services)
```

### Dependencies Added
- `resend` - Email service API

### Breaking Changes
- Removed manual card input fields (Razorpay modal handles card input)
- Authentication now required to purchase
- Price changed from INR 2,999 to INR 987

### Known Issues
1. Email test domain: Using Resend test domain initially. Verify custom domain before production.
2. Analytics placeholder: Conversion ID (`AW-CONVERSION_ID`) needs replacement.
3. Admin email hardcoded to `admin@aipply.io`. Make configurable via env variable.
