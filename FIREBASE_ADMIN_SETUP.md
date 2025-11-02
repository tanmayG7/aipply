# Firebase Admin SDK Setup Guide

This guide explains how to configure Firebase Admin SDK credentials for the CV Services payment feature.

## Why is this needed?

The CV Services payment system requires Firebase Admin SDK to:
- Create orders in Firestore from server-side API routes
- Update order status after payment verification
- Bypass Firestore security rules for trusted server operations

## Current Error

If you see this error in production:
```
16 UNAUTHENTICATED: Request had invalid authentication credentials.
Expected OAuth 2 access token, login cookie or other valid authentication credential.
```

It means Firebase Admin SDK credentials are **not configured** in your production environment.

---

## Quick Setup (5 Minutes)

⚠️ **IMPORTANT**: You MUST complete ALL steps below BEFORE running `firebase deploy`. Setting secrets after deployment will cause timeout errors.

### Step 1: Download Service Account Key

1. Go to [Firebase Console - Service Accounts](https://console.firebase.google.com/project/aipply-17c23/settings/serviceaccounts/adminsdk)
2. Click **"Generate new private key"** button
3. Click **"Generate key"** in the confirmation dialog
4. A JSON file will download (e.g., `aipply-17c23-firebase-adminsdk-xxxxx.json`)

⚠️ **IMPORTANT**: Keep this file secure! Never commit it to git or share it publicly.

### Step 2: Extract Credentials

Open the downloaded JSON file in a text editor. You need TWO values:

```json
{
  "type": "service_account",
  "project_id": "aipply-17c23",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQI...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@aipply-17c23.iam.gserviceaccount.com",
  ...
}
```

**Extract:**
- `client_email` → Copy the email address
- `private_key` → Copy the ENTIRE key including `\n` characters

### Step 3: Set Production Secrets

**For Windows (PowerShell or Command Prompt):**

```bash
# Set client email
firebase functions:secrets:set ADMIN_CLIENT_EMAIL
# Paste when prompted: firebase-adminsdk-xxxxx@aipply-17c23.iam.gserviceaccount.com

# Set private key
firebase functions:secrets:set ADMIN_PRIVATE_KEY
# Paste when prompted: -----BEGIN PRIVATE KEY-----\nMIIEvQI...\n-----END PRIVATE KEY-----\n
```

**IMPORTANT:**
- Use `firebase functions:secrets:set` (NOT `config:set`)
- Variable names use `ADMIN_` prefix (NOT `FIREBASE_ADMIN_`) to avoid Firebase's reserved prefixes
- Run each command separately
- Paste the value when prompted (don't include it in the command line)
- Preserve the `\n` characters in the private key

**Alternative: Using Firebase Console**

1. Go to [Firebase Console](https://console.firebase.google.com/project/aipply-17c23/functions)
2. Click the **"Secrets"** tab
3. Click **"Create Secret"**
4. Add two secrets:
   - Name: `ADMIN_CLIENT_EMAIL`
     Value: (paste the client_email from JSON)

   - Name: `ADMIN_PRIVATE_KEY`
     Value: (paste the private_key from JSON, including \n)

### Step 4: Verify Secrets

```bash
# Check if secrets are set
firebase functions:secrets:access ADMIN_CLIENT_EMAIL
firebase functions:secrets:access ADMIN_PRIVATE_KEY
```

You should see the values you set (private key will be partially masked).

### Step 5: Deploy

```bash
npm run build
firebase deploy
```

Wait for deployment to complete (2-5 minutes).

### Step 6: Test

1. Go to https://www.aipply.io/cv-services
2. Fill in the payment form
3. Click "Pay ₹987"
4. You should see:
   - ✅ No console errors
   - ✅ Razorpay payment modal opens
   - ✅ Order is created successfully

---

## Local Development Setup

For local testing, add credentials to `.env.local`:

```bash
# Firebase Admin SDK (Local Development)
# Note: Using ADMIN_ prefix to avoid Firebase's reserved FIREBASE_ prefix
ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@aipply-17c23.iam.gserviceaccount.com
ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQI...\n-----END PRIVATE KEY-----\n"
```

**Notes:**
- Keep the quotes around `ADMIN_PRIVATE_KEY`
- Preserve the `\n` characters
- Never commit `.env.local` to git (already in `.gitignore`)

Then restart your dev server:
```bash
npm run dev
```

---

## Troubleshooting

### Error: "User code failed to load. Cannot determine backend specification. Timeout after 10000"

**Cause**: Firebase deployment is timing out during build phase because Admin SDK credentials are not set.

**Solution**:
1. **You MUST set secrets BEFORE first deployment**:
   ```bash
   firebase functions:secrets:set ADMIN_CLIENT_EMAIL
   firebase functions:secrets:set ADMIN_PRIVATE_KEY
   ```

2. Verify secrets are set:
   ```bash
   firebase functions:secrets:access ADMIN_CLIENT_EMAIL
   firebase functions:secrets:access ADMIN_PRIVATE_KEY
   ```

3. Now deploy:
   ```bash
   firebase deploy
   ```

**Why this happens**: Firebase analyzes your code during deployment and may attempt to initialize the Admin SDK. Without credentials, it times out waiting for Application Default Credentials.

**Prevention**: Always set secrets before deploying, not after.

### Error: "Could not load the default credentials"

**Cause**: Environment variables not set or not loaded.

**Solution**:
1. Verify secrets are set: `firebase functions:secrets:access ADMIN_CLIENT_EMAIL`
2. Redeploy: `firebase deploy`
3. Check Firebase Console logs for initialization messages

### Error: "16 UNAUTHENTICATED"

**Cause**: Credentials are set but invalid or malformed.

**Solution**:
1. Verify you copied the ENTIRE private key including start/end markers
2. Ensure `\n` characters are preserved (literal \n, not actual newlines)
3. Delete and recreate the secrets with correct values
4. Redeploy

### Error: "Error parsing private key"

**Cause**: Private key format is incorrect.

**Solution**:
The private key must be in this exact format:
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----\n"
```

Common mistakes:
- ❌ Actual newlines instead of `\n`
- ❌ Missing quotes
- ❌ Truncated key (must be complete)

Correct format:
- ✅ All on one line
- ✅ Quotes around the entire key
- ✅ Literal `\n` characters (backslash-n)

### Secrets don't seem to be applied

**Cause**: Secrets are set but not deployed.

**Solution**:
```bash
# Secrets must be deployed to take effect
firebase deploy --only hosting
```

### How to check server logs

```bash
# View live logs
firebase functions:log

# Or check in Firebase Console
# Functions → Logs
```

Look for these messages:
- ✅ `"Firebase Admin initialized with service account credentials"`
- ❌ `"WARNING: Firebase Admin credentials not fully configured!"`

---

## Security Best Practices

1. ✅ **Never commit** service account JSON files to git
2. ✅ **Never commit** `.env.local` to git (already in `.gitignore`)
3. ✅ **Never expose** credentials in client-side code
4. ✅ **Rotate credentials** every 90 days (generate new key, update secrets)
5. ✅ **Use different service accounts** for staging vs production
6. ✅ **Delete old service account keys** after rotation

---

## How It Works

### Before (Not Working)

```
User → Frontend → API Route → Firebase Admin (No Credentials) → ❌ UNAUTHENTICATED
```

### After (Working)

```
User → Frontend → API Route → Firebase Admin (With Credentials) → ✅ Firestore
```

The Firebase Admin SDK needs credentials to:
1. Authenticate with Google Cloud Platform
2. Access Firestore with elevated privileges
3. Bypass Firestore security rules (server-side operations)

---

## Files Modified

This setup required changes to:
- `lib/firebaseAdmin.ts` - Admin SDK initialization with better error handling
- `app/api/cv-services/create-order/route.ts` - Uses Admin SDK
- `app/api/cv-services/verify-payment/route.ts` - Uses Admin SDK
- `.env.example` - Documentation for credentials
- `firestore.rules` - Security rules (for client-side operations)

---

## What's Next?

After setting up Firebase Admin credentials, you may also need to configure:

1. **Razorpay Secrets** (for payment processing):
   ```bash
   firebase functions:secrets:set RAZORPAY_KEY_SECRET
   ```

2. **Resend API Key** (for email notifications):
   ```bash
   firebase functions:secrets:set RESEND_API_KEY
   ```

See `.env.example` for all required environment variables.

---

## Support & Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firebase Functions Secrets](https://firebase.google.com/docs/functions/config-env#secret-manager)
- [Service Account Keys](https://cloud.google.com/iam/docs/keys-create-delete)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

If you continue to experience issues:
1. Check server logs: `firebase functions:log`
2. Verify all secrets are set: `firebase functions:secrets:access <SECRET_NAME>`
3. Ensure Firebase billing is enabled (required for Secret Manager)
4. Review error messages in production console
