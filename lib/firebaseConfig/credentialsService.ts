import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from './firebaseConfig';
import { PlatformCredentialsData } from '../types';

const CREDENTIALS_COLLECTION = 'userCredentials';

// TODO: SECURITY RISK - Replace with proper AES encryption before production
// Base64 encoding is NOT secure and is easily reversible
// This poses a significant security risk for user credentials
// Consider implementing AES-256 encryption with proper key management
const encrypt = (text: string): string => {
  // In a production app, use proper encryption like AES
  // For now, using base64 encoding as placeholder
  return btoa(text);
};

const decrypt = (encryptedText: string): string => {
  try {
    return atob(encryptedText);
  } catch {
    return encryptedText; // Return as-is if decryption fails
  }
};

const encryptCredentials = (credentials: PlatformCredentialsData): PlatformCredentialsData => {
  const encrypted: PlatformCredentialsData = {};
  
  for (const [platform, credential] of Object.entries(credentials)) {
    if (credential) {
      encrypted[platform as keyof PlatformCredentialsData] = {
        ...credential,
        email: encrypt(credential.email),
        password: encrypt(credential.password),
      };
    }
  }
  
  return encrypted;
};

const decryptCredentials = (credentials: PlatformCredentialsData): PlatformCredentialsData => {
  const decrypted: PlatformCredentialsData = {};
  
  for (const [platform, credential] of Object.entries(credentials)) {
    if (credential) {
      decrypted[platform as keyof PlatformCredentialsData] = {
        ...credential,
        email: decrypt(credential.email),
        password: decrypt(credential.password),
      };
    }
  }
  
  return decrypted;
};

export const updateJobCredentials = async (
  userId: string,
  credentials: PlatformCredentialsData
): Promise<void> => {
  try {
    const encryptedCredentials = encryptCredentials(credentials);
    
    const credentialsData = {
      userId,
      credentials: encryptedCredentials,
      updatedAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    await setDoc(
      doc(firestore, CREDENTIALS_COLLECTION, userId),
      credentialsData,
      { merge: true }
    );

    console.log('Job credentials updated successfully');
  } catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error('Error updating job credentials:', error);
    throw new Error(`Failed to update credentials: ${error.message}`);
  }
};

export const getJobCredentials = async (
  userId: string
): Promise<PlatformCredentialsData | null> => {
  try {
    const credentialsDoc = await getDoc(doc(firestore, CREDENTIALS_COLLECTION, userId));
    
    if (credentialsDoc.exists()) {
      const data = credentialsDoc.data();
      if (data?.credentials) {
        return decryptCredentials(data.credentials);
      }
    }
    
    return null;
  } catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error('Error getting job credentials:', error);
    throw new Error(`Failed to get credentials: ${error.message}`);
  }
};

export const deleteJobCredential = async (
  userId: string,
  platform: keyof PlatformCredentialsData
): Promise<void> => {
  try {
    const currentCredentials = await getJobCredentials(userId);
    if (!currentCredentials) {
      return;
    }

    delete currentCredentials[platform];
    await updateJobCredentials(userId, currentCredentials);

    console.log(`Deleted credential for platform: ${platform}`);
  } catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error('Error deleting job credential:', error);
    throw new Error(`Failed to delete credential: ${error.message}`);
  }
};

export const validateCredentials = async (
  userId: string,
  platform: keyof PlatformCredentialsData
): Promise<boolean> => {
  try {
    const credentials = await getJobCredentials(userId);
    const platformCredential = credentials?.[platform];
    
    if (!platformCredential) {
      return false;
    }

    // Basic validation - check if email and password exist
    return !!(platformCredential.email && platformCredential.password);
  } catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error('Error validating credentials:', error);
    return false;
  }
};

export const markCredentialAsUsed = async (
  userId: string,
  platform: keyof PlatformCredentialsData
): Promise<void> => {
  try {
    const credentials = await getJobCredentials(userId);
    if (!credentials?.[platform]) {
      return;
    }

    const updatedCredentials = {
      ...credentials,
      [platform]: {
        ...credentials[platform]!,
        lastUsed: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    await updateJobCredentials(userId, updatedCredentials);
  } catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error('Error marking credential as used:', error);
    // Don't throw error as this is not critical
  }
};

export const getActiveCredentials = async (
  userId: string
): Promise<string[]> => {
  try {
    const credentials = await getJobCredentials(userId);
    if (!credentials) {
      return [];
    }

    return Object.entries(credentials)
      .filter(([_credential, credential]) => credential?.isActive)
      .map(([platform]) => platform);
  } catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error('Error getting active credentials:', error);
    return [];
  }
};