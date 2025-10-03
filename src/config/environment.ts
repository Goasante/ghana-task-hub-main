// Environment configuration for Ghana Task Hub
export const config = {
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Ghana Task Hub',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',

  // Payment Providers
  PAYSTACK_PUBLIC_KEY: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
  FLUTTERWAVE_PUBLIC_KEY: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || '',

  // Firebase Configuration
  FIREBASE: {
    API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || '',
    AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || '',
  },

  // Feature Flags
  FEATURES: {
    PAYMENTS: import.meta.env.VITE_ENABLE_PAYMENTS === 'true',
    MESSAGING: import.meta.env.VITE_ENABLE_MESSAGING === 'true',
    NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
    KYC: import.meta.env.VITE_ENABLE_KYC === 'true',
  },

  // Development Settings
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  MOCK_API: import.meta.env.VITE_MOCK_API === 'true',

  // App Settings
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 50,
  PLATFORM_FEE_PERCENTAGE: 10, // 10% platform fee
  
  // Ghana-specific settings
  DEFAULT_CURRENCY: 'GHS',
  SUPPORTED_PHONE_FORMATS: [
    '+233XXXXXXXXX', // International format
    '0XXXXXXXXX',    // Local format
    'XXXXXXXXX',     // Without country code
  ],
  
  // Supported regions in Ghana
  SUPPORTED_REGIONS: [
    'Greater Accra',
    'Ashanti',
    'Western',
    'Central',
    'Volta',
    'Eastern',
    'Northern',
    'Upper East',
    'Upper West',
    'Brong-Ahafo',
    'Western North',
    'Ahafo',
    'Bono',
    'Bono East',
    'Oti',
    'Savannah',
    'North East',
  ],
} as const;

// Validate required configuration
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.API_URL) {
    errors.push('API_URL is required');
  }

  if (config.FEATURES.PAYMENTS && !config.PAYSTACK_PUBLIC_KEY && !config.FLUTTERWAVE_PUBLIC_KEY) {
    errors.push('At least one payment provider key is required when payments are enabled');
  }

  if (config.FEATURES.NOTIFICATIONS) {
    const firebaseConfig = config.FIREBASE;
    if (!firebaseConfig.API_KEY || !firebaseConfig.PROJECT_ID) {
      errors.push('Firebase configuration is required when notifications are enabled');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Get environment info
export function getEnvironmentInfo() {
  return {
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    mode: import.meta.env.MODE,
    config,
  };
}
