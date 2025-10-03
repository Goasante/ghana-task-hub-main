// OTP Verification Form Component
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { Shield, ArrowLeft, Loader2, RotateCcw } from 'lucide-react';

interface OTPVerificationFormProps {
  phone: string;
  onSuccess: () => void;
  onBack: () => void;
  onResendOTP?: () => void;
}

export function OTPVerificationForm({ 
  phone, 
  onSuccess, 
  onBack, 
  onResendOTP 
}: OTPVerificationFormProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const { 
    verifyOTP, 
    otpLoading, 
    otpError, 
    clearOTPError,
    requestOTP 
  } = useAuthStore();

  // Format phone for display
  const displayPhone = userService.formatPhoneForDisplay(phone);

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);
    clearOTPError();

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6);
        if (digits.length === 6) {
          const newOtp = digits.split('');
          setOtp(newOtp);
          inputRefs.current[5]?.focus();
        }
      });
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    
    // Validate OTP
    const validation = authService.validateOTP(code);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid OTP');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const success = await verifyOTP(phone, code);
      if (success) {
        onSuccess();
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    setError(null);

    try {
      const success = await requestOTP(phone);
      if (success) {
        setResendCooldown(60); // 60 second cooldown
        if (onResendOTP) {
          onResendOTP();
        }
      } else {
        setError('Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length === 6) {
      handleVerify(code);
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Verify Your Number</CardTitle>
        <p className="text-muted-foreground">
          Enter the 6-digit code sent to{' '}
          <span className="font-medium text-foreground">{displayPhone}</span>
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-semibold border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  disabled={isVerifying}
                />
              ))}
            </div>

            {(error || otpError) && (
              <Alert variant="destructive">
                <AlertDescription>{error || otpError}</AlertDescription>
              </Alert>
            )}

            <div className="text-center">
              <Button
                type="submit"
                className="w-full"
                disabled={!isOtpComplete || isVerifying}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1"
              disabled={isVerifying}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleResendOTP}
              className="flex-1"
              disabled={resendLoading || resendCooldown > 0}
            >
              {resendLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="mr-2 h-4 w-4" />
              )}
              {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend'}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Didn't receive the code? Check your SMS or{' '}
            <button
              type="button"
              onClick={handleResendOTP}
              className="text-primary hover:underline"
              disabled={resendCooldown > 0}
            >
              resend
            </button>
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Development Mode
              </p>
              <p className="text-xs text-muted-foreground">
                Use code: <span className="font-mono font-semibold">123456</span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
