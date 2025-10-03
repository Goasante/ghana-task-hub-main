// PWA Install Banner Component
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Download, 
  X, 
  Smartphone, 
  Wifi, 
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useToast } from '@/hooks/use-toast';

interface PWAInstallBannerProps {
  className?: string;
}

export function PWAInstallBanner({ className }: PWAInstallBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const { isInstallable, isInstalled, isOffline, installPWA, updateAvailable, updateApp } = usePWA();
  const { toast } = useToast();

  // Don't show if dismissed, already installed, or not installable
  if (isDismissed || isInstalled || (!isInstallable && !updateAvailable && !isOffline)) {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await installPWA();
      toast({
        title: "App Installed!",
        description: "Ghana Task Hub has been installed on your device",
      });
    } catch (error) {
      console.error('Installation failed:', error);
      toast({
        title: "Installation Failed",
        description: "Unable to install the app. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInstalling(false);
    }
  };

  const handleUpdate = () => {
    updateApp();
    toast({
      title: "Updating App",
      description: "The app is being updated to the latest version",
    });
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Store dismissal in localStorage
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  // Check if banner was previously dismissed
  React.useEffect(() => {
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  return (
    <Card className={`mx-4 mb-4 border-l-4 ${
      updateAvailable 
        ? 'border-l-blue-500 bg-blue-50' 
        : isOffline 
        ? 'border-l-red-500 bg-red-50' 
        : 'border-l-green-500 bg-green-50'
    } ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              updateAvailable 
                ? 'bg-blue-100 text-blue-600' 
                : isOffline 
                ? 'bg-red-100 text-red-600' 
                : 'bg-green-100 text-green-600'
            }`}>
              {updateAvailable ? (
                <RefreshCw className="h-5 w-5" />
              ) : isOffline ? (
                <WifiOff className="h-5 w-5" />
              ) : (
                <Smartphone className="h-5 w-5" />
              )}
            </div>
            
            <div>
              {updateAvailable ? (
                <>
                  <h3 className="font-semibold text-blue-900">Update Available</h3>
                  <p className="text-sm text-blue-700">
                    A new version of the app is ready to install
                  </p>
                </>
              ) : isOffline ? (
                <>
                  <h3 className="font-semibold text-red-900">You're Offline</h3>
                  <p className="text-sm text-red-700">
                    Some features may not be available without internet
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-green-900">Install App</h3>
                  <p className="text-sm text-green-700">
                    Get quick access and better performance
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {updateAvailable ? (
              <Button 
                size="sm" 
                onClick={handleUpdate}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Update
              </Button>
            ) : !isOffline ? (
              <Button 
                size="sm" 
                onClick={handleInstall}
                disabled={isInstalling}
                className="bg-green-600 hover:bg-green-700"
              >
                {isInstalling ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Install
                  </>
                )}
              </Button>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm">Offline</span>
              </div>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Offline indicator */}
        {isOffline && (
          <div className="mt-3 pt-3 border-t border-red-200">
            <div className="flex items-center gap-2 text-red-600">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm">
                You're currently offline. Some features may be limited.
              </span>
            </div>
          </div>
        )}

        {/* Benefits for install prompt */}
        {!isOffline && !updateAvailable && (
          <div className="mt-3 pt-3 border-t border-green-200">
            <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
              <div className="flex items-center gap-1">
                <Smartphone className="h-3 w-3" />
                <span>Quick access</span>
              </div>
              <div className="flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                <span>Works offline</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
