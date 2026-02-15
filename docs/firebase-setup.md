# Firebase Setup Guide

## Firebase Client SDK

### Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Getting Config Values

1. Go to https://console.firebase.google.com
2. Select the project (or create one)
3. Settings (gear icon) > Project Settings
4. Scroll to "Your apps" section
5. If no web app exists, click "Add app" > Web
6. Copy the config values

### Enable Auth Methods

In Firebase Console > Authentication > Sign-in method:
- Enable "Email/Password"
- Enable "Google" (requires OAuth consent screen)

### Firestore Database

1. Go to Firestore Database in the console
2. Create database in production mode
3. Deploy security rules (see below)

---

## Firebase Admin SDK (Server-Side)

The Admin SDK is used by API routes for server-side Firestore operations (order creation, subscription management, etc.).

### Service Account Key

1. Go to [Firebase Console > Service Accounts](https://console.firebase.google.com/project/aipply-17c23/settings/serviceaccounts/adminsdk)
2. Click "Generate new private key"
3. Download the JSON file
4. Never commit this file to git

### Environment Variables for Admin SDK

Add to `.env.local` for local development:

```bash
ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@aipply-17c23.iam.gserviceaccount.com
ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQI...\n-----END PRIVATE KEY-----\n"
```

Notes:
- Use `ADMIN_` prefix (not `FIREBASE_ADMIN_`) to avoid Firebase's reserved prefixes
- Keep quotes around `ADMIN_PRIVATE_KEY`
- Preserve the `\n` characters (literal backslash-n, not actual newlines)

### Production Deployment

Set secrets before deploying:

```bash
firebase functions:secrets:set ADMIN_CLIENT_EMAIL
firebase functions:secrets:set ADMIN_PRIVATE_KEY
```

Important: Set secrets BEFORE first deployment. Setting them after causes timeout errors because Firebase tries to initialize the Admin SDK during deployment.

### Verification

```bash
firebase functions:secrets:access ADMIN_CLIENT_EMAIL
firebase functions:secrets:access ADMIN_PRIVATE_KEY
```

---

## Troubleshooting

### "16 UNAUTHENTICATED" error
Admin SDK credentials not configured in production. Set the secrets and redeploy.

### "Could not load the default credentials"
Environment variables not set or not loaded. Verify secrets, then redeploy.

### "Error parsing private key"
Private key format incorrect. Must be all on one line with literal `\n` characters:
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQI...\n-----END PRIVATE KEY-----\n"
```

### "User code failed to load. Timeout after 10000"
Firebase deployment timing out because Admin SDK credentials aren't set. Set secrets first, then deploy.

---

## Security

- Never commit service account JSON files to git
- Never commit `.env.local` to git
- Never expose credentials in client-side code
- Rotate service account keys every 90 days
- Use different service accounts for staging vs production

## Files

| File | Purpose |
|------|---------|
| `lib/firebaseConfig/firebaseConfig.ts` | Client SDK initialization + CRUD operations |
| `lib/firebaseAdmin.ts` | Admin SDK initialization |
| `.env.local` | Local credentials (gitignored) |
