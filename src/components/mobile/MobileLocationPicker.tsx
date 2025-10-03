// Mobile Location Picker Component
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Check,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  region: string;
}

interface MobileLocationPickerProps {
  onLocationSelect: (location: Location) => void;
  onClose: () => void;
  isOpen: boolean;
  className?: string;
}

export function MobileLocationPicker({ onLocationSelect, onClose, isOpen, className }: MobileLocationPickerProps) {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      getCurrentLocation();
    }
  }, [isOpen]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsGettingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocoding to get address
          const address = await reverseGeocode(latitude, longitude);
          
          const location: Location = {
            latitude,
            longitude,
            address: address.fullAddress,
            city: address.city,
            region: address.region,
          };
          
          setCurrentLocation(location);
        } catch (err) {
          console.error('Error getting address:', err);
          setError('Unable to get address for current location');
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to get current location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        setError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    // Mock implementation - in production, use a real geocoding service
    const mockAddresses = [
      {
        fullAddress: `Near ${Math.round(latitude * 1000)}/${Math.round(longitude * 1000)}, Accra`,
        city: 'Accra',
        region: 'Greater Accra',
      },
      {
        fullAddress: `Near Accra Central, ${Math.round(latitude * 1000)}/${Math.round(longitude * 1000)}`,
        city: 'Accra',
        region: 'Greater Accra',
      },
      {
        fullAddress: `Near Labadi, Accra`,
        city: 'Accra',
        region: 'Greater Accra',
      },
    ];
    
    return mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
  };

  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      // Mock search results - in production, use a real search service
      const mockResults: Location[] = [
        {
          latitude: 5.6037 + (Math.random() - 0.5) * 0.1,
          longitude: -0.1870 + (Math.random() - 0.5) * 0.1,
          address: `${query}, Accra Central`,
          city: 'Accra',
          region: 'Greater Accra',
        },
        {
          latitude: 5.6037 + (Math.random() - 0.5) * 0.1,
          longitude: -0.1870 + (Math.random() - 0.5) * 0.1,
          address: `${query}, Labadi`,
          city: 'Accra',
          region: 'Greater Accra',
        },
        {
          latitude: 5.6037 + (Math.random() - 0.5) * 0.1,
          longitude: -0.1870 + (Math.random() - 0.5) * 0.1,
          address: `${query}, Osu`,
          city: 'Accra',
          region: 'Greater Accra',
        },
      ];
      
      setSearchResults(mockResults);
    } catch (err) {
      console.error('Search error:', err);
      toast({
        title: "Search Error",
        description: "Failed to search locations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    searchLocations(searchQuery);
  };

  const handleLocationSelect = (location: Location) => {
    onLocationSelect(location);
    onClose();
  };

  const popularLocations: Location[] = [
    {
      latitude: 5.6037,
      longitude: -0.1870,
      address: 'Accra Central',
      city: 'Accra',
      region: 'Greater Accra',
    },
    {
      latitude: 5.5464,
      longitude: -0.2070,
      address: 'Labadi',
      city: 'Accra',
      region: 'Greater Accra',
    },
    {
      latitude: 5.5552,
      longitude: -0.1758,
      address: 'Osu',
      city: 'Accra',
      region: 'Greater Accra',
    },
    {
      latitude: 5.6148,
      longitude: -0.2053,
      address: 'East Legon',
      city: 'Accra',
      region: 'Greater Accra',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full w-full h-full max-h-full p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center justify-between">
            <span>Select Location</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Current Location */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Current Location
            </h3>
            
            {isGettingLocation ? (
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Getting your location...</span>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">{error}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={getCurrentLocation}
                    className="mt-3"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : currentLocation ? (
              <Card 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleLocationSelect(currentLocation)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{currentLocation.address}</p>
                        <p className="text-sm text-muted-foreground">
                          {currentLocation.city}, {currentLocation.region}
                        </p>
                      </div>
                    </div>
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    Unable to get current location
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Search */}
          <div>
            <h3 className="font-semibold mb-3">Search Location</h3>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Search for a location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch}
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((location, index) => (
                  <Card 
                    key={index}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleLocationSelect(location)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{location.address}</p>
                          <p className="text-xs text-muted-foreground">
                            {location.city}, {location.region}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Popular Locations */}
          <div>
            <h3 className="font-semibold mb-3">Popular Locations</h3>
            <div className="space-y-2">
              {popularLocations.map((location, index) => (
                <Card 
                  key={index}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleLocationSelect(location)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{location.address}</p>
                        <p className="text-xs text-muted-foreground">
                          {location.city}, {location.region}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
