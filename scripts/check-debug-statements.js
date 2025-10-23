#!/usr/bin/env node

/**
 * Pre-commit hook to prevent debug statements from being committed
 *
 * This script scans staged files for debug statements and fails the commit
 * if any are found, preventing them from reaching production.
 *
 * Patterns checked:
 * - "Debug:" text in JSX/code
 * - console.log statements with debug emojis (🔍)
 * - Common debug variable names
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Patterns to detect debug code
const DEBUG_PATTERNS = [
  /Debug:\s*\w+=/i,                    // Debug: variable=value
  /\{\/\*.*Debug.*\*\/\}/i,            // {/* Debug comments */}
  /<p>.*Debug:/i,                      // <p>Debug: ...
  /<div>.*Debug:/i,                    // <div>Debug: ...
  /console\.log\(['"]🔍/,              // console.log with debug emoji
  /data-debug=/i,                       // data-debug attributes
  /className=["'].*debug.*["']/i,      // debug classnames
];

// File extensions to check
const EXTENSIONS_TO_CHECK = ['.ts', '.tsx', '.js', '.jsx'];

function checkFile(filePath) {
  const ext = path.extname(filePath);
  if (!EXTENSIONS_TO_CHECK.includes(ext)) {
    return { hasDebug: false, matches: [] };
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const matches = [];

    lines.forEach((line, index) => {
      DEBUG_PATTERNS.forEach((pattern) => {
        if (pattern.test(line)) {
          matches.push({
            line: index + 1,
            content: line.trim(),
            pattern: pattern.toString(),
          });
        }
      });
    });

    return {
      hasDebug: matches.length > 0,
      matches,
    };
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return { hasDebug: false, matches: [] };
  }
}

function main() {
  try {
    // Get list of staged files
    const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf8',
    })
      .trim()
      .split('\n')
      .filter(Boolean);

    if (stagedFiles.length === 0) {
      console.log('✅ No staged files to check');
      process.exit(0);
    }

    console.log(`🔍 Checking ${stagedFiles.length} staged files for debug statements...\n`);

    let foundDebug = false;
    const filesWithDebug = [];

    stagedFiles.forEach((file) => {
      const result = checkFile(file);
      if (result.hasDebug) {
        foundDebug = true;
        filesWithDebug.push({ file, matches: result.matches });
      }
    });

    if (foundDebug) {
      console.error('❌ Debug statements found in staged files!\n');
      console.error('The following files contain debug code that should not be committed:\n');

      filesWithDebug.forEach(({ file, matches }) => {
        console.error(`\n📄 ${file}:`);
        matches.forEach(({ line, content }) => {
          console.error(`   Line ${line}: ${content}`);
        });
      });

      console.error('\n💡 Please remove debug statements before committing.');
      console.error('   Use the DebugPanel component from @/components/dev/DebugPanel for development debugging.\n');

      process.exit(1);
    }

    console.log('✅ No debug statements found. Commit is safe to proceed.\n');
    process.exit(0);
  } catch (error) {
    console.error('Error running debug check:', error.message);
    // Don't block commits if the script fails
    console.warn('⚠️  Check failed, but allowing commit to proceed');
    process.exit(0);
  }
}

main();
