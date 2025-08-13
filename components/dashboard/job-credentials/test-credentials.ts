// Test script for job credentials functionality
import { PlatformCredentialsData, PlatformCredential } from '@/lib/types';

// Mock test data
const mockCredentials: PlatformCredentialsData = {
  foundit: {
    email: 'user@example.com',
    password: 'encrypted_password',
    isActive: true,
    createdAt: '2025-01-13T00:00:00Z',
    updatedAt: '2025-01-13T00:00:00Z'
  },
  hirist: {
    email: 'user@hirist.com',
    password: 'encrypted_password_2',
    isActive: true,
    createdAt: '2025-01-13T00:00:00Z',
    updatedAt: '2025-01-13T00:00:00Z'
  },
  shine: {
    email: 'user@shine.com',
    password: 'encrypted_password_3',
    isActive: false,
    createdAt: '2025-01-13T00:00:00Z',
    updatedAt: '2025-01-13T00:00:00Z'
  },
  timesjob: {
    email: 'user@timesjobs.com',
    password: 'encrypted_password_4',
    isActive: true,
    createdAt: '2025-01-13T00:00:00Z',
    updatedAt: '2025-01-13T00:00:00Z',
    lastUsed: '2025-01-12T15:30:00Z'
  }
};

export function testJobCredentialsTypes() {
  console.log('Testing job credentials types...');
  
  // Test platform credential structure
  const testCredential: PlatformCredential = {
    email: 'test@example.com',
    password: 'test_password',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  console.log('✅ PlatformCredential type valid');
  
  // Test credentials data structure
  const testCredentialsData: PlatformCredentialsData = {
    foundit: testCredential,
    hirist: testCredential,
    shine: testCredential,
    timesjob: testCredential
  };
  
  console.log('✅ PlatformCredentialsData type valid');
  
  // Test partial credentials (optional platforms)
  const partialCredentials: PlatformCredentialsData = {
    foundit: testCredential
  };
  
  console.log('✅ Partial credentials valid');
  
  // Test active credentials filtering
  const activeCredentials = Object.entries(mockCredentials)
    .filter(([_, credential]) => credential?.isActive)
    .map(([platform]) => platform);
  
  console.log('✅ Active credentials filtering works:', activeCredentials);
  
  return {
    success: true,
    testCredential,
    testCredentialsData,
    partialCredentials,
    activeCredentials
  };
}

// Export mock data for testing
export { mockCredentials };