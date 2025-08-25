// components/completeProfile/editProfile.tsx
"use client";
import React, { useState, useEffect } from 'react';
import ProfileForm from './profileForm/profileForm';
import PreferenceForm from './preferenceForm';
import UploadCv from './uploadCv';
import PlatformCredentials from './PlatformCredentials';
import { auth, getUserProfile } from '@/lib/firebaseConfig/firebaseConfig';
import { UserDetails } from '@/lib/types';
import { Icon } from '@/components/ui/Icon';

interface Tab {
  id: string;
  label: string;
  iconName: string;
}

const EditProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [editingStates, setEditingStates] = useState({
    profile: false,
    credentials: false,
    preferences: false,
    documents: false
  });
  const [userDetails, setUserDetails] = useState<UserDetails>({} as UserDetails);
  const [loading, setLoading] = useState(true);

  const tabs: Tab[] = [
    { 
      id: 'profile', 
      label: 'Profile', 
      iconName: 'user-round' as const
    },
    { 
      id: 'credentials', 
      label: 'Job Portal Credentials', 
      iconName: 'lock' as const
    },
    { 
      id: 'preferences', 
      label: 'Preferences', 
      iconName: 'settings' as const
    },
    { 
      id: 'documents', 
      label: 'Resume', 
      iconName: 'file-text' as const
    }
  ];

  const toggleEditing = (tab: string) => {
    setEditingStates(prev => ({
      ...prev,
      [tab]: !prev[tab as keyof typeof prev]
    }));
  };

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
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Profile Information</h2>
              <button
                onClick={() => toggleEditing('profile')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors h-11 w-full sm:w-auto"
              >
                {editingStates.profile ? 'View Mode' : 'Edit Mode'}
              </button>
            </div>
            <ProfileForm isEditing={editingStates.profile} userDetails={userDetails} />
          </>
        );

      case 'credentials':
        return (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Job Portal Credentials</h2>
              <button
                onClick={() => toggleEditing('credentials')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors h-11 w-full sm:w-auto"
              >
                {editingStates.credentials ? 'View Mode' : 'Edit Mode'}
              </button>
            </div>
            <PlatformCredentials 
              isEditing={editingStates.credentials} 
              userDetails={userDetails} 
              onRefresh={refreshUserDetails}
              onExitEditMode={() => toggleEditing('credentials')}
            />
          </>
        );

      case 'preferences':
        return (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Job Preferences</h2>
              <button
                onClick={() => toggleEditing('preferences')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors h-11 w-full sm:w-auto"
              >
                {editingStates.preferences ? 'View Mode' : 'Edit Mode'}
              </button>
            </div>
            <PreferenceForm isEditing={editingStates.preferences} userDetails={userDetails} />
          </>
        );

      case 'documents':
        return (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Resume</h2>
              <button
                onClick={() => toggleEditing('documents')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors h-11 w-full sm:w-auto"
              >
                {editingStates.documents ? 'View Mode' : 'Edit Mode'}
              </button>
            </div>
            <UploadCv isEditing={editingStates.documents} userDetails={userDetails} />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white">Complete Your Profile</h1>
        <p className="text-sm sm:text-base text-gray-400">Manage your profile information and job portal credentials</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-700 mb-6 lg:mb-8">
        <div className="flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 pb-3 sm:pb-4 px-1 border-b-2 transition-colors whitespace-nowrap min-w-fit ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Icon name={tab.iconName} size={18} ariaLabel={tab.label} inline />
              <span className="font-medium text-sm sm:text-base">{tab.label}</span>
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
