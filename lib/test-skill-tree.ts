// Test file: test-skill-tree.ts (or add to an existing component)
import { getSkillsForJobTitle, getSkillsStats, getAllJobTitles } from './lib/enhanced-skill-tree';

// Test basic functionality
console.log('=== Skill Tree Stats ===');
console.log(getSkillsStats());

console.log('\n=== Sample Job Skills ===');
console.log('Software Engineer:', getSkillsForJobTitle('Software Engineer'));
console.log('AI Engineer:', getSkillsForJobTitle('AI Engineer'));
console.log('Data Scientist:', getSkillsForJobTitle('Data Scientist'));

// Test fuzzy matching
console.log('\n=== Fuzzy Matching Tests ===');
console.log('software engineer (lowercase):', getSkillsForJobTitle('software engineer'));
console.log('Frontend Dev (partial match):', getSkillsForJobTitle('Frontend'));
console.log('ML Engineer (partial match):', getSkillsForJobTitle('ML Engineer'));

console.log('\n=== Total Job Titles Available ===');
console.log(`Total: ${getAllJobTitles().length}`);
console.log('First 10:', getAllJobTitles().slice(0, 10));
