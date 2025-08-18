#!/usr/bin/env ts-node
// scripts/find-emojis.ts
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import * as path from 'path';

// Comprehensive emoji regex pattern
// Matches most common emoji ranges in Unicode
const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]/gu;

interface EmojiMatch {
  file: string;
  line: number;
  column: number;
  emoji: string;
  context: string;
}

function findEmojisInFile(filePath: string): EmojiMatch[] {
  if (!existsSync(filePath)) {
    return [];
  }

  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const matches: EmojiMatch[] = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    
    // Skip console.log lines and comments
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('console.log') || 
        trimmedLine.startsWith('//') || 
        trimmedLine.startsWith('*') ||
        trimmedLine.startsWith('/*')) {
      continue;
    }

    let match;
    emojiRegex.lastIndex = 0; // Reset regex state
    
    while ((match = emojiRegex.exec(line)) !== null) {
      matches.push({
        file: filePath,
        line: lineIndex + 1,
        column: match.index + 1,
        emoji: match[0],
        context: line.trim()
      });
      
      // Prevent infinite loop on zero-width matches
      if (match.index === emojiRegex.lastIndex) {
        emojiRegex.lastIndex++;
      }
    }
  }

  return matches;
}

function getAllFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];
  
  function scanDir(currentDir: string) {
    const items = readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other common ignore patterns
        if (!item.startsWith('.') && item !== 'node_modules') {
          scanDir(fullPath);
        }
      } else {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  scanDir(dir);
  return files;
}

async function findAllEmojis(failOnFound: boolean = false): Promise<void> {
  console.log('🔍 Scanning for emojis in TypeScript and TSX files...\n');

  try {
    // Find all TypeScript and TSX files in app and components directories
    const appFiles = getAllFiles(path.join(process.cwd(), 'app'), ['.ts', '.tsx']);
    const componentFiles = getAllFiles(path.join(process.cwd(), 'components'), ['.ts', '.tsx']);
    const files = [...appFiles, ...componentFiles];

    let totalMatches = 0;
    const allMatches: EmojiMatch[] = [];

    for (const file of files) {
      const matches = findEmojisInFile(file);
      if (matches.length > 0) {
        allMatches.push(...matches);
        totalMatches += matches.length;
      }
    }

    if (totalMatches === 0) {
      console.log('✅ No emojis found in UI components!');
      console.log(`📊 Scanned ${files.length} files`);
      process.exit(0);
    }

    // Group matches by file for better readability
    const matchesByFile = allMatches.reduce((acc, match) => {
      if (!acc[match.file]) {
        acc[match.file] = [];
      }
      acc[match.file].push(match);
      return acc;
    }, {} as Record<string, EmojiMatch[]>);

    console.log(`❌ Found ${totalMatches} emoji(s) in ${Object.keys(matchesByFile).length} file(s):\n`);

    // Display results grouped by file
    for (const [filePath, matches] of Object.entries(matchesByFile)) {
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`📁 ${relativePath}:`);
      
      for (const match of matches) {
        console.log(`   Line ${match.line}:${match.column} - "${match.emoji}" in: ${match.context}`);
      }
      console.log('');
    }

    console.log(`📊 Summary:`);
    console.log(`   Files scanned: ${files.length}`);
    console.log(`   Files with emojis: ${Object.keys(matchesByFile).length}`);
    console.log(`   Total emojis found: ${totalMatches}`);

    if (failOnFound) {
      console.log('\n💥 Emoji audit failed! Please replace all emojis with icon components.');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error during emoji scan:', error);
    process.exit(1);
  }
}

// Check if this script is being run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const shouldFail = args.includes('--fail');
  
  findAllEmojis(shouldFail)
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

export { findAllEmojis, findEmojisInFile };