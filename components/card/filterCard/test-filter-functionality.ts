// Test script for filter functionality
import { Job } from '@/lib/types';

// Mock job data for testing
const mockJobs: Job[] = [
  {
    _id: '1',
    id: '1',
    jobId: 'job1',
    title: 'Frontend Developer',
    company: 'Tech Corp',
    salary: ['5-8 Lakhs'],
    experience: '2-4 Years',
    location: ['Mumbai'],
    description: 'React developer position',
    recruiter: 'HR Team',
    jobUrl: 'https://example.com/job1',
    platform: 'Foundit',
    postedDate: '2025-01-10',
    logoUrl: 'https://example.com/logo1.jpg',
    tags: ['React', 'JavaScript', 'Frontend'],
    type: 'Full-time'
  },
  {
    _id: '2',
    id: '2', 
    jobId: 'job2',
    title: 'Backend Developer',
    company: 'StartupCo',
    salary: ['8-12 Lakhs'],
    experience: '3-5 Years',
    location: ['Bangalore'],
    description: 'Node.js backend developer',
    recruiter: 'Tech Lead',
    jobUrl: 'https://example.com/job2',
    platform: 'Hirist',
    postedDate: '2025-01-11',
    logoUrl: 'https://example.com/logo2.jpg',
    tags: ['Node.js', 'Backend', 'API'],
    type: 'Full-time'
  },
  {
    _id: '3',
    id: '3',
    jobId: 'job3', 
    title: 'UI/UX Designer',
    company: 'Design Studio',
    salary: ['4-6 Lakhs'],
    experience: '1-3 Years',
    location: ['Delhi'],
    description: 'Creative UI/UX designer role',
    recruiter: 'Design Head',
    jobUrl: 'https://example.com/job3',
    platform: 'Shine',
    postedDate: '2025-01-12',
    logoUrl: 'https://example.com/logo3.jpg',
    tags: ['UI/UX', 'Design', 'Figma'],
    type: 'Contract'
  }
];

export function testFilterFunctionality() {
  console.log('🧪 Testing Filter Functionality...');
  
  // Test 1: Salary Range Filtering
  console.log('\n📊 Test 1: Salary Range Filtering');
  const salaryRange: [number, number][] = [[500000, 800000]]; // 5-8 Lakhs
  const salaryFilteredJobs = mockJobs.filter(job => {
    const jobSalaryRanges = job.salary?.map(value => {
      const [minStr, maxStr] = value.replace(/\s*Lakhs\s*/gi, '').split('-').map(v => parseFloat(v));
      return [minStr * 100000, maxStr * 100000] as [number, number];
    }) || [[0, 0]];
    
    return jobSalaryRanges.some(([jobMin, jobMax]) =>
      salaryRange.some(([filterMin, filterMax]) => {
        return (
          (jobMin >= filterMin && jobMin <= filterMax) ||
          (jobMax >= filterMin && jobMax <= filterMax) ||
          (jobMin <= filterMin && jobMax >= filterMax)
        );
      })
    );
  });
  
  console.log(`✅ Salary filter (5-8 Lakhs): ${salaryFilteredJobs.length} jobs found`);
  console.log(`   Jobs: ${salaryFilteredJobs.map(j => j.title).join(', ')}`);
  
  // Test 2: Experience Range Filtering
  console.log('\n👔 Test 2: Experience Range Filtering');
  const experienceRange: [number, number][] = [[2, 4]]; // 2-4 years
  const experienceFilteredJobs = mockJobs.filter(job => {
    const [jobExpMin, jobExpMax] = job.experience
      ? job.experience.replace(/[^\d\-]/g, '').split('-').map(v => parseInt(v, 10))
      : [0, 0];
    
    return experienceRange.some(([filterMin, filterMax]) => {
      return (
        (jobExpMin >= filterMin && jobExpMin <= filterMax) ||
        (jobExpMax >= filterMin && jobExpMax <= filterMax) ||
        (jobExpMin <= filterMin && jobExpMax >= filterMax)
      );
    });
  });
  
  console.log(`✅ Experience filter (2-4 years): ${experienceFilteredJobs.length} jobs found`);
  console.log(`   Jobs: ${experienceFilteredJobs.map(j => j.title).join(', ')}`);
  
  // Test 3: Job Type Filtering  
  console.log('\n💼 Test 3: Job Type Filtering');
  const jobTypeFilter = ['Full-time'];
  const jobTypeFilteredJobs = mockJobs.filter(job => {
    return jobTypeFilter.includes(job.type || 'Full-time');
  });
  
  console.log(`✅ Job type filter (Full-time): ${jobTypeFilteredJobs.length} jobs found`);
  console.log(`   Jobs: ${jobTypeFilteredJobs.map(j => j.title).join(', ')}`);
  
  // Test 4: Combined Filters
  console.log('\n🔍 Test 4: Combined Filters');
  const combinedFiltered = mockJobs.filter(job => {
    // Check salary
    const jobSalaryRanges = job.salary?.map(value => {
      const [minStr, maxStr] = value.replace(/\s*Lakhs\s*/gi, '').split('-').map(v => parseFloat(v));
      return [minStr * 100000, maxStr * 100000] as [number, number];
    }) || [[0, 0]];
    
    const salaryMatch = jobSalaryRanges.some(([jobMin, jobMax]) =>
      salaryRange.some(([filterMin, filterMax]) => {
        return (
          (jobMin >= filterMin && jobMin <= filterMax) ||
          (jobMax >= filterMin && jobMax <= filterMax) ||
          (jobMin <= filterMin && jobMax >= filterMax)
        );
      })
    );
    
    // Check job type
    const jobTypeMatch = jobTypeFilter.includes(job.type || 'Full-time');
    
    return salaryMatch && jobTypeMatch;
  });
  
  console.log(`✅ Combined filters (5-8 Lakhs + Full-time): ${combinedFiltered.length} jobs found`);
  console.log(`   Jobs: ${combinedFiltered.map(j => j.title).join(', ')}`);
  
  console.log('\n🎉 Filter functionality tests completed!');
  
  return {
    totalJobs: mockJobs.length,
    salaryFiltered: salaryFilteredJobs.length,
    experienceFiltered: experienceFilteredJobs.length,
    jobTypeFiltered: jobTypeFilteredJobs.length,
    combinedFiltered: combinedFiltered.length,
    success: true
  };
}

// Test checkbox state management
export function testCheckboxStates() {
  console.log('\n☑️ Testing Checkbox States...');
  
  // Mock filter states
  const salaryRange: [number, number][] = [[500000, 800000], [800000, 1200000]];
  const experience: [number, number][] = [[2, 4]];
  const jobType: string[] = ['Full-time', 'Contract'];
  
  // Test salary range checkbox states
  const salaryOptions = [
    { label: '0-5 Lakhs', range: [0, 500000] },
    { label: '5-8 Lakhs', range: [500000, 800000] },
    { label: '8-12 Lakhs', range: [800000, 1200000] }
  ];
  
  salaryOptions.forEach(option => {
    const isChecked = salaryRange.some(r => 
      r[0] === option.range[0] && r[1] === option.range[1]
    );
    console.log(`   ${option.label}: ${isChecked ? '✅ Checked' : '⬜ Unchecked'}`);
  });
  
  // Test experience checkbox states
  const experienceOptions = [
    { label: '0-2 Years', range: [0, 2] },
    { label: '2-4 Years', range: [2, 4] },
    { label: '4-8 Years', range: [4, 8] }
  ];
  
  experienceOptions.forEach(option => {
    const isChecked = experience.some(r =>
      r[0] === option.range[0] && r[1] === option.range[1]
    );
    console.log(`   ${option.label}: ${isChecked ? '✅ Checked' : '⬜ Unchecked'}`);
  });
  
  // Test job type checkbox states
  const jobTypeOptions = [
    { label: 'Full-time', value: 'Full-time' },
    { label: 'Contract', value: 'Contract' },
    { label: 'Freelance', value: 'Freelance' }
  ];
  
  jobTypeOptions.forEach(option => {
    const isChecked = jobType.includes(option.value);
    console.log(`   ${option.label}: ${isChecked ? '✅ Checked' : '⬜ Unchecked'}`);
  });
  
  console.log('\n✅ Checkbox state tests completed!');
  
  return {
    salaryChecked: salaryRange.length,
    experienceChecked: experience.length, 
    jobTypeChecked: jobType.length,
    success: true
  };
}

// Export mock data
export { mockJobs };