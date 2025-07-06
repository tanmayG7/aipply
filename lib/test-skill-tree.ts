// lib/test-skill-tree.ts
import { getSkillsForJobTitle, getSkillsStats, getAllJobTitles } from './enhanced-skill-tree';
//                                                                    ^^ Remove the "lib/" part

export const testSkillTree = () => {
  console.log('=== Enhanced Skill Tree Test Results ===');
  
  // Basic stats
  const stats = getSkillsStats();
  console.log('📊 Statistics:', stats);
  
  // Test specific job titles
  const testJobs = ['Software Engineer', 'AI Engineer', 'Data Scientist', 'Product Manager'];
  testJobs.forEach(job => {
    const skills = getSkillsForJobTitle(job);
    console.log(`🔧 ${job}:`, skills.slice(0, 5), `(${skills.length} total)`);
  });
  
  // Test fuzzy matching
  console.log('\n🔍 Fuzzy Matching Tests:');
  console.log('software engineer:', getSkillsForJobTitle('software engineer').slice(0, 3));
  console.log('frontend:', getSkillsForJobTitle('frontend').slice(0, 3));
  console.log('ml engineer:', getSkillsForJobTitle('ml engineer').slice(0, 3));
  
  // Show available job titles
  console.log(`\n📋 Total job titles: ${getAllJobTitles().length}`);
  console.log('Sample titles:', getAllJobTitles().slice(0, 10));
  
  return stats;
};
