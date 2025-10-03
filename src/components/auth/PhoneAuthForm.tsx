// Phone Authentication Form Component
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/stores/authStore';
import { userService } from '@/services/userService';
import { Phone, ArrowRight, Loader2 } from 'lucide-react';

interface PhoneAuthFormProps {
  onSuccess: (phoneNumber: string) => void;
  onBack?: () => void;
}

export function PhoneAuthForm({ onSuccess, onBack }: PhoneAuthFormProps) {
  const [phone, setPhone] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const { 
    requestOTP, 
    otpLoading, 
    otpError, 
    clearOTPError,
    setOTPPhone 
  } = useAuthStore();

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    setValidationError(null);
    clearOTPError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number
    const phoneValidation = userService.validateGhanaPhoneNumber(phone);
    if (!phoneValidation.isValid) {
      setValidationError(phoneValidation.error || 'Invalid phone number');
      return;
    }

    // Request OTP
    const success = await requestOTP(phoneValidation.formatted);
    if (success) {
      setOTPPhone(phoneValidation.formatted);
      onSuccess(phoneValidation.formatted);
    }
  };

  const formatPhoneDisplay = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as user types
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    } else if (digits.length <= 9) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    } else {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
    }
  };

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const digits = value.replace(/\D/g, '');
    
    // Limit to 9 digits (Ghana mobile numbers)
    if (digits.length <= 9) {
      const formatted = formatPhoneDisplay(value);
      handlePhoneChange(formatted);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Phone className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Enter Your Phone Number</CardTitle>
        <p className="text-muted-foreground">
          We'll send you a verification code to confirm your number
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                +233
              </div>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={handlePhoneInputChange}
                className="pl-16"
                disabled={otpLoading}
                required
              />
            </div>
            {validationError && (
              <p className="text-sm text-destructive">{validationError}</p>
            )}
          </div>

          {otpError && (
            <Alert variant="destructive">
              <AlertDescription>{otpError}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            {onBack && (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1"
                disabled={otpLoading}
              >
                Back
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1"
              disabled={otpLoading || !phone.trim()}
            >
              {otpLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            By continuing, you agree to our{' '}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
