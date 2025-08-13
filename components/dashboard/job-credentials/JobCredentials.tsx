"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Plus, Trash2, Check, X, Shield, Key } from 'lucide-react';
import { PlatformCredentialsData, PlatformCredential, JobPortal } from '@/lib/types';
import { auth } from '@/lib/firebaseConfig/firebaseConfig';
import { updateJobCredentials, getJobCredentials } from '@/lib/firebaseConfig/credentialsService';
import Image from 'next/image';

const JOB_PORTALS: JobPortal[] = [
  {
    id: 'foundit',
    name: 'Foundit',
    logo: '/static/portals/foundit-logo.svg',
    description: 'India\'s leading job portal with millions of job opportunities',
    features: ['Wide job coverage', 'Skill-based matching', 'Company reviews']
  },
  {
    id: 'hirist',
    name: 'Hirist',
    logo: '/static/portals/hirist-logo.svg', 
    description: 'Premier platform for tech professionals and startups',
    features: ['Tech-focused jobs', 'Startup opportunities', 'Remote work options']
  },
  {
    id: 'shine',
    name: 'Shine',
    logo: '/static/portals/shine-logo.svg',
    description: 'Career acceleration platform with personalized job recommendations',
    features: ['AI-powered matching', 'Career guidance', 'Salary insights']
  },
  {
    id: 'timesjob',
    name: 'TimesJobs',
    logo: '/static/portals/timesjobs-logo.svg',
    description: 'Comprehensive job search platform by Times Group',
    features: ['Corporate jobs', 'Executive positions', 'Industry insights']
  }
];

interface CredentialFormData {
  email: string;
  password: string;
}

const JobCredentials: React.FC = () => {
  const [credentials, setCredentials] = useState<PlatformCredentialsData>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [editingPortal, setEditingPortal] = useState<string | null>(null);
  const [formData, setFormData] = useState<CredentialFormData>({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (user) {
        const userCredentials = await getJobCredentials(user.uid);
        setCredentials(userCredentials || {});
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCredential = async (portalId: string) => {
    if (!formData.email || !formData.password) {
      return;
    }

    try {
      setSaving(portalId);
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const currentTime = new Date().toISOString();
      const newCredential: PlatformCredential = {
        email: formData.email,
        password: formData.password,
        isActive: true,
        createdAt: currentTime,
        updatedAt: currentTime,
      };

      const updatedCredentials = {
        ...credentials,
        [portalId]: newCredential
      };

      await updateJobCredentials(user.uid, updatedCredentials);
      setCredentials(updatedCredentials);
      setEditingPortal(null);
      setFormData({ email: '', password: '' });
    } catch (error) {
      console.error('Error saving credential:', error);
    } finally {
      setSaving(null);
    }
  };

  const handleDeleteCredential = async (portalId: string) => {
    try {
      setSaving(portalId);
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const updatedCredentials = { ...credentials };
      delete updatedCredentials[portalId as keyof PlatformCredentialsData];

      await updateJobCredentials(user.uid, updatedCredentials);
      setCredentials(updatedCredentials);
    } catch (error) {
      console.error('Error deleting credential:', error);
    } finally {
      setSaving(null);
    }
  };

  const togglePasswordVisibility = (portalId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [portalId]: !prev[portalId]
    }));
  };

  const startEditing = (portalId: string) => {
    const credential = credentials[portalId as keyof PlatformCredentialsData];
    setFormData({
      email: credential?.email || '',
      password: credential?.password || ''
    });
    setEditingPortal(portalId);
  };

  const cancelEditing = () => {
    setEditingPortal(null);
    setFormData({ email: '', password: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-blue-500" />
        <h2 className="text-2xl font-bold text-white">Job Portal Credentials</h2>
      </div>
      
      <p className="text-gray-300 mb-6">
        Securely store your job portal credentials to enable automated job applications. 
        Your credentials are encrypted and stored safely.
      </p>

      <div className="grid gap-4">
        {JOB_PORTALS.map((portal) => {
          const credential = credentials[portal.id as keyof PlatformCredentialsData];
          const isEditing = editingPortal === portal.id;
          const isSaving = saving === portal.id;

          return (
            <Card key={portal.id} className="bg-[#1A1B23] border-gray-700">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-2">
                      <Key className="h-5 w-5 text-gray-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{portal.name}</h3>
                      <p className="text-sm text-gray-400">{portal.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {credential?.isActive && (
                      <div className="flex items-center gap-1 text-green-500 text-sm">
                        <Check className="h-4 w-4" />
                        Active
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email"
                        className="bg-[#2A2B35] border-gray-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Input
                          type={showPasswords[portal.id] ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter your password"
                          className="bg-[#2A2B35] border-gray-600 text-white pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(portal.id)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPasswords[portal.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSaveCredential(portal.id)}
                        disabled={!formData.email || !formData.password || isSaving}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        onClick={cancelEditing}
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {credential ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-sm text-gray-300">
                          <span>Email: {credential.email}</span>
                          <span>•</span>
                          <span>Last updated: {new Date(credential.updatedAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => startEditing(portal.id)}
                            variant="outline"
                            size="sm"
                            className="border-blue-600 text-blue-500 hover:bg-blue-600 hover:text-white"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteCredential(portal.id)}
                            variant="outline"
                            size="sm"
                            disabled={isSaving}
                            className="border-red-600 text-red-500 hover:bg-red-600 hover:text-white"
                          >
                            {isSaving ? 'Deleting...' : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>

                        <div className="bg-[#2A2B35] p-3 rounded-lg">
                          <p className="text-xs text-gray-400 mb-2">Features:</p>
                          <div className="flex flex-wrap gap-2">
                            {portal.features.map((feature, index) => (
                              <span
                                key={index}
                                className="bg-blue-600/20 text-blue-400 text-xs px-2 py-1 rounded-full"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-400 mb-4">No credentials stored for {portal.name}</p>
                        <Button
                          onClick={() => startEditing(portal.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Credentials
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-amber-600/20 border border-amber-600/50 rounded-lg p-4 mt-6">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <h4 className="text-amber-500 font-medium mb-2">Security Notice</h4>
            <p className="text-amber-200 text-sm">
              Your credentials are encrypted and stored securely. We recommend using strong, unique passwords 
              for each platform. Never share your credentials with others.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCredentials;