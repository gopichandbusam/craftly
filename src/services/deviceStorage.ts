// Device storage service with 1-week expiration
interface StoredData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class DeviceStorage {
  private static readonly ONE_WEEK = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
  
  /**
   * Store data with 1-week expiration
   */
  static store<T>(key: string, data: T): void {
    try {
      const now = Date.now();
      const storedData: StoredData<T> = {
        data,
        timestamp: now,
        expiresAt: now + this.ONE_WEEK
      };
      
      localStorage.setItem(key, JSON.stringify(storedData));
      console.log(`📱 Data stored locally for 1 week: ${key}`);
    } catch (error) {
      console.warn('📱 Failed to store data locally:', error);
    }
  }
  
  /**
   * Retrieve data if not expired
   */
  static retrieve<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) {
        return null;
      }
      
      const storedData: StoredData<T> = JSON.parse(stored);
      const now = Date.now();
      
      // Check if data has expired
      if (now > storedData.expiresAt) {
        console.log(`📱 Data expired, removing: ${key}`);
        localStorage.removeItem(key);
        return null;
      }
      
      console.log(`📱 Data retrieved from local storage: ${key}`);
      return storedData.data;
    } catch (error) {
      console.warn('📱 Failed to retrieve data locally:', error);
      return null;
    }
  }
  
  /**
   * Check if data exists and is not expired
   */
  static exists(key: string): boolean {
    const data = this.retrieve(key);
    return data !== null;
  }
  
  /**
   * Get remaining time for stored data
   */
  static getRemainingTime(key: string): number {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) {
        return 0;
      }
      
      const storedData: StoredData<any> = JSON.parse(stored);
      const now = Date.now();
      
      return Math.max(0, storedData.expiresAt - now);
    } catch (error) {
      return 0;
    }
  }
  
  /**
   * Get storage info for debugging
   */
  static getStorageInfo(key: string): { 
    exists: boolean; 
    size: number; 
    age: number; 
    remaining: number;
    expirationDate: Date | null;
  } {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) {
        return { exists: false, size: 0, age: 0, remaining: 0, expirationDate: null };
      }
      
      const storedData: StoredData<any> = JSON.parse(stored);
      const now = Date.now();
      
      return {
        exists: true,
        size: new Blob([stored]).size,
        age: now - storedData.timestamp,
        remaining: Math.max(0, storedData.expiresAt - now),
        expirationDate: new Date(storedData.expiresAt)
      };
    } catch (error) {
      return { exists: false, size: 0, age: 0, remaining: 0, expirationDate: null };
    }
  }
  
  /**
   * Clean up expired data
   */
  static cleanupExpired(): void {
    console.log('📱 Starting cleanup of expired data...');
    const keysToRemove: string[] = [];
    
    // Check all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      try {
        const stored = localStorage.getItem(key);
        if (!stored) continue;
        
        const storedData: StoredData<any> = JSON.parse(stored);
        const now = Date.now();
        
        // Check if this looks like our stored data format and is expired
        if (storedData.expiresAt && now > storedData.expiresAt) {
          keysToRemove.push(key);
        }
      } catch (error) {
        // Not our data format, skip
        continue;
      }
    }
    
    // Remove expired items
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`📱 Removed expired data: ${key}`);
    });
    
    console.log(`📱 Cleanup complete. Removed ${keysToRemove.length} expired items.`);
  }
  
  /**
   * Get total storage usage
   */
  static getStorageUsage(): { 
    totalSize: number; 
    itemCount: number; 
    craftlyItems: number;
    craftlySize: number;
  } {
    let totalSize = 0;
    let itemCount = 0;
    let craftlyItems = 0;
    let craftlySize = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      const value = localStorage.getItem(key);
      if (!value) continue;
      
      const size = new Blob([value]).size;
      totalSize += size;
      itemCount++;
      
      if (key.startsWith('craftly_')) {
        craftlyItems++;
        craftlySize += size;
      }
    }
    
    return { totalSize, itemCount, craftlyItems, craftlySize };
  }
  
  /**
   * Clear all Craftly data
   */
  static clearAllCraftlyData(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('craftly_'));
    keys.forEach(key => localStorage.removeItem(key));
    console.log(`📱 Cleared ${keys.length} Craftly items from local storage`);
  }
}

// Storage keys for the application
export const STORAGE_KEYS = {
  RESUME: 'craftly_resume_v2',
  APPLICATION: 'craftly_application_v2',
  USER_PREFERENCES: 'craftly_preferences_v2',
  SESSION_DATA: 'craftly_session_v2'
} as const;

// Auto-cleanup on app start
if (typeof window !== 'undefined') {
  // Run cleanup on app start
  DeviceStorage.cleanupExpired();
  
  // Schedule periodic cleanup (every hour)
  setInterval(() => {
    DeviceStorage.cleanupExpired();
  }, 60 * 60 * 1000); // 1 hour
}