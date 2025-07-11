// components/completeProfile/PlatformCredentials.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Save, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { auth, saveUserProfile } from '@/lib/firebaseConfig/firebaseConfig';
import { UserDetails, PlatformCredentialsData } from '@/lib/types';

interface PlatformCredentialsProps {
  isEditing: boolean;
  userDetails: UserDetails;
  onRefresh?: () => Promise<void>;
}

const PlatformCredentials: React.FC<PlatformCredentialsProps> = ({
  isEditing,
  userDetails,
  onRefresh
}) => {
  const [showPasswords, setShowPasswords] = useState({
    naukri: false,
    hirist: false,
    shine: false,
    timesjobs: false
  });
  
  const [credentials, setCredentials] = useState<PlatformCredentialsData>({
    naukri: { email: '', password: '' },
    hirist: { email: '', password: '' },
    shine: { email: '', password: '' },
    timesjobs: { email: '', password: '' }
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Load existing credentials
  useEffect(() => {
    if (userDetails.platformCredentials) {
      setCredentials({
        naukri: {
          email: userDetails.platformCredentials.naukri?.email || '',
          password: userDetails.platformCredentials.naukri?.password || ''
        },
        hirist: {
          email: userDetails.platformCredentials.hirist?.email || '',
          password: userDetails.platformCredentials.hirist?.password || ''
        },
        shine: {
          email: userDetails.platformCredentials.shine?.email || '',
          password: userDetails.platformCredentials.shine?.password || ''
        },
        timesjobs: {
          email: userDetails.platformCredentials.timesjobs?.email || '',
          password: userDetails.platformCredentials.timesjobs?.password || ''
        }
      });
    }
  }, [userDetails]);

  const platforms = [
    { 
      id: 'naukri' as keyof PlatformCredentialsData, 
      name: 'Naukri.com', 
      color: 'bg-blue-600', 
      icon: '🔍',
      description: 'India\'s leading job portal'
    },
    { 
      id: 'hirist' as keyof PlatformCredentialsData, 
      name: 'Hirist.com', 
      color: 'bg-purple-600', 
      icon: '💼',
      description: 'Tech jobs and IT careers'
    },
    { 
      id: 'shine' as keyof PlatformCredentialsData, 
      name: 'Shine.com', 
      color: 'bg-orange-600', 
      icon: '✨',
      description: 'Career opportunities and jobs'
    },
    { 
      id: 'timesjobs' as keyof PlatformCredentialsData, 
      name: 'TimesJobs.com', 
      color: 'bg-red-600', 
      icon: '📰',
      description: 'Times Group job portal'
    }
  ];

  const togglePasswordVisibility = (platform: keyof PlatformCredentialsData) => {
    setShowPasswords(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const handleCredentialChange = (platform: keyof PlatformCredentialsData, field: 'email' | 'password', value: string) => {
    setCredentials(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform]!,
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    console.log('Saving credentials:', credentials);
    try {
      const user = auth.currentUser;
      console.log('Current user:', user?.uid);
      if (user) {
        await saveUserProfile(user.uid, { 
          platformCredentials: credentials 
        });
        console.log('Save successful!');
        
        // Refresh user details in parent component
        if (onRefresh) {
          await onRefresh();
        }
        
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
      setSaveStatus('idle');
    }
  };

  return (
    <div className="py-6 border border-gray rounded-xl">
      <div className="grid grid-cols-7 gap-[52px] max-w-[100%] py-6 border-b border-gray rounded-none">
        <div className="col-span-2">
          <h3 className="text-[16px] font-inter font-semibold text-white mb-4">Platform Credentials</h3>
          <p className="font-inter text-[14px] leading-[20px] text-gray-400">
            Store your job portal login credentials for easy access.
          </p>
        </div>
        <div className="col-span-5">
          {/* Security Note */}
          <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-blue-400">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Security Note</span>
            </div>
            <p className="text-sm text-blue-300 mt-1">
              Your credentials are stored securely in your profile.
            </p>
          </div>
          
          {/* Platform Cards */}
          <div className="grid gap-6">
            {platforms.map((platform) => (
              <div key={platform.id} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
                    {platform.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{platform.name}</h3>
                    <p className="text-sm text-gray-400">{platform.description}</p>
                  </div>
                </div>

                {isEditing ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Email/Username Field */}
                    <div>
                      <Label className="block text-sm font-medium text-gray-300 mb-2">
                        Email/Username
                      </Label>
                      <Input
                        type="email"
                        value={credentials[platform.id]?.email || ''}
                        onChange={(e) => handleCredentialChange(platform.id, 'email', e.target.value)}
                        placeholder="Enter your email or username"
                        required
                      />
                    </div>

                    {/* Password Field */}
                    <div>
                      <Label className="block text-sm font-medium text-gray-300 mb-2">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          type={showPasswords[platform.id] ? 'text' : 'password'}
                          value={credentials[platform.id]?.password || ''}
                          onChange={(e) => handleCredentialChange(platform.id, 'password', e.target.value)}
                          placeholder="Enter your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(platform.id)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPasswords[platform.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {credentials[platform.id]?.email ? (
                      <>
                        <p className="text-gray-300">
                          <span className="font-medium">Email:</span> {credentials[platform.id]?.email}
                        </p>
                        <p className="text-gray-300">
                          <span className="font-medium">Password:</span> {'•'.repeat(8)}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-500 italic">No credentials saved</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Save Button */}
          {isEditing && (
            <div className="flex justify-end mt-6">
              <Button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white"
              >
                {saveStatus === 'saving' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : saveStatus === 'saved' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Credentials
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformCredentials;
