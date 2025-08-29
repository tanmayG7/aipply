// lib/security/encryptionUtils.ts
import CryptoJS from 'crypto-js';

interface EncryptedData {
  encryptedPassword: string;
  iv: string;
  salt: string;
}

interface DecryptedData {
  password: string;
}

export class PasswordEncryption {
  private static readonly ENCRYPTION_KEY = "b2597c13754eb72c90ad4a093f65f7cf35746ef543785afa32b827011c066fa9";
  
  /**
   * Encrypt a password for secure storage
   */
  static encryptPassword(password: string, userSalt?: string): EncryptedData {
    try {
      // Generate a unique salt for this user if not provided
      const salt = userSalt || CryptoJS.lib.WordArray.random(128/8).toString();
      
      // Create a key using PBKDF2 with the salt
      const key = CryptoJS.PBKDF2(PasswordEncryption.ENCRYPTION_KEY, salt, {
        keySize: 256/32,
        iterations: 10000
      });
      
      // Generate a random IV for this encryption
      const iv = CryptoJS.lib.WordArray.random(128/8);
      
      // Encrypt the password
      const encrypted = CryptoJS.AES.encrypt(password, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      return {
        encryptedPassword: encrypted.toString(),
        iv: iv.toString(),
        salt: salt
      };
    } catch (error) {
      console.error('Error encrypting password:', error);
      throw new Error('Failed to encrypt password');
    }
  }
 
  /**
   * Decrypt a password for use
   */
  static decryptPassword(encryptedData: EncryptedData): DecryptedData {
    try {
      const { encryptedPassword, iv, salt } = encryptedData;
      
      // Recreate the key using the same salt
      const key = CryptoJS.PBKDF2(PasswordEncryption.ENCRYPTION_KEY, salt, {
        keySize: 256/32,
        iterations: 10000
      });
      
      // Decrypt the password
      const decrypted = CryptoJS.AES.decrypt(encryptedPassword, key, {
        iv: CryptoJS.enc.Hex.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      const password = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!password) {
        throw new Error('Failed to decrypt password - invalid key or corrupted data');
      }
      
      return { password };
    } catch (error) {
      console.error('Error decrypting password:', error);
      throw new Error('Failed to decrypt password');
    }
  }
  
  /**
   * Encrypt multiple platform credentials
   */
  static encryptPlatformCredentials(credentials: Record<string, { email: string; password: string }>, userSalt?: string): Record<string, any> {
    const encryptedCredentials: Record<string, any> = {};
    const salt = userSalt || CryptoJS.lib.WordArray.random(128/8).toString();
    
    Object.entries(credentials).forEach(([platform, creds]) => {
      if (creds.email && creds.password) {
        const encryptedPassword = PasswordEncryption.encryptPassword(creds.password, salt);
        encryptedCredentials[platform] = {
          email: creds.email, // Email stays unencrypted for easier access
          encryptedPassword: encryptedPassword.encryptedPassword,
          iv: encryptedPassword.iv,
          salt: encryptedPassword.salt
        };
      }
    });
    
    return encryptedCredentials;
  }

  /**
   * Decrypt multiple platform credentials
   */
  static decryptPlatformCredentials(encryptedCredentials: Record<string, any>): Record<string, { email: string; password: string }> {
    const decryptedCredentials: Record<string, { email: string; password: string }> = {};
    
    Object.entries(encryptedCredentials).forEach(([platform, creds]) => {
      if (creds.email && creds.encryptedPassword && creds.iv && creds.salt) {
        try {
          const decryptedPassword = PasswordEncryption.decryptPassword({
            encryptedPassword: creds.encryptedPassword,
            iv: creds.iv,
            salt: creds.salt
          });
          
          decryptedCredentials[platform] = {
            email: creds.email,
            password: decryptedPassword.password
          };
        } catch (error) {
          console.error(`Failed to decrypt password for platform ${platform}:`, error);
          // Skip this platform if decryption fails
        }
      }
    });
    
    return decryptedCredentials;
  }
  
  /**
   * Generate a secure user-specific salt
   */
  static generateUserSalt(userId: string): string {
    // Create a deterministic but secure salt based on user ID
    const userSeed = CryptoJS.SHA256(userId + PasswordEncryption.ENCRYPTION_KEY).toString();
    return userSeed.substring(0, 32); // Use first 32 characters as salt
  }
  
  /**
   * Validate if encrypted data structure is correct
   */
  static isValidEncryptedData(data: any): data is EncryptedData {
    return (
      data &&
      typeof data.encryptedPassword === 'string' &&
      typeof data.iv === 'string' &&
      typeof data.salt === 'string'
    );
  }
  
  /**
   * Check if credentials are already encrypted
   */
  static areCredentialsEncrypted(credentials: any): boolean {
    if (!credentials || typeof credentials !== 'object') return false;
    
    // Check if any platform has encrypted structure
    return Object.values(credentials).some((creds: any) => 
      creds && 
      typeof creds === 'object' && 
      'encryptedPassword' in creds && 
      'iv' in creds && 
      'salt' in creds
    );
  }
}

// Export helper functions for easy use
export const encryptPassword = PasswordEncryption.encryptPassword;
export const decryptPassword = PasswordEncryption.decryptPassword;
export const encryptPlatformCredentials = PasswordEncryption.encryptPlatformCredentials;
export const decryptPlatformCredentials = PasswordEncryption.decryptPlatformCredentials;
export const generateUserSalt = PasswordEncryption.generateUserSalt;
export const areCredentialsEncrypted = PasswordEncryption.areCredentialsEncrypted;