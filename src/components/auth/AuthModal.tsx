// Enhanced Authentication Modal with new components
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PhoneAuthForm } from './PhoneAuthForm';
import { OTPVerificationForm } from './OTPVerificationForm';
import { RegistrationForm } from './RegistrationForm';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthStep = 'phone' | 'otp' | 'registration' | 'success';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  
  const { 
    isAuthenticated, 
    clearOTPState, 
    initializeAuth 
  } = useAuthStore();
  const { toast } = useToast();

  // Initialize auth on mount
  useEffect(() => {
    if (isOpen) {
      initializeAuth();
    }
  }, [isOpen, initializeAuth]);

  // Close modal if user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      toast({
        title: "Welcome to Ghana Task Hub!",
        description: "Your account has been created successfully",
      });
      handleClose();
    }
  }, [isAuthenticated, isOpen, toast]);

  const handlePhoneSuccess = (phoneNumber: string) => {
    setPhone(phoneNumber);
    setStep('otp');
  };

  const handleOTPSuccess = () => {
    setStep('registration');
  };

  const handleRegistrationSuccess = () => {
    setStep('success');
    // Auth store will handle the login automatically
  };

  const handleBack = () => {
    switch (step) {
      case 'otp':
        setStep('phone');
        clearOTPState();
        break;
      case 'registration':
        setStep('otp');
        break;
      default:
        setStep('phone');
        break;
    }
  };

  const handleClose = () => {
    setStep('phone');
    setPhone('');
    clearOTPState();
    onClose();
  };

  const renderStep = () => {
    switch (step) {
      case 'phone':
        return (
          <PhoneAuthForm
            onSuccess={handlePhoneSuccess}
          />
        );
      
      case 'otp':
        return (
          <OTPVerificationForm
            phone={phone}
            onSuccess={handleOTPSuccess}
            onBack={handleBack}
          />
        );
      
      case 'registration':
        return (
          <RegistrationForm
            phone={phone}
            onSuccess={handleRegistrationSuccess}
            onBack={handleBack}
          />
        );
      
      case 'success':
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Account Created Successfully!</h3>
            <p className="text-muted-foreground">
              Welcome to Ghana Task Hub. Redirecting you now...
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0">
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}