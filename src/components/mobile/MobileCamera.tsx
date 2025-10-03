// Mobile Camera Component for Task Photos
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Camera, 
  X, 
  RotateCcw, 
  Check, 
  Upload,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MobileCameraProps {
  onPhotoTaken: (file: File) => void;
  onClose: () => void;
  isOpen: boolean;
  className?: string;
}

export function MobileCamera({ onPhotoTaken, onClose, isOpen, className }: MobileCameraProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    try {
      setError(null);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/jpeg', 0.9);
      });

      // Create file from blob
      const file = new File([blob], `task-photo-${Date.now()}.jpg`, {
        type: 'image/jpeg'
      });

      // Create preview URL
      const imageUrl = URL.createObjectURL(blob);
      setCapturedImage(imageUrl);

      toast({
        title: "Photo Captured",
        description: "Photo has been captured successfully",
      });

    } catch (err) {
      console.error('Error capturing photo:', err);
      toast({
        title: "Capture Error",
        description: "Failed to capture photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setCapturedImage(null);
  };

  const retakePhoto = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
      setCapturedImage(null);
    }
  };

  const confirmPhoto = () => {
    if (!capturedImage) return;

    // Convert captured image back to file
    canvasRef.current?.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `task-photo-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });
        onPhotoTaken(file);
        
        // Clean up
        URL.revokeObjectURL(capturedImage);
        setCapturedImage(null);
        onClose();
      }
    }, 'image/jpeg', 0.9);
  };

  const handleClose = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
      setCapturedImage(null);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-full w-full h-full max-h-full p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex items-center justify-between">
            <span>Take Photo</span>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 relative bg-black">
          {error ? (
            <div className="flex items-center justify-center h-full p-4">
              <Card className="max-w-sm w-full">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Camera Unavailable</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {error}
                  </p>
                  <Button onClick={startCamera} variant="outline">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : capturedImage ? (
            /* Photo Preview */
            <div className="relative h-full">
              <img 
                src={capturedImage} 
                alt="Captured photo" 
                className="w-full h-full object-contain"
              />
              
              {/* Photo Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={retakePhoto}
                  className="bg-white/90 backdrop-blur"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Retake
                </Button>
                <Button
                  size="lg"
                  onClick={confirmPhoto}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-5 w-5 mr-2" />
                  Use Photo
                </Button>
              </div>
            </div>
          ) : (
            /* Camera View */
            <div className="relative h-full">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              
              {/* Camera Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-6">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={switchCamera}
                  className="bg-white/90 backdrop-blur"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
                
                <Button
                  size="lg"
                  onClick={capturePhoto}
                  disabled={isCapturing || !stream}
                  className="h-16 w-16 rounded-full bg-white/90 backdrop-blur hover:bg-white"
                >
                  {isCapturing ? (
                    <Loader2 className="h-6 w-6 animate-spin text-black" />
                  ) : (
                    <Camera className="h-6 w-6 text-black" />
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleClose}
                  className="bg-white/90 backdrop-blur"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Camera Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 right-4">
                  <div className="bg-black/50 backdrop-blur rounded-lg p-3">
                    <p className="text-white text-sm text-center">
                      Position the task or item in the center of the frame
                    </p>
                  </div>
                </div>
                
                {/* Focus frame */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-48 h-32 border-2 border-white rounded-lg opacity-50" />
                </div>
              </div>
            </div>
          )}
          
          {/* Hidden canvas for photo capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
