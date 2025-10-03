// Payout Manager Component for Taskers
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Wallet, 
  Plus, 
  Check, 
  Clock, 
  AlertCircle, 
  Loader2,
  TrendingUp,
  DollarSign,
  Smartphone,
  CreditCard
} from 'lucide-react';
import { paymentService, PayoutMethod, Payout } from '@/services/paymentService';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

interface PayoutManagerProps {
  className?: string;
}

interface NewPayoutMethodForm {
  type: 'MOBILE_MONEY' | 'BANK_ACCOUNT';
  provider: string;
  phoneNumber: string;
  accountNumber: string;
  bankCode: string;
  accountName: string;
  isDefault: boolean;
}

export function PayoutManager({ className }: PayoutManagerProps) {
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [addingMethod, setAddingMethod] = useState(false);
  const [requestingPayout, setRequestingPayout] = useState(false);
  const [newMethod, setNewMethod] = useState<NewPayoutMethodForm>({
    type: 'MOBILE_MONEY',
    provider: 'MTN_MOMO',
    phoneNumber: '',
    accountNumber: '',
    bankCode: '',
    accountName: '',
    isDefault: false,
  });
  const [payoutAmount, setPayoutAmount] = useState('');
  const [selectedPayoutMethod, setSelectedPayoutMethod] = useState<PayoutMethod | null>(null);

  const { user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    if (user && user.role === 'TASKER') {
      loadPayoutMethods();
      loadPayouts();
      loadAvailableBalance();
    }
  }, [user]);

  const loadPayoutMethods = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await paymentService.getPayoutMethods(user.id);
      if (response.success && response.data) {
        setPayoutMethods(response.data);
        // Auto-select default method
        const defaultMethod = response.data.find(m => m.isDefault);
        if (defaultMethod) {
          setSelectedPayoutMethod(defaultMethod);
        }
      }
    } catch (error) {
      console.error('Error loading payout methods:', error);
      toast({
        title: "Error",
        description: "Failed to load payout methods",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPayouts = async () => {
    if (!user) return;

    try {
      const response = await paymentService.getPayouts(user.id);
      if (response.success && response.data) {
        setPayouts(response.data.data);
      }
    } catch (error) {
      console.error('Error loading payouts:', error);
    }
  };

  const loadAvailableBalance = async () => {
    // TODO: Implement balance calculation from completed tasks
    // For now, mock the balance
    setAvailableBalance(150.00);
  };

  const handleAddPayoutMethod = async () => {
    if (!user || !newMethod.phoneNumber) return;

    setAddingMethod(true);
    try {
      const methodData = {
        type: newMethod.type,
        provider: newMethod.provider as 'MTN_MOMO' | 'VODAFONE_CASH' | 'AIRTELTIGO_MONEY' | 'GHC_BANK',
        details: newMethod.type === 'MOBILE_MONEY' ? {
          phoneNumber: paymentService.formatPhoneNumber(newMethod.phoneNumber),
        } : {
          accountNumber: newMethod.accountNumber,
          bankCode: newMethod.bankCode,
          accountName: newMethod.accountName,
        },
      };

      const response = await paymentService.addPayoutMethod(user.id, methodData);
      
      if (response.success && response.data) {
        toast({
          title: "Payout Method Added",
          description: "Your payout method has been added successfully",
        });
        
        await loadPayoutMethods();
        setShowAddMethod(false);
        setNewMethod({
          type: 'MOBILE_MONEY',
          provider: 'MTN_MOMO',
          phoneNumber: '',
          accountNumber: '',
          bankCode: '',
          accountName: '',
          isDefault: false,
        });
      }
    } catch (error) {
      console.error('Error adding payout method:', error);
      toast({
        title: "Error",
        description: "Failed to add payout method",
        variant: "destructive",
      });
    } finally {
      setAddingMethod(false);
    }
  };

  const handleRequestPayout = async () => {
    if (!user || !selectedPayoutMethod || !payoutAmount) return;

    const amount = parseFloat(payoutAmount);
    if (amount <= 0 || amount > availableBalance) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount within your available balance",
        variant: "destructive",
      });
      return;
    }

    setRequestingPayout(true);
    try {
      const response = await paymentService.requestPayout({
        taskerId: user.id,
        amount,
        payoutMethodId: selectedPayoutMethod.id,
        description: `Payout to ${paymentService.getPaymentMethodName(selectedPayoutMethod.provider)}`,
      });

      if (response.success && response.data) {
        toast({
          title: "Payout Requested",
          description: "Your payout request has been submitted successfully",
        });
        
        setPayoutAmount('');
        await loadPayouts();
        await loadAvailableBalance();
      }
    } catch (error) {
      console.error('Error requesting payout:', error);
      toast({
        title: "Error",
        description: "Failed to request payout",
        variant: "destructive",
      });
    } finally {
      setRequestingPayout(false);
    }
  };

  const getPayoutStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPayoutStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'PENDING':
      case 'PROCESSING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'FAILED':
      case 'CANCELLED':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (user?.role !== 'TASKER') {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
        <p className="text-muted-foreground">
          Payout management is only available for taskers.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Payout Management
          </h2>
          <p className="text-muted-foreground">
            Manage your earnings and payout methods
          </p>
        </div>
      </div>

      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold">{paymentService.formatCurrency(availableBalance)}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold">{paymentService.formatCurrency(availableBalance + 50)}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Payouts</p>
                <p className="text-2xl font-bold">{payouts.length}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Wallet className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Payout */}
      {availableBalance > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Request Payout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payout-amount">Amount (₵)</Label>
                <Input
                  id="payout-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  max={availableBalance}
                  min="1"
                />
                <p className="text-sm text-muted-foreground">
                  Available: {paymentService.formatCurrency(availableBalance)}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Payout Method</Label>
                {payoutMethods.length > 0 ? (
                  <Select
                    value={selectedPayoutMethod?.id || ''}
                    onValueChange={(value) => {
                      const method = payoutMethods.find(m => m.id === value);
                      setSelectedPayoutMethod(method || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payout method" />
                    </SelectTrigger>
                    <SelectContent>
                      {payoutMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          <div className="flex items-center gap-2">
                            {method.type === 'MOBILE_MONEY' ? (
                              <Smartphone className="h-4 w-4" />
                            ) : (
                              <CreditCard className="h-4 w-4" />
                            )}
                            <span>{paymentService.getPaymentMethodName(method.provider)}</span>
                            {method.isDefault && <Badge variant="secondary" className="ml-2">Default</Badge>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-center py-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">No payout methods added</p>
                    <Dialog open={showAddMethod} onOpenChange={setShowAddMethod}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Method
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                )}
              </div>
            </div>

            {selectedPayoutMethod && payoutAmount && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p><strong>Payout Summary:</strong></p>
                    <p>Amount: {paymentService.formatCurrency(parseFloat(payoutAmount))}</p>
                    <p>Method: {paymentService.getPaymentMethodName(selectedPayoutMethod.provider)}</p>
                    <p>Processing time: 1-3 business days</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAddMethod(true)}
                disabled={requestingPayout}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payout Method
              </Button>
              <Button
                onClick={handleRequestPayout}
                disabled={requestingPayout || !payoutAmount || !selectedPayoutMethod}
                className="flex-1"
              >
                {requestingPayout ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Request Payout'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payout Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Methods</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading payout methods...</span>
            </div>
          ) : payoutMethods.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Payout Methods</h3>
              <p className="text-muted-foreground mb-4">
                Add a payout method to receive your earnings
              </p>
              <Dialog open={showAddMethod} onOpenChange={setShowAddMethod}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Payout Method
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          ) : (
            <div className="space-y-3">
              {payoutMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      {method.type === 'MOBILE_MONEY' ? (
                        <Smartphone className="h-5 w-5" />
                      ) : (
                        <CreditCard className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{paymentService.getPaymentMethodName(method.provider)}</p>
                      <p className="text-sm text-muted-foreground">
                        {method.type === 'MOBILE_MONEY' 
                          ? method.details.phoneNumber 
                          : `${method.details.accountName} ••••${method.details.accountNumber?.slice(-4)}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {method.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                    {method.isVerified ? (
                      <Badge variant="default">
                        <Check className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline">Unverified</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Payouts Yet</h3>
              <p className="text-muted-foreground">
                Your payout history will appear here once you request your first payout.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {payouts.slice(0, 5).map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      {getPayoutStatusIcon(payout.status)}
                    </div>
                    <div>
                      <p className="font-medium">{payout.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payout.createdAt).toLocaleDateString()} • {payout.reference}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      +{paymentService.formatCurrency(payout.netAmount)}
                    </p>
                    <Badge className={getPayoutStatusColor(payout.status)}>
                      {payout.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Payout Method Dialog */}
      <Dialog open={showAddMethod} onOpenChange={setShowAddMethod}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payout Method</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Payout Type</Label>
              <RadioGroup
                value={newMethod.type}
                onValueChange={(value: 'MOBILE_MONEY' | 'BANK_ACCOUNT') => 
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
                  <RadioGroupItem value="BANK_ACCOUNT" id="bank-account" />
                  <Label htmlFor="bank-account" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Bank Account
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
                </div>
              </>
            )}

            {newMethod.type === 'BANK_ACCOUNT' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="account-name">Account Name</Label>
                  <Input
                    id="account-name"
                    placeholder="Enter account name"
                    value={newMethod.accountName}
                    onChange={(e) => setNewMethod(prev => ({ ...prev, accountName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-number">Account Number</Label>
                  <Input
                    id="account-number"
                    placeholder="Enter account number"
                    value={newMethod.accountNumber}
                    onChange={(e) => setNewMethod(prev => ({ ...prev, accountNumber: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank-code">Bank Code</Label>
                  <Input
                    id="bank-code"
                    placeholder="Enter bank code"
                    value={newMethod.bankCode}
                    onChange={(e) => setNewMethod(prev => ({ ...prev, bankCode: e.target.value }))}
                  />
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
              <Label htmlFor="is-default">Set as default payout method</Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddMethod(false)}
                className="flex-1"
                disabled={addingMethod}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddPayoutMethod}
                className="flex-1"
                disabled={addingMethod || !newMethod.phoneNumber && !newMethod.accountNumber}
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
  );
}
