// Transaction History Component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { paymentService, Transaction, PaymentAnalytics } from '@/services/paymentService';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

interface TransactionHistoryProps {
  className?: string;
}

export function TransactionHistory({ className }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { user } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadTransactions();
      loadAnalytics();
    }
  }, [user, currentPage, statusFilter, typeFilter]);

  const loadTransactions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 10,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }

      const response = await paymentService.getTransactions(user.id, params);
      
      if (response.success && response.data) {
        setTransactions(response.data.data);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transaction history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      const response = await paymentService.getPaymentAnalytics({ userId: user.id });
      if (response.success && response.data) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const getTransactionIcon = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'PAYMENT':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      case 'PAYOUT':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'REFUND':
        return <ArrowUpDown className="h-4 w-4 text-blue-500" />;
      case 'PLATFORM_FEE':
        return <ArrowUpDown className="h-4 w-4 text-purple-500" />;
      default:
        return <ArrowUpDown className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'PROCESSING':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'FAILED':
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    return paymentService.getPaymentStatusColor(status);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getTransactionAmount = (transaction: Transaction) => {
    const isPositive = transaction.type === 'PAYOUT' || transaction.type === 'REFUND';
    const sign = isPositive ? '+' : '-';
    return `${sign}${paymentService.formatCurrency(transaction.amount, transaction.currency)}`;
  };

  const handleRefresh = () => {
    loadTransactions();
    loadAnalytics();
  };

  const handleExportTransactions = () => {
    // TODO: Implement CSV export
    toast({
      title: "Export Feature",
      description: "Transaction export feature coming soon",
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        transaction.description.toLowerCase().includes(query) ||
        transaction.reference.toLowerCase().includes(query) ||
        transaction.id.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const TransactionCard = ({ transaction }: { transaction: Transaction }) => {
    const dateInfo = formatDate(transaction.createdAt);
    
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg">
            {getTransactionIcon(transaction)}
          </div>
          <div>
            <p className="font-medium">{transaction.description}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{transaction.reference}</span>
              <span>•</span>
              <span>{dateInfo.date}</span>
              <span>{dateInfo.time}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-semibold ${
              transaction.type === 'PAYOUT' || transaction.type === 'REFUND'
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {getTransactionAmount(transaction)}
            </span>
            {getStatusIcon(transaction.status)}
          </div>
          <Badge className={getStatusColor(transaction.status)}>
            {transaction.status}
          </Badge>
        </div>
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6" />
            Transaction History
          </h2>
          <p className="text-muted-foreground">
            View and manage your payment transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportTransactions}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Volume</p>
                  <p className="text-2xl font-bold">{paymentService.formatCurrency(analytics.totalVolume)}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ArrowUpDown className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold">{analytics.totalTransactions}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{Math.round(analytics.successRate * 100)}%</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Transaction</p>
                  <p className="text-2xl font-bold">{paymentService.formatCurrency(analytics.averageTransactionValue)}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ArrowUpDown className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="PAYMENT">Payments</SelectItem>
                <SelectItem value="PAYOUT">Payouts</SelectItem>
                <SelectItem value="REFUND">Refunds</SelectItem>
                <SelectItem value="PLATFORM_FEE">Platform Fees</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSkeleton />
          ) : filteredTransactions.length > 0 ? (
            <div className="space-y-2">
              {filteredTransactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'You haven\'t made any transactions yet'
                }
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
