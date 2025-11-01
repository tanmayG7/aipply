#!/usr/bin/env python3
"""
Fix JSX quote escaping errors automatically
Replaces unescaped quotes in JSX content with HTML entities
"""

import re
import sys
from pathlib import Path

def fix_jsx_quotes_in_file(file_path):
    """Fix JSX quote escaping in a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Fix common patterns - be conservative to avoid breaking code
        # Pattern: text between > and < (JSX content)
        def replace_in_jsx_content(match):
            text = match.group(0)
            # Don't modify if it's already escaped or if it contains code
            if '&apos;' in text or '&quot;' in text or '{' in text or 'className' in text:
                return text
            # Replace unescaped single quotes
            text = text.replace("'", "&apos;")
            # Replace unescaped double quotes (but not in attributes)
            if not '="' in text and not "='" in text:
                text = text.replace('"', "&quot;")
            return text

        # Simple replacement for obvious cases in JSX text
        # Don't use regex - too risky. Do manual string search for common phrases
        replacements = [
            ("Don't", "Don&apos;t"),
            ("can't", "can&apos;t"),
            ("won't", "won&apos;t"),
            ("isn't", "isn&apos;t"),
            ("aren't", "aren&apos;t"),
            ("doesn't", "doesn&apos;t"),
            ("didn't", "didn&apos;t"),
            ("haven't", "haven&apos;t"),
            ("hasn't", "hasn&apos;t"),
            ("shouldn't", "shouldn&apos;t"),
            ("wouldn't", "wouldn&apos;t"),
            ("couldn't", "couldn&apos;t"),
            ("We're", "We&apos;re"),
            ("we're", "we&apos;re"),
            ("You're", "You&apos;re"),
            ("you're", "you&apos;re"),
            ("They're", "They&apos;re"),
            ("they're", "they&apos;re"),
            ("It's", "It&apos;s"),
            ("it's", "it&apos;s"),
            ("You'll", "You&apos;ll"),
            ("you'll", "you&apos;ll"),
            ("We'll", "We&apos;ll"),
            ("we'll", "we&apos;ll"),
            ("I'll", "I&apos;ll"),
            ("I'm", "I&apos;m"),
            ("Today's", "Today&apos;s"),
            ("today's", "today&apos;s"),
            ("Month's", "Month&apos;s"),
            ("month's", "month&apos;s"),
        ]

        for old, new in replacements:
            # Only replace in JSX content (between > and <)
            # Simple heuristic: if the word appears after > and before <
            lines = content.split('\n')
            for i, line in enumerate(lines):
                # Skip if line contains code indicators
                if 'const ' in line or 'function' in line or 'import' in line or '===' in line:
                    continue
                # Only fix in JSX-like contexts
                if '>' in line and '<' in line and old in line:
                    lines[i] = line.replace(old, new)
            content = '\n'.join(lines)

        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"[OK] Fixed: {file_path}")
            return True
        return False

    except Exception as e:
        print(f"[ERROR] Error processing {file_path}: {e}")
        return False

def main():
    # Files with JSX quote errors from lint output
    files_to_fix = [
        "app/about-us/page.tsx",
        "app/contact-us/page.tsx",
        "app/cv-services/page.tsx",
        "app/dashboard/community/page.tsx",
        "app/dashboard/job-board/page.tsx",
        "app/dashboard/subscription/page.tsx",
        "app/features/auto-apply/dashboard/page.tsx",
        "app/privacy/page.tsx",
        "app/refund/page.tsx",
        "app/resources/ats/page.tsx",
        "app/resources/interview/page.tsx",
        "app/resources/LinkedIn/page.tsx",
        "app/resume-analysis/page.tsx",
        "app/terms/page.tsx",
        "components/GetUserId.tsx",
        "components/card/getStartedCard/getStartedCard.tsx",
        "components/debug/ButtonDebugger.tsx",
        "components/login-form.tsx",
        "components/subscription/CancellationWizard.tsx",
    ]

    fixed_count = 0
    for file_path in files_to_fix:
        full_path = Path(file_path)
        if full_path.exists():
            if fix_jsx_quotes_in_file(full_path):
                fixed_count += 1
        else:
            print(f"[WARN] File not found: {file_path}")

    print(f"\n[DONE] Fixed {fixed_count} files")

if __name__ == "__main__":
    main()
