# Auto-Apply Fix History

## November 2025: Firestore Rules Blocking Server Operations

### Problem
Auto-apply stopped working on November 2, 2025 when restrictive Firestore security rules were deployed. The rules blocked server-side operations from Next.js API routes, causing the daily cron job to fail silently.

- 4 days of zero auto-applications
- ~50 premium users affected
- Root cause: Firestore rules required `request.auth.uid == userId` but server-side cron jobs using Firebase Admin SDK don't have user auth context

### Solution
Updated Firestore rules to support three access patterns:
1. **Regular users**: User-scoped access (`request.auth.uid == userId`)
2. **Admin panel**: Full access via admin claim (`request.auth.token.admin == true`)
3. **Server automation**: Unauthenticated access from API routes (`request.auth == null`)

### Deployment

```bash
cd /path/to/aipply
firebase use             # Should show: aipply-17c23
firebase deploy --only firestore:rules
```

### Verification
```bash
# Manual cron test
curl -X POST https://aipply.vercel.app/api/cron/daily-auto-apply \
  -H "Content-Type: application/json" -d '{}'
```

Expected response:
```json
{
  "success": true,
  "usersProcessed": 5,
  "summary": "Sent 5 users to aipply-script"
}
```

### Collections Updated
users, subscriptions, appliedJobs, currentJobs, archiveJobs, hiddenJobs, dashboardData, applications

### Rollback
```bash
git checkout 9c2a622~1 firestore.rules
firebase deploy --only firestore:rules
```
Note: Rollback restores auto-apply but breaks client security. Better to fix issues in current rules.
