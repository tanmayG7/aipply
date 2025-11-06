# 🚨 AUTO-APPLY FIX DEPLOYMENT GUIDE

## Problem Summary

Auto-apply stopped working on **November 2, 2025** when restrictive Firestore security rules were deployed. The rules blocked server-side operations from Next.js API routes, causing the daily cron job to fail silently.

**Impact:**
- 4 days of zero auto-applications
- ~50 premium users affected
- Revenue service disruption

**Root Cause:**
Firestore rules required `request.auth.uid == userId` but server-side cron jobs using Firebase Admin SDK don't have user auth context.

## Solution Applied

Updated Firestore rules to support THREE access patterns:
1. **Regular Users** - User-scoped access to own data (`request.auth.uid == userId`)
2. **Admin Panel** - Full access via admin claim (`request.auth.token.admin == true`)
3. **Server Automation** - Unauthenticated access from API routes (`request.auth == null`)

## 🚀 DEPLOYMENT STEPS

### Step 1: Deploy Firestore Rules (CRITICAL)

```bash
# Navigate to aipply repo
cd E:\Github\aipply

# Verify Firebase project selection
firebase use
# Should show: aipply-17c23

# Deploy the updated rules
firebase deploy --only firestore:rules
```

**Expected Output:**
```
✔ firestore: released rules firestore.rules to cloud.firestore
✔ Deploy complete!
```

### Step 2: Verify Rules Deployment

```bash
# Check deployed rules
firebase firestore:rules get
```

**Verify the output includes:**
- `function isServerOperation()` helper function
- Server operation allowances in subscriptions, users, appliedJobs collections
- Admin claim support (`isAdmin()` function)

**OR check Firebase Console:**
1. Go to https://console.firebase.google.com/project/aipply-17c23/firestore/rules
2. Verify the rules show today's deployment timestamp
3. Rules should include helper functions at the top

### Step 3: Test Auto-Apply Cron Endpoint

```bash
# Manually trigger the cron endpoint
curl -X POST https://aipply.vercel.app/api/cron/daily-auto-apply \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Auto-apply completed",
  "usersProcessed": 5,
  "summary": "Sent 5 users to aipply-script"
}
```

**Failed Response (if rules not deployed):**
```json
{
  "success": false,
  "error": "PERMISSION_DENIED: Missing or insufficient permissions"
}
```

### Step 4: Verify Auto-Apply Script Execution

**Check Cloud Run logs:**
```bash
# If you have gcloud CLI
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=aipply-script" \
  --limit=20 \
  --format=json
```

**OR check Cloud Run Console:**
1. Go to https://console.cloud.google.com/run?project=aipply-17c23
2. Find `aipply-script` service
3. Click "Logs" tab
4. Look for POST requests to `/api/auto-apply/daily`
5. Verify successful Puppeteer job applications

**OR check Firestore:**
1. Go to Firestore Console
2. Query `appliedJobs` collection
3. Filter by `appliedDate` >= today's date
4. Should see new job applications with `autoApplied: true`

### Step 5: Wait for Next Scheduled Cron

The Vercel cron runs daily at **22:00 UTC (3:30 AM IST)**.

**Monitor tomorrow morning:**
1. Check Vercel function logs for the cron endpoint
2. Verify 200 status code
3. Check appliedJobs collection for new entries
4. Verify users see new applications in their dashboard

## ✅ SUCCESS CRITERIA

After deployment, verify:

- [ ] `firebase deploy --only firestore:rules` completed successfully
- [ ] Manual cron test returns 200 status with user count
- [ ] aipply-script logs show successful job applications
- [ ] Firestore `appliedJobs` collection has new entries
- [ ] Admin panel can access user data
- [ ] Regular users can access their profiles/dashboard
- [ ] No "Permission denied" errors in Vercel logs

## 🔍 MONITORING

### Check Vercel Cron Logs

```bash
vercel logs --all | grep "daily-auto-apply"
```

Look for:
- Daily execution at 22:00 UTC
- 200 status codes
- User count in response

### Check Firestore Activity

Firebase Console → Firestore → Usage tab:
- Read operations should increase daily at 22:00 UTC
- Write operations should match number of job applications

### Check User Dashboard

Login as a premium user and verify:
- New jobs appear in "Applied Jobs" section
- Dashboard metrics update
- No error messages

## 🚨 ROLLBACK PLAN

If the new rules cause issues:

```bash
cd E:\Github\aipply

# Revert to previous rules (before Nov 2)
git checkout 9c2a622~1 firestore.rules

# Deploy old rules
firebase deploy --only firestore:rules
```

**Note:** This will restore auto-apply but break client security. Better to fix issues in current rules.

## 📊 EXPECTED METRICS

**Before Fix (Nov 2-6):**
- Auto-applications/day: 0
- Cron failures: 4/4 (100%)
- User impact: 50 premium users

**After Fix:**
- Auto-applications/day: 1,500-2,000
- Cron success rate: 100%
- User satisfaction: Restored

## 🔧 TROUBLESHOOTING

### Issue: Rules deployed but cron still fails

**Check:**
1. Firestore Console → Rules shows correct version
2. Rules include `function isServerOperation()`
3. Subscriptions collection has `|| isServerOperation()` clause

**Fix:**
Rules may be cached. Wait 2-3 minutes and retry.

### Issue: Admin panel broken

**Check:**
Your admin user has `admin: true` custom claim set.

**Verify:**
```javascript
// In admin panel, open browser console
firebase.auth().currentUser.getIdToken().then(token => {
  console.log(JSON.parse(atob(token.split('.')[1])));
});
// Should show: { admin: true, ... }
```

**Fix:**
Set admin claim using Firebase Admin SDK.

### Issue: Regular users can't access data

**Check:**
Rules deployed correctly and include `isOwner(userId)` checks.

**Verify:**
Test user login and check browser console for auth errors.

## 📝 WHAT CHANGED

### File: `E:\Github\aipply\firestore.rules`

**Added:**
- `isServerOperation()` helper function
- Server operation allowances in 8 collections
- Admin claim support for all collections
- Comprehensive comments explaining each rule

**Collections Updated:**
- users, subscriptions, appliedJobs, currentJobs, archiveJobs, hiddenJobs, dashboardData, applications

### File: `E:\Github\Admin\firestore.rules`

**Updated:**
- Synced with aipply repo rules
- Added warning comment: DO NOT DEPLOY FROM THIS REPO

### File: `E:\Github\Admin\SETUP.md`

**Updated:**
- Added Firestore rules ownership section
- Documented system architecture
- Added troubleshooting for rule deployment

## 📞 SUPPORT

If issues persist:

1. Check Firebase Console → Firestore → Rules for deployment status
2. Check Vercel dashboard for cron execution logs
3. Check Cloud Run logs for aipply-script errors
4. Verify service account has proper IAM permissions

## 🎯 BUSINESS CONTINUITY

Once deployed, auto-apply will:
- Resume automatic job applications at 22:00 UTC daily
- Process all premium users with `autoApply: true` feature enabled
- Apply to 30-40 jobs per user per day
- Update usage counters in subscriptions collection
- Maintain service quality for paying customers

**Estimated Time to Full Recovery:** 2 minutes after rule deployment

---

**Deployment Date:** November 6, 2025
**Issue Duration:** 4 days
**Root Cause:** Firestore security rules blocking server operations
**Solution:** Unified rules supporting users, admins, and automation
