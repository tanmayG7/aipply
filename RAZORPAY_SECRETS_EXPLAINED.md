# 🔑 Razorpay Secrets Explained - No Confusion!

## The Truth: You Need 3 DIFFERENT Secrets

### 📊 What You Currently Have:

```bash
# .env.local (Current State):
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_NhwNzRMwUdwYx1     ✅ HAVE
RAZORPAY_WEBHOOK_SECRET=a_uN7XaMRMBJ@fy                ✅ HAVE (duplicate!)
RAZORPAY_WEBHOOK_SECRET=a_uN7XaMRMBJ@fy                ✅ HAVE (duplicate!)
RAZORPAY_KEY_SECRET=???                                 ❌ MISSING!!!
```

### 🔍 What the Code Actually Uses:

| Variable Name | Used Where | Purpose | You Have It? |
|---------------|------------|---------|--------------|
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Client + Server | Public identifier (like username) | ✅ YES |
| `RAZORPAY_KEY_SECRET` | Server ONLY | Secret key for API auth (like password) | ❌ NO |
| `RAZORPAY_WEBHOOK_SECRET` | Server ONLY | Verifies webhook signatures | ✅ YES |

---

## 🎯 The Code Evidence

### 1. Admin Panel Cancellation (lib/utils/razorpayAdmin.ts:6-13)
```typescript
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;      // ✅ You have
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;          // ❌ MISSING!

function getAuthHeader(): string {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured');  // ← This will throw!
  }
  return Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
}
```

**What this does**: Creates Basic Auth header for Razorpay API
**Format**: `Authorization: Basic base64(key_id:key_secret)`
**Status**: ❌ **WILL FAIL** - Missing `RAZORPAY_KEY_SECRET`

---

### 2. Subscription Creation (app/api/create-subscription/route.ts:4-19)
```typescript
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;      // ✅ You have
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;          // ❌ MISSING!

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  return NextResponse.json(
    { error: 'Payment system not configured' },  // ← This will return!
    { status: 500 }
  );
}

const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
```

**Status**: ❌ **WILL FAIL** - Returns "Payment system not configured"

---

### 3. Webhook Verification (app/api/razorpay/webhook/route.ts:10-26)
```typescript
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;  // ✅ You have

const expectedSignature = crypto
  .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
  .update(body)
  .digest('hex');
```

**Status**: ✅ **WORKS** - You have this secret

---

## 🏗️ How Razorpay Authentication Works

### API Authentication (for cancel/refund/pause operations):
```
Request: POST https://api.razorpay.com/v1/subscriptions/{id}/cancel
Headers:
  Authorization: Basic base64(KEY_ID:KEY_SECRET)
                                  ↑        ↑
                    You have this ✅      Missing ❌
```

### Webhook Authentication (for events from Razorpay):
```
Razorpay sends: x-razorpay-signature: abc123...
You verify with: RAZORPAY_WEBHOOK_SECRET ✅ (You have this!)
```

**They are COMPLETELY DIFFERENT authentications!**

---

## 📋 Where to Find the Missing Secret

### In Razorpay Dashboard:

1. **Go to**: Razorpay Dashboard → Settings → API Keys
2. **You'll see**:
   ```
   Key ID: rzp_live_NhwNzRMwUdwYx1        ← You have this ✅
   Key Secret: [Show]                     ← Click "Show" to reveal ❌
                ↓
              This is what you're missing!
   ```

3. **Click "Show"** next to "Key Secret"
4. **Copy** the revealed secret (looks like: `abcdef123456...`)
5. **Add to .env.local**:
   ```bash
   RAZORPAY_KEY_SECRET=the_secret_you_just_copied
   ```

### Important Notes:
- Key ID and Key Secret are PAIRED (generated together)
- They're like username:password for Razorpay API
- Webhook Secret is SEPARATE (configured in webhook settings)

---

## 🚨 Impact Analysis

### ❌ What DOESN'T Work Without KEY_SECRET:

1. **Admin Panel**:
   - ❌ Cancel subscription → Error: "Razorpay credentials not configured"
   - ❌ Issue refund → Error: "Razorpay credentials not configured"
   - ❌ Pause subscription → Error: "Razorpay credentials not configured"

2. **User Dashboard**:
   - ❌ Self-service cancellation → API fails
   - ❌ Apply retention offers → API fails

3. **Subscription Creation**:
   - ❌ New subscriptions → Error: "Payment system not configured"

### ✅ What DOES Work (because you have WEBHOOK_SECRET):

1. **Webhook Processing**:
   - ✅ Receive payment success events
   - ✅ Receive subscription cancelled events
   - ✅ Verify webhook signatures

2. **Payment UI** (uses only KEY_ID):
   - ✅ Razorpay checkout modal opens
   - ✅ Users can enter payment details
   - ⚠️ But backend operations fail after payment

---

## ✅ CORRECT .env.local Structure

```bash
# Firebase Configuration (all correct)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDHQJ6le44lk_wtjGGMrO0n0HKjJpAMSmA
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aipply-17c23.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aipply-17c23
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aipply-17c23.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=846924227054
NEXT_PUBLIC_FIREBASE_APP_ID=1:846924227054:web:f594382cc5c8737b7b2eff
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-GL4K9Q4K01

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_NhwNzRMwUdwYx1
RAZORPAY_KEY_SECRET=get_this_from_razorpay_dashboard      # ← ADD THIS!
RAZORPAY_WEBHOOK_SECRET=a_uN7XaMRMBJ@fy                     # (remove duplicate)

# MongoDB
MONGO_URI=mongodb+srv://chauhankanishk990:kanishk123@aipply-main.prfha.mongodb.net/?retryWrites=true&w=majority&appName=aipply-main

# Encryption Key (NOT from env - hardcoded in code, separate issue)
ENCRYPTION_KEY=b2597c13754eb72c90ad4a093f65f7cf35746ef543785afa32b827011c066fa9

# Cron Secret
CRON_SECRET=9f3b2d8a-7c5e-4f1b-912a-e6f0d2c4a7b8

# Base URL
NEXT_PUBLIC_BASE_URL=http://34.131.159.198:8080
```

---

## 🎓 Summary

**Question**: "Are there 3 secrets or is there naming confusion?"

**Answer**: **THERE ARE 3 DISTINCT SECRETS** - No confusion, no redundancy!

1. **KEY_ID** (public, like rzp_live_xxx) - ✅ You have
2. **KEY_SECRET** (private, for API calls) - ❌ **You're missing this!**
3. **WEBHOOK_SECRET** (private, for webhook verification) - ✅ You have

**Analogy**:
- KEY_ID + KEY_SECRET = Your "login credentials" to Razorpay API
- WEBHOOK_SECRET = A "shared secret" to verify Razorpay's messages to you

**They serve COMPLETELY DIFFERENT purposes and cannot replace each other.**

---

## ✅ Next Steps

1. **Go to Razorpay Dashboard** → Settings → API Keys
2. **Click "Show"** next to "Key Secret"
3. **Copy the secret**
4. **Add to .env.local**:
   ```bash
   RAZORPAY_KEY_SECRET=paste_here
   ```
5. **Remove duplicate** `RAZORPAY_WEBHOOK_SECRET` (line 12)
6. **Test** subscription cancellation

---

**File Created**: 2025-10-14
**Purpose**: Clear up Razorpay secrets confusion
**Status**: Awaiting KEY_SECRET from Razorpay Dashboard
