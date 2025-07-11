// components/completeProfile/editProfile.tsx
"use client";
import React, { useState } from 'react';
import PlatformCredentials from './PlatformCredentials';
import BasicInfo from './BasicInfo'; // You'll need to create this
import Preferences from './Preferences'; // You'll need to create this

interface Tab {
  id: string;
  label: string;
  icon: string;
  component: React.ReactNode;
}

const EditProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('basic-info');

  const tabs: Tab[] = [
    { 
      id: 'basic-info', 
      label: 'Basic Info', 
      icon: '👤',
      component: <BasicInfo />
    },
    { 
      id: 'platform-credentials', 
      label: 'Platform Credentials', 
      icon: '🔐',
      component: <PlatformCredentials />
    },
    { 
      id: 'preferences', 
      label: 'Preferences', 
      icon: '⚙️',
      component: <Preferences />
    }
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">Complete Your Profile</h1>
        <p className="text-gray-400">Manage your job portal credentials and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-700 mb-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 pb-4 px-1 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {currentTab?.component}
      </div>
    </div>
  );
};

export default EditProfile;
