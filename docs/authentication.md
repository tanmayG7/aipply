# Authentication System Guide

## Overview

AiPply uses a unified authentication system that lets users switch between email/password and Google OAuth while maintaining a single profile. Firebase Auth handles account linking.

## Authentication Methods

### Email/Password
- Standard registration and login
- Password recovery via email

### Google OAuth
- One-click sign-in via popup
- Can be linked to existing email/password accounts

### Account Linking
Users can add a second auth method to their account:

- **Email user adds Google**: Via `linkGoogleToAccount()` in account settings
- **Google user adds password**: Via `setupPasswordForGoogleAccount(password)` during login or in settings

## Key Functions

All authentication functions live in `lib/firebaseConfig/firebaseConfig.ts`:

| Function | Purpose |
|----------|---------|
| `authenticateUser()` | Unified authentication handler |
| `checkEmailSignInMethods(email)` | Detects available auth methods for an email |
| `linkEmailPasswordToAccount(email, password)` | Links password auth to Google account |
| `linkGoogleToAccount()` | Links Google auth to email account |
| `setupPasswordForGoogleAccount(password)` | Adds password to Google-only account |
| `handleSignInError()` | Routes users based on error type |

### Email Detection Response

```typescript
{
  hasPassword: boolean,    // Email has password auth
  hasGoogle: boolean,      // Email has Google auth
  methods: string[],       // All available methods
  exists: boolean          // Email exists in system
}
```

## Components

| Component | Location | Purpose |
|-----------|----------|---------|
| Login Form | `components/login-form.tsx` | Smart login with real-time email detection |
| AuthMethodsManager | `components/account/AuthMethodsManager.tsx` | Add/view auth methods |
| Login Page | `app/dashboard/onboarding/login/page.tsx` | Login page wrapper |

## Login Flow

1. User enters email
2. `checkEmailSignInMethods()` detects available methods
3. UI shows appropriate options (password field, Google button, or both)
4. User authenticates with chosen method
5. On success: redirect to dashboard
6. On error: `handleSignInError()` guides user (e.g., offers password setup for Google-only accounts)

## Environment Variables

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
```

## Security

- Firebase Auth handles all credential storage and session management
- Account linking requires re-authentication
- OAuth 2.0 for Google sign-in
- Token-based session management
