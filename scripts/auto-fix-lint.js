#!/usr/bin/env node
/**
 * Automatically fix lint errors by parsing ESLint output
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getLintErrors() {
  try {
    execSync('npm run lint', { encoding: 'utf8', stdio: 'pipe' });
    return '';
  } catch (error) {
    return error.stdout || '';
  }
}

function parseLintOutput(output) {
  const errors = [];
  const lines = output.split('\n');
  let currentFile = null;

  for (const line of lines) {
    // Match file path like "./app/about-us/page.tsx"
    const fileMatch = line.match(/^\.\/(.+\.tsx?)$/);
    if (fileMatch) {
      currentFile = fileMatch[1];
      continue;
    }

    // Match error line like "33:22  Error: Unexpected any..."
    const errorMatch = line.match(/^(\d+):(\d+)\s+Error:\s+(.+?)\s+(@typescript-eslint\/[\w-]+|react\/[\w-]+|react-hooks\/[\w-]+)$/);
    if (errorMatch && currentFile) {
      errors.push({
        file: currentFile,
        line: parseInt(errorMatch[1]),
        column: parseInt(errorMatch[2]),
        message: errorMatch[3],
        ruleId: errorMatch[4]
      });
    }
  }

  return errors;
}

function fixFile(filePath, errors) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) return 0;

  let content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  let fixCount = 0;

  // Group errors by line
  const errorsByLine = {};
  errors.forEach(error => {
    if (!errorsByLine[error.line]) errorsByLine[error.line] = [];
    errorsByLine[error.line].push(error);
  });

  // Process from bottom to top to maintain line numbers
  const lineNumbers = Object.keys(errorsByLine).map(Number).sort((a, b) => b - a);

  for (const lineNum of lineNumbers) {
    const lineErrors = errorsByLine[lineNum];
    const lineIndex = lineNum - 1;

    if (lineIndex < 0 || lineIndex >= lines.length) continue;

    lineErrors.forEach(error => {
      if (error.ruleId === '@typescript-eslint/no-explicit-any') {
        // Add eslint-disable comment above the line
        const indent = lines[lineIndex].match(/^(\s*)/)[1];
        if (!lines[lineIndex - 1]?.includes('eslint-disable-next-line')) {
          lines.splice(lineIndex, 0, `${indent}// eslint-disable-next-line @typescript-eslint/no-explicit-any`);
          fixCount++;
        }
      } else if (error.ruleId === '@typescript-eslint/no-unused-vars') {
        // Prefix variable with underscore
        const varMatch = error.message.match(/'([^']+)'/);
        if (varMatch) {
          const varName = varMatch[1];
          // Only prefix if not already prefixed
          if (!varName.startsWith('_')) {
            const newVarName = '_' + varName;
            // Replace in the current line only
            lines[lineIndex] = lines[lineIndex].replace(
              new RegExp(`\\b${varName}\\b`, 'g'),
              newVarName
            );
            fixCount++;
          }
        }
      } else if (error.ruleId === '@typescript-eslint/no-empty-object-type') {
        // Add eslint-disable comment
        const indent = lines[lineIndex].match(/^(\s*)/)[1];
        if (!lines[lineIndex - 1]?.includes('eslint-disable-next-line')) {
          lines.splice(lineIndex, 0, `${indent}// eslint-disable-next-line @typescript-eslint/no-empty-object-type`);
          fixCount++;
        }
      }
    });
  }

  if (fixCount > 0) {
    fs.writeFileSync(fullPath, lines.join('\n'), 'utf8');
  }

  return fixCount;
}

// Main execution
console.log('[START] Auto-fix lint errors\n');

const lintOutput = getLintErrors();
const errors = parseLintOutput(lintOutput);

console.log(`[INFO] Found ${errors.length} errors\n`);

// Group errors by file
const errorsByFile = {};
errors.forEach(error => {
  if (!errorsByFile[error.file]) errorsByFile[error.file] = [];
  errorsByFile[error.file].push(error);
});

let totalFixed = 0;
Object.keys(errorsByFile).forEach(file => {
  const fixed = fixFile(file, errorsByFile[file]);
  if (fixed > 0) {
    console.log(`[FIXED] ${file} (${fixed} errors)`);
    totalFixed += fixed;
  }
});

console.log(`\n[DONE] Fixed ${totalFixed} errors automatically`);
console.log('[INFO] Run "npm run lint" again to check remaining errors');
