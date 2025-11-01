#!/usr/bin/env node

/**
 * Automated ESLint Error Fixer
 * Fixes common lint errors across the codebase
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all files with lint errors
function getLintErrors() {
  try {
    execSync('npm run lint', { encoding: 'utf8', stdio: 'pipe' });
    return [];
  } catch (error) {
    const output = error.stdout || '';
    return output;
  }
}

// Fix JSX quote escaping errors
function fixJSXQuotes(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix single quotes (apostrophes) in JSX text
  // This regex matches text between > and < that contains unescaped '
  const jsxTextPattern = /(>)([^<]*?)(<)/g;
  content = content.replace(jsxTextPattern, (match, openTag, text, closeTag) => {
    if (text.includes("'") && !text.includes('&apos;')) {
      modified = true;
      return openTag + text.replace(/'/g, '&apos;') + closeTag;
    }
    return match;
  });

  // Fix double quotes in JSX text
  content = content.replace(jsxTextPattern, (match, openTag, text, closeTag) => {
    if (text.includes('"') && !text.includes('&quot;')) {
      modified = true;
      return openTag + text.replace(/"/g, '&quot;') + closeTag;
    }
    return match;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed JSX quotes in: ${filePath}`);
    return true;
  }
  return false;
}

// Remove unused imports
function removeUnusedImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Common unused imports to remove
  const unusedImports = [
    { pattern: /import\s+{\s*Image\s*}\s+from\s+['"]next\/image['"];?\n/g, name: 'Image' },
    { pattern: /,\s*Crown\s*(?=})/g, name: 'Crown' },
    { pattern: /,\s*Calendar\s*(?=})/g, name: 'Calendar' },
    { pattern: /,\s*CardDescription\s*(?=})/g, name: 'CardDescription' },
    { pattern: /,\s*ChevronDown\s*(?=})/g, name: 'ChevronDown (if unused)' },
  ];

  unusedImports.forEach(({ pattern, name }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, '');
      modified = true;
      console.log(`  - Removed unused import: ${name}`);
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Removed unused imports in: ${filePath}`);
    return true;
  }
  return false;
}

// Add eslint-disable comments for specific any types
function addEslintDisable(filePath, lineNumber) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  if (lines[lineNumber - 1] && !lines[lineNumber - 1].includes('eslint-disable')) {
    lines.splice(lineNumber - 1, 0, '  // eslint-disable-next-line @typescript-eslint/no-explicit-any');
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    return true;
  }
  return false;
}

// Main execution
console.log('🔧 Starting automated lint fixes...\n');

const lintOutput = getLintErrors();
console.log('📊 Found lint errors, beginning fixes...\n');

// Parse files with errors
const fileMatches = lintOutput.matchAll(/^\.\/(.+\.tsx?)$/gm);
const filesWithErrors = new Set();

for (const match of fileMatches) {
  filesWithErrors.add(match[1]);
}

console.log(`📝 Found ${filesWithErrors.size} files with lint errors\n`);

let fixedCount = 0;

// Fix JSX quote errors in all files
for (const file of filesWithErrors) {
  const filePath = path.join(process.cwd(), file);

  if (fs.existsSync(filePath)) {
    if (fixJSXQuotes(filePath)) {
      fixedCount++;
    }
  }
}

console.log(`\n✨ Fixed JSX quotes in ${fixedCount} files`);
console.log('\n🎯 Run "npm run lint" to see remaining errors');
