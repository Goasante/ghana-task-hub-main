// Payment Processor Component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Lock, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Shield,
  DollarSign,
  Info
} from 'lucide-react';
import { paymentService, PaymentMethod, PaymentIntent, Transaction } from '@/services/paymentService';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

interface PaymentProcessorProps {
  amount: number;
  currency?: string;
  taskId?: string;
  description: string;
  onSuccess: (transaction: Transaction) => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
}

interface PaymentStep {
  id: 'method' | 'confirm' | 'processing' | 'success' | 'error';
  title: string;
  description: string;
}

export function PaymentProcessor({
  amount,
  currency = 'GHS',
  taskId,
  description,
  onSuccess,
  onCancel,
  onError,
}: PaymentProcessorProps) {
  const [currentStep, setCurrentStep] = useState<PaymentStep['id']>('method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [pinCode, setPinCode] = useState('');

  const { user } = useAuthStore();
  const { toast } = useToast();

  const steps: PaymentStep[] = [
    {
      id: 'method',
      title: 'Select Payment Method',
      description: 'Choose how you want to pay',
    },
    {
      id: 'confirm',
      title: 'Confirm Payment',
      description: 'Review and confirm your payment details',
    },
    {
      id: 'processing',
      title: 'Processing Payment',
      description: 'Your payment is being processed',
    },
    {
      id: 'success',
      title: 'Payment Successful',
      description: 'Your payment has been completed',
    },
    {
      id: 'error',
      title: 'Payment Failed',
      description: 'There was an issue with your payment',
    },
  ];

  const currentStepData = steps.find(step => step.id === currentStep) || steps[0];

  const calculateFees = () => {
    const platformFee = paymentService.calculatePlatformFee(amount);
    const processingFee = selectedMethod 
      ? paymentService.calculateProcessingFee(amount, selectedMethod.provider)
      : 0;
    const totalFees = platformFee + processingFee;
    const netAmount = amount - totalFees;

    return {
      platformFee,
      processingFee,
      totalFees,
      netAmount,
    };
  };

  const handleMethodSelect = (method: PaymentMethod | null) => {
    setSelectedMethod(method);
    setError(null);
  };

  const handleProceedToConfirm = async () => {
    if (!selectedMethod || !user) {
      setError('Please select a payment method');
      return;
    }

    setCurrentStep('confirm');
  };

  const handleProcessPayment = async () => {
    if (!selectedMethod || !user) {
      setError('Payment method not selected');
      return;
    }

    setProcessing(true);
    setError(null);
    setCurrentStep('processing');

    try {
      // Create payment intent
      const intentResponse = await paymentService.createPaymentIntent({
        amount,
        currency,
        taskId: taskId || '',
        paymentMethodId: selectedMethod.id,
        description,
      });

      if (!intentResponse.success || !intentResponse.data) {
        throw new Error(intentResponse.error || 'Failed to create payment intent');
      }

      setPaymentIntent(intentResponse.data);

      // Confirm payment
      const confirmData: any = {};
      
      // Add OTP for mobile money
      if (selectedMethod.type === 'MOBILE_MONEY' && otpCode) {
        confirmData.otp = otpCode;
      }
      
      // Add PIN for card payments
      if (selectedMethod.type === 'CARD' && pinCode) {
        confirmData.pin = pinCode;
      }

      const confirmResponse = await paymentService.confirmPayment(
        intentResponse.data.id,
        confirmData
      );

      if (confirmResponse.success && confirmResponse.data) {
        setCurrentStep('success');
        onSuccess(confirmResponse.data);
        
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully",
        });
      } else {
        throw new Error(confirmResponse.error || 'Payment confirmation failed');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setError(errorMessage);
      setCurrentStep('error');
      onError?.(errorMessage);
      
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRetryPayment = () => {
    setError(null);
    setCurrentStep('method');
    setOtpCode('');
    setPinCode('');
  };

  const handleCancelPayment = async () => {
    if (paymentIntent) {
      try {
        await paymentService.cancelPayment(paymentIntent.id);
      } catch (error) {
        console.error('Error cancelling payment:', error);
      }
    }
    onCancel?.();
  };

  const fees = calculateFees();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Secure Payment
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Secure
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">{currentStepData.title}</p>
          <p className="text-xs text-muted-foreground">{currentStepData.description}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between">
          {steps.slice(0, 3).map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                ${currentStep === step.id 
                  ? 'bg-primary text-primary-foreground' 
                  : index < steps.findIndex(s => s.id === currentStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }
              `}>
                {index < steps.findIndex(s => s.id === currentStep) ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < 2 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  index < steps.findIndex(s => s.id === currentStep) - 1
                    ? 'bg-green-500'
                    : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Payment Amount */}
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="font-semibold">{paymentService.formatCurrency(amount, currency)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Platform Fee (10%)</span>
            <span>{paymentService.formatCurrency(fees.platformFee, currency)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Processing Fee</span>
            <span>{paymentService.formatCurrency(fees.processingFee, currency)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex items-center justify-between font-semibold">
            <span>Total</span>
            <span>{paymentService.formatCurrency(amount, currency)}</span>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 'method' && (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Select your preferred payment method to continue
              </AlertDescription>
            </Alert>
            
            {/* Payment method selection would go here */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <div className="text-2xl">📱</div>
                <div className="flex-1">
                  <p className="font-medium">Mobile Money</p>
                  <p className="text-sm text-muted-foreground">Pay with MTN MoMo, Vodafone Cash, or AirtelTigo Money</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                <div className="text-2xl">💳</div>
                <div className="flex-1">
                  <p className="font-medium">Card Payment</p>
                  <p className="text-sm text-muted-foreground">Pay with Visa or Mastercard</p>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancelPayment}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleProceedToConfirm}
                className="flex-1"
                disabled={!selectedMethod}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'confirm' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Payment Method</span>
                <span className="font-medium">Mobile Money</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Description</span>
                <span className="text-sm">{description}</span>
              </div>
            </div>

            {/* OTP Input for Mobile Money */}
            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP Code</Label>
              <Input
                id="otp"
                placeholder="Enter 6-digit OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
              <p className="text-xs text-muted-foreground">
                Check your phone for the OTP code sent by your mobile money provider
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('method')}
                className="flex-1"
                disabled={processing}
              >
                Back
              </Button>
              <Button
                onClick={handleProcessPayment}
                className="flex-1"
                disabled={processing || !otpCode || otpCode.length !== 6}
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Pay Now'
                )}
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'processing' && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <div>
              <p className="font-medium">Processing Your Payment</p>
              <p className="text-sm text-muted-foreground">
                Please wait while we process your payment. Do not close this window.
              </p>
            </div>
          </div>
        )}

        {currentStep === 'success' && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <div>
              <p className="font-medium text-green-600">Payment Successful!</p>
              <p className="text-sm text-muted-foreground">
                Your payment of {paymentService.formatCurrency(amount, currency)} has been processed successfully.
              </p>
            </div>
            <Button onClick={() => onSuccess({} as Transaction)} className="w-full">
              Continue
            </Button>
          </div>
        )}

        {currentStep === 'error' && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <div>
              <p className="font-medium text-red-600">Payment Failed</p>
              <p className="text-sm text-muted-foreground">
                {error || 'There was an issue processing your payment. Please try again.'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancelPayment}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRetryPayment}
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
