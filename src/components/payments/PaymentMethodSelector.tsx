// Payment Method Selector Component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, Smartphone, Plus, Check, Loader2, AlertCircle } from 'lucide-react';
import { paymentService, PaymentMethod } from '@/services/paymentService';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethodSelectorProps {
  selectedMethod?: PaymentMethod | null;
  onMethodSelect: (method: PaymentMethod | null) => void;
  onAddMethod?: () => void;
}

interface NewPaymentMethodForm {
  type: 'CARD' | 'MOBILE_MONEY';
  provider: string;
  phoneNumber: string;
  isDefault: boolean;
}

export function PaymentMethodSelector({ 
  selectedMethod, 
  onMethodSelect, 
  onAddMethod 
}: PaymentMethodSelectorProps) {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addingMethod, setAddingMethod] = useState(false);
  const [newMethod, setNewMethod] = useState<NewPaymentMethodForm>({
    type: 'MOBILE_MONEY',
    provider: 'MTN_MOMO',
    phoneNumber: '',
    isDefault: false,
  });

  const { user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadPaymentMethods();
    }
  }, [user]);

  const loadPaymentMethods = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await paymentService.getPaymentMethods(user.id);
      if (response.success && response.data) {
        setMethods(response.data);
        // Auto-select default method if none selected
        if (!selectedMethod && response.data.length > 0) {
          const defaultMethod = response.data.find(m => m.isDefault) || response.data[0];
          onMethodSelect(defaultMethod);
        }
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMethod = async () => {
    if (!user || !newMethod.phoneNumber) return;

    setAddingMethod(true);
    try {
      // Validate phone number
      const validation = paymentService.validateMobileMoneyNumber(
        newMethod.phoneNumber,
        newMethod.provider
      );

      if (!validation.isValid) {
        toast({
          title: "Invalid Phone Number",
          description: validation.error || "Please check your phone number",
          variant: "destructive",
        });
        return;
      }

      const methodData = {
        type: newMethod.type,
        provider: newMethod.provider as 'MTN_MOMO' | 'VODAFONE_CASH' | 'AIRTELTIGO_MONEY',
        details: {
          phoneNumber: paymentService.formatPhoneNumber(newMethod.phoneNumber),
          network: newMethod.provider,
        },
      };

      const response = await paymentService.addPaymentMethod(user.id, methodData);
      
      if (response.success && response.data) {
        toast({
          title: "Payment Method Added",
          description: "Your payment method has been added successfully",
        });
        
        // Reload methods
        await loadPaymentMethods();
        
        // Select the new method if it's default or first method
        if (newMethod.isDefault || methods.length === 0) {
          onMethodSelect(response.data);
        }
        
        setShowAddDialog(false);
        setNewMethod({
          type: 'MOBILE_MONEY',
          provider: 'MTN_MOMO',
          phoneNumber: '',
          isDefault: false,
        });
        
        onAddMethod?.();
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast({
        title: "Error",
        description: "Failed to add payment method",
        variant: "destructive",
      });
    } finally {
      setAddingMethod(false);
    }
  };

  const handleRemoveMethod = async (methodId: string) => {
    if (!user) return;

    try {
      const response = await paymentService.removePaymentMethod(user.id, methodId);
      
      if (response.success) {
        toast({
          title: "Payment Method Removed",
          description: "Payment method has been removed successfully",
        });
        
        await loadPaymentMethods();
        
        // Clear selection if removed method was selected
        if (selectedMethod?.id === methodId) {
          onMethodSelect(null);
        }
      }
    } catch (error) {
      console.error('Error removing payment method:', error);
      toast({
        title: "Error",
        description: "Failed to remove payment method",
        variant: "destructive",
      });
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'MTN_MOMO':
        return '📱';
      case 'VODAFONE_CASH':
        return '📱';
      case 'AIRTELTIGO_MONEY':
        return '📱';
      case 'PAYSTACK':
        return '💳';
      case 'FLUTTERWAVE':
        return '💳';
      default:
        return '💳';
    }
  };

  const getProviderName = (provider: string) => {
    return paymentService.getPaymentMethodName(provider);
  };

  const getMethodDisplayText = (method: PaymentMethod) => {
    if (method.type === 'MOBILE_MONEY' && method.details.phoneNumber) {
      return `${getProviderName(method.provider)} •••• ${method.details.phoneNumber.slice(-4)}`;
    }
    if (method.type === 'CARD' && method.details.last4) {
      return `${method.details.brand || 'Card'} •••• ${method.details.last4}`;
    }
    return getProviderName(method.provider);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading payment methods...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          {methods.length === 0 ? (
            <div className="text-center py-6">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Payment Methods</h3>
              <p className="text-muted-foreground mb-4">
                Add a payment method to start making payments
              </p>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payment Method
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          ) : (
            <RadioGroup
              value={selectedMethod?.id || ''}
              onValueChange={(value) => {
                const method = methods.find(m => m.id === value);
                onMethodSelect(method || null);
              }}
              className="space-y-3"
            >
              {methods.map((method) => (
                <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="text-2xl">
                      {getProviderIcon(method.provider)}
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={method.id} className="font-medium cursor-pointer">
                        {getMethodDisplayText(method)}
                      </Label>
                      <div className="flex items-center gap-2 mt-1">
                        {method.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                        {method.isVerified ? (
                          <Badge variant="default" className="text-xs">
                            <Check className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Unverified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMethod(method.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </RadioGroup>
          )}

          {methods.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Payment Method
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Payment Method</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Payment Type</Label>
                      <RadioGroup
                        value={newMethod.type}
                        onValueChange={(value: 'CARD' | 'MOBILE_MONEY') => 
                          setNewMethod(prev => ({ ...prev, type: value }))
                        }
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="MOBILE_MONEY" id="mobile-money" />
                          <Label htmlFor="mobile-money" className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            Mobile Money
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="CARD" id="card" />
                          <Label htmlFor="card" className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Card
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {newMethod.type === 'MOBILE_MONEY' && (
                      <>
                        <div className="space-y-2">
                          <Label>Provider</Label>
                          <RadioGroup
                            value={newMethod.provider}
                            onValueChange={(value) => 
                              setNewMethod(prev => ({ ...prev, provider: value }))
                            }
                            className="space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="MTN_MOMO" id="mtn-momo" />
                              <Label htmlFor="mtn-momo">MTN MoMo</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="VODAFONE_CASH" id="vodafone-cash" />
                              <Label htmlFor="vodafone-cash">Vodafone Cash</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="AIRTELTIGO_MONEY" id="airteltigo-money" />
                              <Label htmlFor="airteltigo-money">AirtelTigo Money</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            placeholder="Enter your phone number"
                            value={newMethod.phoneNumber}
                            onChange={(e) => setNewMethod(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          />
                          <p className="text-sm text-muted-foreground">
                            Enter your {paymentService.getPaymentMethodName(newMethod.provider)} number
                          </p>
                        </div>
                      </>
                    )}

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is-default"
                        checked={newMethod.isDefault}
                        onChange={(e) => setNewMethod(prev => ({ ...prev, isDefault: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="is-default">Set as default payment method</Label>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddDialog(false)}
                        className="flex-1"
                        disabled={addingMethod}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddMethod}
                        className="flex-1"
                        disabled={addingMethod || !newMethod.phoneNumber}
                      >
                        {addingMethod ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Adding...
                          </>
                        ) : (
                          'Add Method'
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
