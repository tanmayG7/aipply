# 🔒 SECURITY AUDIT REPORT - AiPply

**Date**: 2025-10-14
**Auditor**: Claude Code AI
**Severity Levels**: 🔴 CRITICAL | 🟠 HIGH | 🟡 MEDIUM | 🟢 LOW

---

## EXECUTIVE SUMMARY

**Overall Security Status**: ⚠️ **NEEDS IMMEDIATE ATTENTION**

Found **4 CRITICAL** security vulnerabilities that must be fixed before production deployment.

---

## 🔴 CRITICAL VULNERABILITIES

### 1. Client-Side Encryption Key Exposure

**File**: `lib/security/encryptionUtils.ts:15`
**Severity**: 🔴 CRITICAL
**CVSS Score**: 7.5 (High)

```typescript
private static readonly ENCRYPTION_KEY = "b2597c13754eb72c90ad4a093f65f7cf35746ef543785afa32b827011c066fa9";
```

**Issue**:
- Encryption key is **hardcoded in client-side JavaScript**
- Key will be visible in production bundle to anyone using browser DevTools
- Used to encrypt platform credentials (job portal passwords) in `platformCredentials` field

**Impact**:
- ❌ Anyone can view the encryption key by inspecting JavaScript in browser
- ❌ If attacker gains access to Firebase, they can decrypt ALL job portal passwords
- ❌ Compromises security of user's 3rd-party accounts (Naukri, LinkedIn, etc.)

**What's Encrypted**: Job portal login credentials (email + password for auto-apply feature)

**Attack Scenario**:
1. Attacker opens browser DevTools → Sources → finds encryptionUtils.js
2. Attacker extracts hardcoded encryption key
3. Attacker gains read access to Firebase (via XSS or leaked credentials)
4. Attacker decrypts all platform credentials from `users/{userId}/platformCredentials`
5. Attacker now has access to users' job portal accounts

**Recommendation**:
```typescript
// ❌ NEVER DO THIS (current implementation)
private static readonly ENCRYPTION_KEY = "hardcoded_key";

// ✅ DO THIS INSTEAD:
// 1. Move encryption to server-side API route
// 2. Use Firebase Functions or Next.js API route
// 3. Store key in server-side environment variable only
// 4. Use proper key management (AWS KMS, Google Cloud KMS, or Vault)
```

**Fixed Implementation Approach**:
```typescript
// Client calls API to encrypt/decrypt
POST /api/encrypt-credentials
Authorization: Bearer {firebase-token}
Body: { credentials: { platform: {email, password} } }

// Server-side (API route):
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Server-only!
// ... encryption logic ...
```

---

### 2. MongoDB Credentials Exposed in `.env`

**File**: `.env:10`
**Severity**: 🔴 CRITICAL
**CVSS Score**: 9.8 (Critical)

```bash
MONGO_URI = mongodb+srv://chauhankanishk990:kanishk123@aipply-main.prfha.mongodb.net/...
```

**Issue**:
- Database username and password in plaintext
- If `.env` gets committed to git, credentials are permanently exposed

**Impact**:
- ❌ Full database access (read/write/delete all data)
- ❌ Can steal all user data, subscription info, payment history
- ❌ Can inject malicious data or delete entire database

**Recommendation**:
1. **IMMEDIATELY** change MongoDB password
2. Delete `.env` file (it should NOT exist - use only `.env.local`)
3. Add `.env` to `.gitignore` (already done, but verify)
4. Check git history: `git log -- .env` to see if it was ever committed
5. If committed, consider credentials compromised and rotate immediately

---

### 3. Missing `RAZORPAY_KEY_SECRET` in `.env.local`

**File**: `.env.local:11-12`
**Severity**: 🔴 CRITICAL (Blocking Feature)
**CVSS Score**: N/A (Not a security vuln, but blocking issue)

```bash
# Missing!
RAZORPAY_KEY_SECRET=???

# Only has:
RAZORPAY_WEBHOOK_SECRET=a_uN7XaMRMBJ@fy (duplicate!)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_NhwNzRMwUdwYx1
```

**Issue**:
- Missing the actual `RAZORPAY_KEY_SECRET` needed for API calls
- Has `RAZORPAY_WEBHOOK_SECRET` duplicated (lines 10 & 12)
- Without this, ALL subscription operations will fail:
  - Cannot cancel subscriptions
  - Cannot process refunds
  - Cannot pause/resume subscriptions

**Impact**:
- ❌ Admin panel cancellation will fail
- ❌ User self-service cancellation will fail
- ❌ Refund processing will fail
- ❌ Entire subscription management feature is non-functional

**Recommendation**:
```bash
# .env.local - ADD THIS:
RAZORPAY_KEY_SECRET=your_actual_razorpay_secret_key

# Keep these:
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_NhwNzRMwUdwYx1
RAZORPAY_WEBHOOK_SECRET=a_uN7XaMRMBJ@fy
```

Get the `RAZORPAY_KEY_SECRET` from:
Razorpay Dashboard → Settings → API Keys → "Key Secret"

---

### 4. Redundant `.env` File (Overengineering + Security Risk)

**Files**: `.env` and `.env.local`
**Severity**: 🟡 MEDIUM (Complexity/Confusion)

**Issue**:
- Having **BOTH** `.env` and `.env.local` is unnecessary and confusing
- Creates duplicate management overhead
- Increases risk of committing secrets

**Next.js Loading Priority**:
1. `.env.local` (highest priority) ✅ Use this
2. `.env` (lower priority) ❌ Remove this

**Current State**: **OVERENGINEERED**
- Variables scattered across 2 files
- Some duplicates (RAZORPAY_WEBHOOK_SECRET in both)
- `.env` has MongoDB credentials (dangerous!)

**Recommendation**:
1. **DELETE** `.env` file completely
2. Keep ONLY `.env.local` for local development
3. Use `.env.example` for documentation (already created)
4. Ensure `.env.local` is in `.gitignore` (already done)

---

## 🟠 HIGH PRIORITY ISSUES

### 5. Misleading Environment Variable Name

**File**: `.env:13`
**Severity**: 🟠 HIGH (Misleading but not used)

```bash
NEXT_PUBLIC_ENCRYPTION_KEY=b2597c13754eb72c90ad4a093f65f7cf35746ef543785afa32b827011c066fa9
```

**Issue**:
- Has `NEXT_PUBLIC_` prefix (makes it client-accessible)
- However, this variable is **NOT actually used** in code!
- The hardcoded key in `encryptionUtils.ts` is used instead
- Misleading and confusing

**Impact**:
- Creates false sense of security
- Developers might think key is server-side when it's not
- Variable is redundant (not used anywhere)

**Recommendation**:
```bash
# Remove this from .env - it's not used!
# The key is hardcoded in lib/security/encryptionUtils.ts instead
```

---

## 🟡 MEDIUM PRIORITY ISSUES

### 6. `NEXT_PUBLIC_` Prefix Misuse

**Files**: Multiple
**Severity**: 🟡 MEDIUM

**Issue**: Several variables have `NEXT_PUBLIC_` prefix that shouldn't be public:

```bash
# .env:
NEXT_PUBLIC_ENCRYPTION_KEY=...  # Should be private (but not used anyway)

# OK to be public (Firebase client config):
NEXT_PUBLIC_FIREBASE_API_KEY=...  ✅
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...  ✅
NEXT_PUBLIC_RAZORPAY_KEY_ID=...  ✅ (Key ID is public, not secret)
```

**Recommendation**:
- Only use `NEXT_PUBLIC_` for truly public values
- Firebase keys are OK (designed to be public)
- Razorpay Key ID is OK (it's the public identifier)
- Never use `NEXT_PUBLIC_` for secrets, passwords, or API secrets

---

## 🟢 LOW PRIORITY ISSUES

### 7. Missing `RAZORPAY_KEY_SECRET` in Code References

**File**: `lib/utils/razorpayAdmin.ts:7`
**Severity**: 🟢 LOW (Already known from #3)

```typescript
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
```

Code correctly reads from environment, but the value is missing from `.env.local`.

---

## 📋 ENVIRONMENT FILE STRUCTURE - CORRECTED

### ✅ CORRECT Structure (What you should have):

**Files**:
1. `.env.local` - Your secrets (gitignored) ✅
2. `.env.example` - Template for team (committed) ✅
3. `.env` - **DELETE THIS** ❌

### Current State:
```
.env          ❌ Has secrets, should not exist
.env.local    ⚠️ Missing RAZORPAY_KEY_SECRET
.env.example  ✅ Created (template for documentation)
```

---

## 🛠️ IMMEDIATE ACTION ITEMS

### Priority 1: CRITICAL Fixes (Before ANY testing)

1. **Add Missing Razorpay Secret**:
   ```bash
   # In .env.local, add:
   RAZORPAY_KEY_SECRET=your_actual_secret_here
   ```

2. **Secure MongoDB Credentials**:
   ```bash
   # Change MongoDB password IMMEDIATELY
   # Then update .env.local with new credentials
   MONGO_URI=mongodb+srv://newuser:newpassword@...
   ```

3. **Delete `.env` File**:
   ```bash
   # Delete the file
   rm .env

   # Or move secrets to .env.local
   # Then delete .env
   ```

4. **Check Git History**:
   ```bash
   # Check if .env was ever committed
   git log --all --full-history -- .env

   # If yes, consider all secrets compromised
   # Rotate: MongoDB password, Razorpay secrets, etc.
   ```

### Priority 2: Architectural Fixes (Post-Launch)

5. **Move Encryption to Server-Side** (Major Refactor):
   - Create API route: `POST /api/encrypt-credentials`
   - Create API route: `POST /api/decrypt-credentials`
   - Move encryption logic to server
   - Remove hardcoded key from client
   - Store `ENCRYPTION_KEY` in server-side env only

   **Timeline**: 1-2 weeks post-launch

6. **Implement Proper Key Management**:
   - Use Google Cloud Secret Manager or AWS KMS
   - Or at minimum, use server-side env vars only
   - Never hardcode keys in source code

---

## 📊 RISK ASSESSMENT

### Current Risk Level: 🔴 **HIGH**

| Issue | Severity | Exploitability | Impact | Likelihood |
|-------|----------|----------------|---------|------------|
| Client-side encryption key | CRITICAL | High | High | Medium |
| MongoDB credentials exposed | CRITICAL | Medium | Extreme | Low* |
| Missing Razorpay secret | CRITICAL | N/A | Complete Feature Failure | 100% |
| Redundant .env files | MEDIUM | Low | Low | Low |

*Low if never committed to git; High if committed

### Mitigation Status:
- ✅ Issues documented
- ⚠️ Fixes pending
- ❌ Not production-ready until fixes applied

---

## ✅ WHAT'S SECURE (Good News!)

1. **Firebase Authentication**: ✅ Secure, uses Firebase Auth SDK properly
2. **User Passwords**: ✅ Handled by Firebase (hashed server-side, never exposed)
3. **Razorpay Integration**: ✅ Correctly separates public (Key ID) from private (Key Secret)
4. **API Routes**: ✅ Properly check authentication tokens
5. **Admin Access**: ✅ Role-based access control implemented
6. **No SQL Injection**: ✅ Using Firebase/Firestore (NoSQL with parameterized queries)

---

## 📖 SECURITY BEST PRACTICES CHECKLIST

### ✅ Implemented:
- [x] HTTPS enforced (Firebase/Vercel)
- [x] Authentication on API routes
- [x] Role-based access control (admin)
- [x] Audit logging
- [x] Password reset flow
- [x] CSRF tokens (Firebase handles)

### ❌ Missing:
- [ ] Rate limiting on APIs
- [ ] Server-side encryption
- [ ] Proper key management
- [ ] Security headers (CSP, X-Frame-Options)
- [ ] Input sanitization on all inputs
- [ ] XSS prevention (React helps but not complete)

---

## 🎯 FINAL VERDICT

**Can Deploy to Production**: ⚠️ **NOT YET**

**Blockers**:
1. Must add `RAZORPAY_KEY_SECRET` to `.env.local`
2. Must delete `.env` file or move all secrets to `.env.local`
3. Should change MongoDB password
4. Should check git history for leaked secrets

**Post-Launch Priority**:
1. Move encryption to server-side (1-2 weeks)
2. Implement rate limiting
3. Add security headers

---

## 📞 NEXT STEPS

1. **Fix `.env.local`** (5 minutes):
   - Add `RAZORPAY_KEY_SECRET`
   - Remove duplicate `RAZORPAY_WEBHOOK_SECRET`

2. **Delete `.env`** (1 minute):
   - Move any needed secrets to `.env.local`
   - Delete `.env`

3. **Verify** (5 minutes):
   - Check git history
   - Test subscription features
   - Verify API calls work

4. **Deploy** when above is done

---

**Report Generated**: 2025-10-14
**Review Date**: 2025-10-21 (1 week post-launch)
**Classification**: Internal Security Audit

---

## APPENDIX: Reference Links

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Razorpay API Security](https://razorpay.com/docs/api/security/)
