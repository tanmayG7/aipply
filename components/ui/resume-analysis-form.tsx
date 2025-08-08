"use client";
import React, { useState, useCallback, useEffect } from "react";
import { EnhancedLabel } from "@/components/ui/enhanced-label";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import { cn } from "@/lib/utils";
import { auth, getUserProfile } from '@/lib/firebaseConfig/firebaseConfig';
import { UserDetails } from '@/lib/types';
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function ResumeAnalysisForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    targetRole: "",
    experienceLevel: "",
    focusAreas: [] as string[],
  });
  
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [currentStep, setCurrentStep] = useState(1);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submissionMessage, setSubmissionMessage] = useState('');

  // Load user data on component mount for autofill
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userData = await getUserProfile(user.uid);
          if (userData) {
            setUserDetails(userData);
            
            // Autofill form data from user profile
            setFormData(prev => ({
              ...prev,
              firstName: userData.firstName || prev.firstName,
              lastName: userData.lastName || prev.lastName,
              email: userData.email || user.email || prev.email,
              phone: prev.phone, // Keep empty unless specifically saved in profile
            }));
          }
        }
      } catch (error) {
        console.log('User not logged in or profile not found:', error);
      } finally {
        setIsLoadingUserData(false);
      }
    };

    loadUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFocusAreaChange = (area: string) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }));
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileUpload = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setUploadStatus('error');
      return;
    }
    
    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
      setUploadStatus('error');
      return;
    }

    setFile(selectedFile);
    setUploadStatus('success');
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Email and phone format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9\s\-().]{7,20}$/;

    if (!file || !formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setSubmissionStatus('error');
      setSubmissionMessage('Please fill in all required fields and upload a resume.');
      return;
    }

    if (!emailRegex.test(formData.email)) {
      setSubmissionStatus('error');
      setSubmissionMessage('Please enter a valid email address.');
      return;
    }

    if (!phoneRegex.test(formData.phone)) {
      setSubmissionStatus('error');
      setSubmissionMessage('Please enter a valid phone number.');
      return;
    }
    setSubmissionStatus('submitting');
    setSubmissionMessage('Analyzing your resume...');

    try {
      // Prepare data for n8n webhook - append individual fields and file to FormData
      const webhookData = {
        personalInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        preferences: {
          targetRole: formData.targetRole || 'Not specified',
          experienceLevel: formData.experienceLevel || 'Not specified',
          focusAreas: formData.focusAreas,
        },
        fileInfo: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        },
        metadata: {
          submittedAt: new Date().toISOString(),
          source: 'aipply-website',
        }
      };

      // Create FormData and append individual fields to avoid double JSON encoding
      const formDataToSend = new FormData();
      
      // Append personal info fields
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      
      // Append preferences
      formDataToSend.append('targetRole', formData.targetRole || 'Not specified');
      formDataToSend.append('experienceLevel', formData.experienceLevel || 'Not specified');
      formDataToSend.append('focusAreas', formData.focusAreas.join(','));
      
      // Append file info
      formDataToSend.append('fileName', file.name);
      formDataToSend.append('fileSize', file.size.toString());
      formDataToSend.append('fileType', file.type);
      
      // Append metadata
      formDataToSend.append('submittedAt', new Date().toISOString());
      formDataToSend.append('source', 'aipply-website');
      
      // Append the actual file
      formDataToSend.append('file', file);

      // Get webhook URL from environment variable
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
      
      if (!webhookUrl) {
        throw new Error('Webhook URL not configured');
      }
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        const result = await response.text(); // Get text response from n8n
        console.log('n8n Response:', result);
        
        // Check if workflow completed successfully
        if (result.includes('Workflow Completed!')) {
          setSubmissionStatus('success');
          setSubmissionMessage('Success! Your resume analysis will be sent to your email within 5 minutes.');
        } else {
          setSubmissionStatus('success');
          setSubmissionMessage('Your resume has been submitted for analysis. Check your email for results.');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionStatus('error');
      setSubmissionMessage('Something went wrong. Please try again or contact support.');
    }
  };

  const focusAreaOptions = [
    "ATS Optimization", 
    "Content Review", 
    "Format & Design", 
    "Keyword Analysis", 
    "Industry Alignment", 
    "Skills Assessment"
  ];

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="shadow-input mx-auto w-full max-w-2xl rounded-2xl bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-[#333741] p-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                currentStep >= step 
                  ? "bg-[#AE94FF] text-white" 
                  : "bg-[#333741] text-[#CECFD2]"
              )}>
                {step}
              </div>
              {step < 3 && (
                <div className={cn(
                  "w-16 h-1 mx-2 rounded transition-colors",
                  currentStep > step ? "bg-[#AE94FF]" : "bg-[#333741]"
                )} />
              )}
            </div>
          ))}
        </div>
        <div className="text-[#CECFD2] text-sm text-center">
          Step {currentStep} of 3: {
            currentStep === 1 ? "Upload Resume" : 
            currentStep === 2 ? "Analysis Preferences" : 
            "Contact Information"
          }
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#F5F5F6] mb-2">
          AI Resume Analysis
        </h2>
        <p className="text-[#CECFD2] text-sm max-w-md mx-auto">
          Get instant, actionable feedback on your resume with our AI-powered analysis tool
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Step 1: File Upload */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div
              className={cn(
                "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
                dragActive 
                  ? "border-[#AE94FF] bg-[#AE94FF] bg-opacity-10" 
                  : file 
                    ? "border-green-500 bg-green-500 bg-opacity-10"
                    : uploadStatus === 'error'
                      ? "border-red-500 bg-red-500 bg-opacity-10"
                      : "border-[#333741] hover:border-[#AE94FF] hover:bg-[#AE94FF] hover:bg-opacity-5"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="space-y-4">
                {file ? (
                  <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto" />
                ) : uploadStatus === 'error' ? (
                  <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto" />
                ) : (
                  <CloudArrowUpIcon className="w-12 h-12 text-[#AE94FF] mx-auto" />
                )}
                
                <div>
                  {file ? (
                    <div>
                      <p className="text-green-400 font-medium">{file.name}</p>
                      <p className="text-[#CECFD2] text-sm">Ready for analysis</p>
                    </div>
                  ) : uploadStatus === 'error' ? (
                    <div>
                      <p className="text-red-400 font-medium">Upload failed</p>
                      <p className="text-[#CECFD2] text-sm">Please try again with a PDF file under 5MB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[#F5F5F6] font-medium">
                        Drag and drop your resume here
                      </p>
                      <p className="text-[#CECFD2] text-sm">
                        or <span className="text-[#AE94FF] underline">browse files</span>
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-[#CECFD2] space-y-1">
                  <p>• PDF format only</p>
                  <p>• Maximum file size: 5MB</p>
                  <p>• Your file will be deleted after analysis</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={nextStep}
              disabled={!file}
              className={cn(
                "w-full py-3 px-4 rounded-lg font-medium transition-all duration-200",
                file
                  ? "bg-[#AE94FF] text-white hover:bg-opacity-90"
                  : "bg-[#333741] text-[#CECFD2] cursor-not-allowed"
              )}
            >
              Continue to Preferences
            </button>
          </div>
        )}

        {/* Step 2: Analysis Preferences */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LabelInputContainer>
                <EnhancedLabel htmlFor="targetRole">Target Role (Optional)</EnhancedLabel>
                <select
                  id="targetRole"
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleInputChange}
                  className="shadow-input flex h-10 w-full rounded-md border-none bg-gray-50 px-3 py-2 text-sm text-black transition duration-400 focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600"
                >
                  <option value="">Select a role</option>
                  <option value="software-engineer">Software Engineer</option>
                  <option value="data-scientist">Data Scientist</option>
                  <option value="product-manager">Product Manager</option>
                  <option value="designer">UI/UX Designer</option>
                  <option value="marketing">Marketing Specialist</option>
                  <option value="sales">Sales Representative</option>
                  <option value="other">Other</option>
                </select>
              </LabelInputContainer>

              <LabelInputContainer>
                <EnhancedLabel htmlFor="experienceLevel">Experience Level</EnhancedLabel>
                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                  className="shadow-input flex h-10 w-full rounded-md border-none bg-gray-50 px-3 py-2 text-sm text-black transition duration-400 focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600"
                >
                  <option value="">Select level</option>
                  <option value="entry">Entry Level (0-2 years)</option>
                  <option value="mid">Mid Level (3-5 years)</option>
                  <option value="senior">Senior Level (6+ years)</option>
                </select>
              </LabelInputContainer>
            </div>

            <div>
              <EnhancedLabel className="mb-3 block">Focus Areas (Optional)</EnhancedLabel>
              <div className="grid grid-cols-2 gap-2">
                {focusAreaOptions.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => handleFocusAreaChange(area)}
                    className={cn(
                      "p-2 text-sm rounded-lg border transition-all duration-200",
                      formData.focusAreas.includes(area)
                        ? "bg-[#AE94FF] bg-opacity-20 border-[#AE94FF] text-[#AE94FF]"
                        : "border-[#333741] text-[#CECFD2] hover:border-[#AE94FF] hover:text-[#AE94FF]"
                    )}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 py-3 px-4 rounded-lg border border-[#333741] text-[#CECFD2] hover:border-[#AE94FF] hover:text-[#AE94FF] transition-all duration-200"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 py-3 px-4 rounded-lg bg-[#AE94FF] text-white hover:bg-opacity-90 transition-all duration-200"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Contact Information */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Autofill indicator */}
            {userDetails && (userDetails.firstName || userDetails.lastName || userDetails.email) && (
              <div className="bg-[#AE94FF] bg-opacity-10 border border-[#AE94FF] rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-[#AE94FF] flex-shrink-0" />
                  <p className="text-[#AE94FF] text-sm">
                    Some fields have been pre-filled from your account. You can modify them as needed.
                  </p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LabelInputContainer>
                <EnhancedLabel htmlFor="firstName">First Name *</EnhancedLabel>
                <EnhancedInput 
                  id="firstName" 
                  name="firstName"
                  placeholder="John" 
                  type="text" 
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  autoComplete="given-name"
                />
              </LabelInputContainer>
              <LabelInputContainer>
                <EnhancedLabel htmlFor="lastName">Last Name *</EnhancedLabel>
                <EnhancedInput 
                  id="lastName" 
                  name="lastName"
                  placeholder="Doe" 
                  type="text" 
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  autoComplete="family-name"
                />
              </LabelInputContainer>
            </div>

            <LabelInputContainer>
              <EnhancedLabel htmlFor="email">Email Address *</EnhancedLabel>
              <EnhancedInput 
                id="email" 
                name="email"
                placeholder="john.doe@example.com" 
                type="email" 
                required
                value={formData.email}
                onChange={handleInputChange}
                autoComplete="email"
              />
            </LabelInputContainer>

            <LabelInputContainer>
              <EnhancedLabel htmlFor="phone">Phone Number *</EnhancedLabel>
              <EnhancedInput 
                id="phone" 
                name="phone"
                placeholder="+1 (555) 123-4567" 
                type="tel" 
                required
                value={formData.phone}
                onChange={handleInputChange}
                autoComplete="tel"
              />
            </LabelInputContainer>

            <div className="bg-[#1a1a1a] border border-[#333741] rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-[#CECFD2] leading-relaxed">
                  <p className="font-medium text-[#F5F5F6] mb-1">Privacy & Security</p>
                  <p>Your resume and personal information are encrypted and automatically deleted after analysis. We never share your data with third parties.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 py-3 px-4 rounded-lg border border-[#333741] text-[#CECFD2] hover:border-[#AE94FF] hover:text-[#AE94FF] transition-all duration-200"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submissionStatus === 'submitting'}
                className={cn(
                  "flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 relative group overflow-hidden flex items-center justify-center gap-2",
                  submissionStatus === 'submitting'
                    ? "bg-[#666] cursor-not-allowed"
                    : "bg-gradient-to-r from-[#AE94FF] to-[#7030ca] text-white hover:from-[#9d7fff] hover:to-[#5f1fb8]"
                )}
              >
                {submissionStatus === 'submitting' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </>
                ) : (
                  'Start Analysis'
                )}
                {submissionStatus !== 'submitting' && <BottomGradient />}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Submission Status Display */}
      {submissionStatus !== 'idle' && (
        <div className={cn(
          "mt-6 p-4 rounded-lg border flex items-center gap-3",
          submissionStatus === 'success' 
            ? "bg-green-900 bg-opacity-20 border-green-500 text-green-400"
            : submissionStatus === 'error'
            ? "bg-red-900 bg-opacity-20 border-red-500 text-red-400" 
            : "bg-[#AE94FF] bg-opacity-20 border-[#AE94FF] text-[#AE94FF]"
        )}>
          {submissionStatus === 'submitting' && (
            <div className="w-5 h-5 border-2 border-[#AE94FF] border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
          )}
          {submissionStatus === 'success' && (
            <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
          )}
          {submissionStatus === 'error' && (
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
          )}
          <p className="text-sm">{submissionMessage}</p>
        </div>
      )}
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-[#AE94FF] to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-[#7030ca] to-transparent opacity-0 blur-sm transition duration-500 group-hover:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};