// components/completeProfile/editProfile.tsx
"use client";
import React, { useState, useEffect } from 'react';
import ProfileForm from './profileForm/profileForm';
import PreferenceForm from './preferenceForm';
import UploadCv from './uploadCv';
import PlatformCredentials from './PlatformCredentials';
import { auth, getUserProfile } from '@/lib/firebaseConfig/firebaseConfig';
import { UserDetails } from '@/lib/types';

interface Tab {
  id: string;
  label: string;
  icon: string;
}

const EditProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails>({} as UserDetails);
  const [loading, setLoading] = useState(true);

  const tabs: Tab[] = [
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: '👤'
    },
    { 
      id: 'credentials', 
      label: 'Job Portal Credentials', 
      icon: '🔐'
    },
    { 
      id: 'preferences', 
      label: 'Preferences', 
      icon: '⚙️'
    },
    { 
      id: 'documents', 
      label: 'Documents', 
      icon: '📄'
    }
  ];

  useEffect(() => {
    const fetchUserDetails = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const details = await getUserProfile(user.uid);
          setUserDetails(details || {});
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
      setLoading(false);
    };

    fetchUserDetails();
  }, []);

  const refreshUserDetails = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const details = await getUserProfile(user.uid);
        setUserDetails(details || {});
      } catch (error) {
        console.error('Error refreshing user details:', error);
      }
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Profile Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {isEditing ? 'View Mode' : 'Edit Mode'}
              </button>
            </div>
            <ProfileForm isEditing={isEditing} userDetails={userDetails} />
          </div>
        );

      case 'credentials':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Job Portal Credentials</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {isEditing ? 'View Mode' : 'Edit Mode'}
              </button>
            </div>
            <PlatformCredentials 
              isEditing={isEditing} 
              userDetails={userDetails} 
              onRefresh={refreshUserDetails}
            />
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Job Preferences</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {isEditing ? 'View Mode' : 'Edit Mode'}
              </button>
            </div>
            <PreferenceForm isEditing={isEditing} userDetails={userDetails} />
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Documents</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {isEditing ? 'Upload Mode' : 'View Mode'}
              </button>
            </div>
            <UploadCv isEditing={isEditing} userDetails={userDetails} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-white">Complete Your Profile</h1>
        <p className="text-gray-400">Manage your profile information and job portal credentials</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-700 mb-8">
        <div className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 pb-4 px-1 border-b-2 transition-colors whitespace-nowrap ${
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
        {renderTabContent()}
      </div>
    </div>
  );
};

export default EditProfile;
