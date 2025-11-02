#!/usr/bin/env node
/**
 * Comprehensive ESLint Auto-Fixer
 * Fixes common patterns automatically
 */

const fs = require('fs');
const path = require('path');

// JSX Quote Patterns to Fix
const jsxQuoteFixes = [
  // Contractions with apostrophes
  { pattern: /(>[^<]*?)don't([^<]*?<)/gi, replacement: "$1don&apos;t$2" },
  { pattern: /(>[^<]*?)can't([^<]*?<)/gi, replacement: "$1can&apos;t$2" },
  { pattern: /(>[^<]*?)won't([^<]*?<)/gi, replacement: "$1won&apos;t$2" },
  { pattern: /(>[^<]*?)isn't([^<]*?<)/gi, replacement: "$1isn&apos;t$2" },
  { pattern: /(>[^<]*?)doesn't([^<]*?<)/gi, replacement: "$1doesn&apos;t$2" },
  { pattern: /(>[^<]*?)didn't([^<]*?<)/gi, replacement: "$1didn&apos;t$2" },
  { pattern: /(>[^<]*?)haven't([^<]*?<)/gi, replacement: "$1haven&apos;t$2" },
  { pattern: /(>[^<]*?)hasn't([^<]*?<)/gi, replacement: "$1hasn&apos;t$2" },
  { pattern: /(>[^<]*?)shouldn't([^<]*?<)/gi, replacement: "$1shouldn&apos;t$2" },
  { pattern: /(>[^<]*?)wouldn't([^<]*?<)/gi, replacement: "$1wouldn&apos;t$2" },
  { pattern: /(>[^<]*?)couldn't([^<]*?<)/gi, replacement: "$1couldn&apos;t$2" },
  { pattern: /(>[^<]*?)we're([^<]*?<)/gi, replacement: "$1we&apos;re$2" },
  { pattern: /(>[^<]*?)you're([^<]*?<)/gi, replacement: "$1you&apos;re$2" },
  { pattern: /(>[^<]*?)they're([^<]*?<)/gi, replacement: "$1they&apos;re$2" },
  { pattern: /(>[^<]*?)it's([^<]*?<)/gi, replacement: "$1it&apos;s$2" },
  { pattern: /(>[^<]*?)you'll([^<]*?<)/gi, replacement: "$1you&apos;ll$2" },
  { pattern: /(>[^<]*?)we'll([^<]*?<)/gi, replacement: "$1we&apos;ll$2" },
  { pattern: /(>[^<]*?)I'll([^<]*?<)/gi, replacement: "$1I&apos;ll$2" },
  { pattern: /(>[^<]*?)I'm([^<]*?<)/gi, replacement: "$1I&apos;m$2" },
  // Possessives
  { pattern: /(>[^<]*?)today's([^<]*?<)/gi, replacement: "$1today&apos;s$2" },
  { pattern: /(>[^<]*?)month's([^<]*?<)/gi, replacement: "$1month&apos;s$2" },
  { pattern: /(>[^<]*?)year's([^<]*?<)/gi, replacement: "$1year&apos;s$2" },
];

// Files to fix
const filesToFix = {
  jsxQuotes: [
    'app/about-us/page.tsx',
    'app/contact-us/page.tsx',
    'app/cv-services/page.tsx',
    'app/dashboard/community/page.tsx',
    'app/dashboard/job-board/page.tsx',
    'app/resources/ats/page.tsx',
    'app/resources/interview/page.tsx',
    'app/resources/LinkedIn/page.tsx',
    'app/resume-analysis/page.tsx',
    'app/terms/page.tsx',
    'components/GetUserId.tsx',
    'components/card/getStartedCard/getStartedCard.tsx',
    'components/login-form.tsx',
  ],
  unusedVars: [
    'app/dashboard/job-tracker/page.tsx',
    'app/dashboard/subscription/page.tsx',
    'app/dashboard/onboarding/profile-setup/page.tsx',
    'components/app-sidebar.tsx',
    'components/card/jobCard/jobCard.tsx',
    'components/common/header/hamburgerMenu.tsx',
    'components/common/header/header.tsx',
    'components/debug/EnvironmentChecker.tsx',
    'components/login-form.tsx',
    'components/ui/animated-product-showcase.tsx',
    'components/ui/dashboard-bento-grid.tsx',
    'components/ui/resume-analysis-form.tsx',
    'components/ui/sidebar.tsx',
  ],
};

function fixJSXQuotes(content) {
  let modified = content;
  jsxQuoteFixes.forEach(({ pattern, replacement }) => {
    modified = modified.replace(pattern, replacement);
  });
  return modified;
}

function removeUnusedImports(content, filename) {
  let modified = content;

  // Common patterns for specific files
  const patterns = {
    'app/dashboard/job-tracker/page.tsx': [
      { find: /^import\s+Image\s+from\s+['"]next\/image['"];?\s*\n/m, replace: '' },
      { find: /const\s+\[userId,\s+setUserId\]\s*=\s*useState\([^)]*\);?\s*\n/m, replace: '' },
    ],
    'app/dashboard/subscription/page.tsx': [
      { find: /,\s*Calendar\s*(?=[,}])/g, replace: '' },
      { find: /,\s*CardDescription\s*(?=[,}])/g, replace: '' },
    ],
    'app/dashboard/onboarding/profile-setup/page.tsx': [
      { find: /^\/\*\s*eslint-disable[^*]*\*\/\s*\n/m, replace: '' },
      { find: /const\s+formCompletionStatus\s*=\s*[^;]+;\s*\n/m, replace: '' },
    ],
    'components/app-sidebar.tsx': [
      { find: /,\s*Crown\s*(?=[,}])/g, replace: '' },
      { find: /,\s*UserDetails\s*(?=[,}])/g, replace: '' },
      { find: /,\s*UserSubscription\s*(?=[,}])/g, replace: '' },
    ],
    'components/card/jobCard/jobCard.tsx': [
      { find: /import\s*{\s*auth\s*}\s*from[^;]+;\s*\n/m, replace: '' },
      { find: /import\s*{\s*getUserProfile\s*}\s*from[^;]+;\s*\n/m, replace: '' },
    ],
    'components/common/header/hamburgerMenu.tsx': [
      { find: /import\s*{\s*ResponsivePageContainer\s*}\s*from[^;]+;\s*\n/m, replace: '' },
    ],
    'components/common/header/header.tsx': [
      { find: /const\s+router\s*=\s*useRouter\(\);?\s*\n/m, replace: '' },
    ],
    'components/ui/animated-product-showcase.tsx': [
      { find: /,\s*onComplete\s*(?=[,}])/g, replace: '' },
    ],
    'components/ui/dashboard-bento-grid.tsx': [
      { find: /import\s*{\s*cn\s*}\s*from[^;]+;\s*\n/m, replace: '' },
      { find: /,\s*BentoGrid\s*(?=[,}])/g, replace: '' },
      { find: /,\s*IconTrendingUp\s*(?=[,}])/g, replace: '' },
    ],
  };

  if (patterns[filename]) {
    patterns[filename].forEach(({ find, replace }) => {
      modified = modified.replace(find, replace);
    });
  }

  return modified;
}

function addEslintDisable(content, lineNumbers, errorType) {
  const lines = content.split('\n');
  const linesToDisable = new Set(lineNumbers);

  const result = [];
  for (let i = 0; i < lines.length; i++) {
    if (linesToDisable.has(i + 1)) {
      result.push(`  // eslint-disable-next-line ${errorType}`);
    }
    result.push(lines[i]);
  }

  return result.join('\n');
}

function processFile(filePath, type) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`[SKIP] ${filePath} - not found`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;

  if (type === 'jsxQuotes') {
    content = fixJSXQuotes(content);
  } else if (type === 'unusedVars') {
    content = removeUnusedImports(content, filePath);
  }

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`[FIXED] ${filePath}`);
    return true;
  }

  return false;
}

// Main execution
console.log('[START] Comprehensive Lint Fixer\n');

let totalFixed = 0;

console.log('[JSX QUOTES] Fixing...');
filesToFix.jsxQuotes.forEach(file => {
  if (processFile(file, 'jsxQuotes')) totalFixed++;
});

console.log('\n[UNUSED VARS] Fixing...');
filesToFix.unusedVars.forEach(file => {
  if (processFile(file, 'unusedVars')) totalFixed++;
});

console.log(`\n[DONE] Fixed ${totalFixed} files`);
console.log('[INFO] Run "npm run lint" to check remaining errors');
