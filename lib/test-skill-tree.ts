// lib/test-skill-tree.ts
import { getSkillsForJobTitle, getSkillsStats, getAllJobTitles } from './enhanced-skill-tree';

export const testSkillTree = () => {
  console.log('=== Enhanced Skill Tree Test Results ===');
  
  try {
    // Basic stats
    const stats = getSkillsStats();
    console.log('📊 Statistics:', stats);
    
    // Test specific job titles
    const testJobs = ['Software Engineer', 'AI Engineer', 'Data Scientist', 'Product Manager'];
    testJobs.forEach(job => {
      const skills = getSkillsForJobTitle(job);
      console.log(`🔧 ${job}:`, skills?.slice(0, 5), `(${skills?.length || 0} total)`);
    });
    
    // Test fuzzy matching
    console.log('\n🔍 Fuzzy Matching Tests:');
    console.log('software engineer:', getSkillsForJobTitle('software engineer')?.slice(0, 3));
    console.log('frontend:', getSkillsForJobTitle('frontend')?.slice(0, 3));
    console.log('ml engineer:', getSkillsForJobTitle('ml engineer')?.slice(0, 3));
    
    // Show available job titles
    const allTitles = getAllJobTitles();
    console.log(`\n📋 Total job titles: ${allTitles.length}`);
    console.log('Sample titles:', allTitles.slice(0, 10));
    
    // Test edge cases
    console.log('\n🧪 Edge Case Tests:');
    console.log('Empty string:', getSkillsForJobTitle(''));
    console.log('Non-existent job:', getSkillsForJobTitle('Unicorn Trainer'));
    console.log('Case sensitivity:', getSkillsForJobTitle('SOFTWARE ENGINEER'));
    
    console.log('\n✅ Skill tree test completed successfully!');
    return stats;
    
  } catch (error) {
    console.error('❌ Error in testSkillTree:', error);
    return null;
  }
};
