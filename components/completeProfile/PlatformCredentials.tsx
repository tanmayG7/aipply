// components/completeProfile/PlatformCredentials.tsx
"use client";
import React, { useState } from 'react';
import { Eye, EyeOff, Save, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PlatformCredential {
  email: string;
  password: string;
  status: 'not_connected' | 'connected' | 'failed' | 'testing';
}

interface Credentials {
  naukri: PlatformCredential;
  hirist: PlatformCredential;
  shine: PlatformCredential;
  timesjobs: PlatformCredential;
}

const PlatformCredentials: React.FC = () => {
  const [showPasswords, setShowPasswords] = useState({
    naukri: false,
    hirist: false,
    shine: false,
    timesjobs: false
  });
  
  const [credentials, setCredentials] = useState<Credentials>({
    naukri: { email: '', password: '', status: 'not_connected' },
    hirist: { email: '', password: '', status: 'not_connected' },
    shine: { email: '', password: '', status: 'not_connected' },
    timesjobs: { email: '', password: '', status: 'not_connected' }
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const platforms = [
    { 
      id: 'naukri' as keyof Credentials, 
      name: 'Naukri.com', 
      color: 'bg-blue-600', 
      icon: '🔍',
      description: 'India\'s leading job portal'
    },
    { 
      id: 'hirist' as keyof Credentials, 
      name: 'Hirist.com', 
      color: 'bg-purple-600', 
      icon: '💼',
      description: 'Tech jobs and IT careers'
    },
    { 
      id: 'shine' as keyof Credentials, 
      name: 'Shine.com', 
      color: 'bg-orange-600', 
      icon: '✨',
      description: 'Career opportunities and jobs'
    },
    { 
      id: 'timesjobs' as keyof Credentials, 
      name: 'TimesJobs.com', 
      color: 'bg-red-600', 
      icon: '📰',
      description: 'Times Group job portal'
    }
  ];

  const togglePasswordVisibility = (platform: keyof Credentials) => {
    setShowPasswords(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const handleCredentialChange = (platform: keyof Credentials, field: keyof PlatformCredential, value: string) => {
    if (field === 'status') return; // Don't allow direct status changes
    
    setCredentials(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // TODO: Implement API call to save credentials
      // const response = await saveCredentials(credentials);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving credentials:', error);
      setSaveStatus('idle');
    }
  };

  const testConnection = async (platform: keyof Credentials) => {
    setCredentials(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        status: 'testing'
      }
    }));
    
    try {
      // TODO: Implement actual connection test
      // const isConnected = await testPlatformConnection(platform, credentials[platform]);
      
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      setCredentials(prev => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          status: success ? 'connected' : 'failed'
        }
      }));
    } catch (error) {
      setCredentials(prev => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          status: 'failed'
        }
      }));
    }
  };

  const getStatusColor = (status: PlatformCredential['status']) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'testing': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: PlatformCredential['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'testing': return <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />;
      default: return <div className="w-4 h-4 border-2 border-gray-400 rounded-full" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold">Platform Credentials</h2>
        </div>
        <p className="text-gray-400 mb-4">
          Securely store your job portal credentials to enable automatic profile updates and job applications.
        </p>
        <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-blue-400">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Security Note</span>
          </div>
          <p className="text-sm text-blue-300 mt-1">
            All credentials are encrypted and stored securely. We never store passwords in plain text.
          </p>
        </div>
      </div>

      {/* Platform Cards */}
      <div className="grid gap-6">
        {platforms.map((platform) => (
          <div key={platform.id} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${platform.color} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
                  {platform.icon}
                </div>
                <div>
                  <h3 className="font-semibold">{platform.name}</h3>
                  <p className="text-sm text-gray-400">{platform.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(credentials[platform.id].status)}
                <span className={`text-sm capitalize ${getStatusColor(credentials[platform.id].status)}`}>
                  {credentials[platform.id].status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Email/Username Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email/Username
                </label>
                <input
                  type="email"
                  value={credentials[platform.id].email}
                  onChange={(e) => handleCredentialChange(platform.id, 'email', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="Enter your email or username"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords[platform.id] ? 'text' : 'password'}
                    value={credentials[platform.id].password}
                    onChange={(e) => handleCredentialChange(platform.id, 'password', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 pr-10"
                    placeholder="Enter your password"
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

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => testConnection(platform.id)}
                disabled={!credentials[platform.id].email || !credentials[platform.id].password || credentials[platform.id].status === 'testing'}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>Test Connection</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium flex items-center space-x-2 transition-colors"
        >
          {saveStatus === 'saving' ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : saveStatus === 'saved' ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Credentials</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PlatformCredentials;
