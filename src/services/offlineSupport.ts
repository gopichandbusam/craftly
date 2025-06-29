// Service Worker and offline support

export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered:', registration);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content is available
                showUpdateAvailable();
              }
            }
          });
        }
      });
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  }
};

export const unregisterServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      console.log('✅ Service Worker unregistered');
    } catch (error) {
      console.error('❌ Service Worker unregistration failed:', error);
    }
  }
};

export const showUpdateAvailable = (): void => {
  // Show update notification to user
  const notification = document.createElement('div');
  notification.className = 'fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
  notification.innerHTML = `
    <div class="flex items-center justify-between">
      <div>
        <p class="font-semibold">Update Available</p>
        <p class="text-sm">A new version of Craftly AI is ready.</p>
      </div>
      <button id="update-btn" class="ml-4 bg-white text-blue-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors">
        Update
      </button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  const updateBtn = notification.querySelector('#update-btn');
  updateBtn?.addEventListener('click', () => {
    window.location.reload();
  });
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    notification.remove();
  }, 10000);
};

// Offline detection
export const setupOfflineDetection = (): void => {
  const updateOnlineStatus = () => {
    const isOnline = navigator.onLine;
    const statusElement = document.getElementById('connection-status');
    
    if (!isOnline) {
      if (!statusElement) {
        const offlineNotification = document.createElement('div');
        offlineNotification.id = 'connection-status';
        offlineNotification.className = 'fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50';
        offlineNotification.innerHTML = `
          <p class="text-sm font-medium">
            You're offline. Some features may not work properly.
          </p>
        `;
        document.body.appendChild(offlineNotification);
      }
    } else {
      if (statusElement) {
        statusElement.remove();
      }
    }
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Initial check
  updateOnlineStatus();
};

// Cache management
export const clearApplicationCache = async (): Promise<void> => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('✅ Application cache cleared');
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
    }
  }
};