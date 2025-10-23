# Debugging Guidelines for AiPply

This document outlines best practices for debugging in the AiPply codebase to prevent debug code from reaching production.

## ⚠️ The Problem

**Debug statements accidentally deployed to production are a critical issue** that can:
- Expose sensitive user information (emails, authentication status)
- Make the application appear unprofessional
- Leak internal implementation details
- Confuse and concern users

## ✅ Approved Debugging Methods

### 1. Use the DebugPanel Component (Recommended)

For visual debugging in development, use the `DebugPanel` component which automatically hides in production:

```tsx
import { DebugPanel } from '@/components/dev/DebugPanel';

function MyComponent() {
  const { authLoading, isGoogleUser, email } = useAuth();

  return (
    <div>
      {/* Your component UI */}

      {/* This will ONLY show in development */}
      <DebugPanel
        data={{
          authLoading,
          isGoogleUser,
          email
        }}
        title="Auth State"
        position="bottom-right"
      />
    </div>
  );
}
```

**Benefits:**
- Automatically hidden in production (checks `NODE_ENV`)
- Clearly marked as development-only
- Professional styling
- Easy to spot and remove

### 2. Use the useDebugLog Hook

For console logging that only appears in development:

```tsx
import { useDebugLog } from '@/components/dev/DebugPanel';

function MyComponent() {
  const debugLog = useDebugLog('MyComponent');

  useEffect(() => {
    debugLog('Component mounted', { user: currentUser });
  }, []);

  const handleClick = () => {
    debugLog('Button clicked');
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

**Benefits:**
- Only logs in development
- Consistent formatting with context
- Easy to search and filter

### 3. Use Browser DevTools

For runtime debugging:
- **React DevTools** - Inspect component state and props
- **Network Tab** - Monitor API calls
- **Console** - Use `console.log()` temporarily (but remove before committing!)
- **Breakpoints** - Set in Sources tab for step-through debugging

## ❌ What NOT to Do

### Never Include Debug Text in JSX

```tsx
// ❌ WRONG - This will appear to users!
<div>
  <p>Debug: authLoading={authLoading.toString()}</p>
  <p>Debug: isGoogleUser={isGoogleUser.toString()}</p>
  <p>Debug: email={formData.email}</p>
</div>
```

### Never Use Production Console Logs

```tsx
// ❌ WRONG - These pollute production console
console.log('🔍 User authenticated:', user);
console.log('Debug info:', { state });
```

### Never Leave Debug Comments

```tsx
// ❌ WRONG
{/* Debug info - remove in production */}
<div className="debug-panel">...</div>
```

If you write "remove in production", you're doing it wrong. Use environment checks instead!

## 🛡️ Safeguards in Place

We've implemented multiple layers of protection:

### 1. ESLint Rules
- Automatically detects debug text in JSX
- Fails the build if debug patterns are found
- Run with: `npm run lint`

### 2. Pre-commit Hook
- Scans staged files before commit
- Prevents debug code from being committed
- Run manually: `npm run check:debug`

### 3. CI/CD Checks
- GitHub Actions workflow on all PRs
- Blocks merging if debug code detected
- Automatically comments on PRs with issues

### 4. Environment Checks
- All debug components check `NODE_ENV`
- Production builds strip out development code
- Next.js tree-shaking removes unused code

## 📋 Pre-Commit Checklist

Before committing code, verify:

- [ ] No "Debug:" text in JSX
- [ ] No `console.log` with debug emojis (🔍)
- [ ] All debug code uses `DebugPanel` or `useDebugLog`
- [ ] Run `npm run check:debug` - passes
- [ ] Run `npm run lint` - passes
- [ ] Visual inspection - no visible debug text

## 🚀 Proper Production Logging

For production monitoring and error tracking:

### Use Proper Logging Services

```tsx
// ✅ CORRECT - Production logging
import { logError, logEvent } from '@/lib/logging';

try {
  await saveUserProfile(data);
  logEvent('profile_saved', { userId: user.id });
} catch (error) {
  logError('Failed to save profile', error, {
    userId: user.id,
    context: 'onboarding'
  });
}
```

### Use Error Boundaries

```tsx
// ✅ CORRECT - Graceful error handling
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

## 📝 Quick Reference

| Scenario | Solution |
|----------|----------|
| Visual debugging in development | Use `<DebugPanel>` component |
| Console logging in development | Use `useDebugLog()` hook |
| Production error tracking | Use proper logging service |
| User-facing errors | Use error boundaries + user-friendly messages |
| Performance debugging | Use React DevTools Profiler |
| Network debugging | Use Browser Network tab |

## 🆘 If You Accidentally Commit Debug Code

1. **Don't panic!** It happens
2. Create a new commit removing it immediately
3. If already in production, deploy the fix ASAP
4. Document the incident for team learning

## 📚 Additional Resources

- [React DevTools Documentation](https://react.dev/learn/react-developer-tools)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Chrome DevTools Guide](https://developer.chrome.com/docs/devtools/)

---

**Remember:** If you're writing "TODO: remove before production", you're doing it wrong. Use the proper development-only tools instead!
