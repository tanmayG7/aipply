# ⚡ Quick Start: CV Services Payment Testing

## 🚀 Get Testing in 5 Minutes!

### Step 1: Environment Setup (2 minutes)

1. **Copy environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Add REQUIRED keys to `.env.local`:**
   ```bash
   # Razorpay TEST keys (get from https://dashboard.razorpay.com)
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
   RAZORPAY_KEY_SECRET=YOUR_SECRET
   RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET

   # Resend (get from https://resend.com/api-keys)
   RESEND_API_KEY=re_YOUR_KEY
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

### Step 2: Start Server (30 seconds)

```bash
npm run dev
```

Server starts at `http://localhost:3000`

### Step 3: Test Payment (2 minutes)

1. **Navigate to:** `http://localhost:3000/cv-services`

2. **Log in** (required for purchase)

3. **Fill form:**
   ```
   Full Name: John Doe
   Email: test@example.com
   Phone: 9876543210
   ```

4. **Click:** "Complete Payment - ₹987"

5. **In Razorpay modal, use test card:**
   ```
   Card: 4111 1111 1111 1111
   Expiry: 12/25 (any future date)
   CVV: 123 (any 3 digits)
   OTP: 123456 (any 6 digits in test mode)
   ```

6. **Success!** You should see:
   - ✅ Success modal with order ID
   - 📧 Confirmation email
   - 📊 Order in Firebase
   - 🎯 Order in dashboard

---

## ✅ Quick Verification Checklist

After payment:
- [ ] Success modal appeared
- [ ] Email received (check spam folder)
- [ ] Firebase `cv_orders` collection has new document
- [ ] Dashboard shows order (navigate to `/dashboard/home`)
- [ ] Console logs show no errors

---

## 🐛 Quick Troubleshooting

**"Payment system not loaded"**
→ Check NEXT_PUBLIC_RAZORPAY_KEY_ID is set

**"Authentication required"**
→ Log in first at `/onboarding/login`

**No email received**
→ Check RESEND_API_KEY is set, using `onboarding@resend.dev` as sender

**Order not in Firebase**
→ Check Firebase rules, ensure user is authenticated

---

## 📖 Full Documentation

For complete testing procedures, see:
- **[Full Testing Guide](./CV-SERVICES-TESTING-GUIDE.md)** - Comprehensive
- **[Implementation Summary](./CV-SERVICES-IMPLEMENTATION-SUMMARY.md)** - Overview

---

## 🆘 Need Help?

1. Check console logs (F12)
2. Check server logs (terminal)
3. Review [Testing Guide](./CV-SERVICES-TESTING-GUIDE.md)
4. Contact: support@aipply.io

---

**Happy Testing! 🎉**
