import { useState, useCallback } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';

export const useSkillsManager = () => {
  const { state, updateSkills } = useOnboarding();
  const [skillsInput, setSkillsInput] = useState('');

  const addSkill = useCallback(async (skill?: string) => {
    const skillToAdd = skill || skillsInput.trim();
    if (skillToAdd && !state.formData.skills.includes(skillToAdd)) {
      const updatedSkills = [...state.formData.skills, skillToAdd];
      updateSkills(updatedSkills);
      setSkillsInput('');
    }
  }, [skillsInput, state.formData.skills, updateSkills]);

  const removeSkill = useCallback(async (skillToRemove: string) => {
    const updatedSkills = state.formData.skills.filter(skill => skill !== skillToRemove);
    updateSkills(updatedSkills);
  }, [state.formData.skills, updateSkills]);

  const handleSkillsInputChange = useCallback((value: string) => {
    setSkillsInput(value);
  }, []);

  const handleSkillsInputKeyDown = useCallback(async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      await addSkill();
    }
  }, [addSkill]);

  return {
    skills: state.formData.skills,
    skillsInput,
    addSkill,
    removeSkill,
    handleSkillsInputChange,
    handleSkillsInputKeyDown,
    setSkillsInput,
  };
};