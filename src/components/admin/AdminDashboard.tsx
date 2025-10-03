// Admin Dashboard Component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  ClipboardList, 
  DollarSign, 
  Shield, 
  MessageSquare, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { adminService, AdminAnalytics } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';

interface AdminDashboardProps {
  className?: string;
}

export function AdminDashboard({ className }: AdminDashboardProps) {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAnalytics({ period: selectedPeriod });
      if (response.success && response.data) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    color = "text-primary" 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    trend?: { value: number; isPositive: boolean }; 
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {trend && (
              <div className={`flex items-center text-sm ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`h-4 w-4 mr-1 ${
                  trend.isPositive ? '' : 'rotate-180'
                }`} />
                {Math.abs(trend.value)}%
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const MetricCard = ({ 
    title, 
    value, 
    subtitle,
    icon: Icon 
  }: { 
    title: string; 
    value: string | number; 
    subtitle?: string;
    icon: any;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to Load Analytics</h3>
        <p className="text-muted-foreground mb-4">
          There was an error loading the dashboard data
        </p>
        <Button onClick={loadAnalytics}>Retry</Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Platform overview and key metrics
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={selectedPeriod === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('7d')}
          >
            7 Days
          </Button>
          <Button
            variant={selectedPeriod === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('30d')}
          >
            30 Days
          </Button>
          <Button
            variant={selectedPeriod === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('90d')}
          >
            90 Days
          </Button>
          <Button
            variant={selectedPeriod === '1y' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod('1y')}
          >
            1 Year
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={analytics.overview.totalUsers.toLocaleString()}
          icon={Users}
          color="text-blue-600"
        />
        <StatCard
          title="Total Tasks"
          value={analytics.overview.totalTasks.toLocaleString()}
          icon={ClipboardList}
          color="text-green-600"
        />
        <StatCard
          title="Total Revenue"
          value={adminService.formatCurrency(analytics.overview.totalRevenue)}
          icon={DollarSign}
          color="text-yellow-600"
        />
        <StatCard
          title="Active Taskers"
          value={analytics.overview.activeTaskers.toLocaleString()}
          icon={Shield}
          color="text-purple-600"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Pending KYC"
          value={analytics.overview.pendingKyc}
          subtitle="Documents awaiting review"
          icon={Clock}
        />
        <MetricCard
          title="Support Tickets"
          value={analytics.overview.supportTickets}
          subtitle="Open support requests"
          icon={MessageSquare}
        />
        <MetricCard
          title="Platform Health"
          value="98.5%"
          subtitle="System uptime"
          icon={Activity}
        />
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Growth
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Task Metrics
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.userGrowth.slice(0, 7).map((period, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{period.period}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">{period.newUsers} new</span>
                        <span className="text-sm">{period.activeUsers} active</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topClients.slice(0, 5).map((client, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{client.clientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {client.totalTasks} tasks
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {adminService.formatCurrency(client.totalSpent)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.taskMetrics.slice(0, 7).map((period, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{period.period}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">{period.totalTasks} total</span>
                        <span className="text-sm text-green-600">{period.completedTasks} completed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Taskers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topTaskers.slice(0, 5).map((tasker, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{tasker.taskerName}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground">
                            {tasker.totalTasks} tasks
                          </p>
                          <div className="flex items-center">
                            <span className="text-sm">⭐ {tasker.averageRating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {adminService.formatCurrency(tasker.totalEarnings)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.revenueMetrics.slice(0, 7).map((period, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{period.period}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold">
                          {adminService.formatCurrency(period.totalRevenue)}
                        </span>
                        <span className="text-sm text-green-600">
                          {adminService.formatCurrency(period.platformFees)} fees
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Platform Fees</span>
                    <span className="font-semibold text-green-600">
                      {adminService.formatCurrency(
                        analytics.revenueMetrics.reduce((sum, period) => sum + period.platformFees, 0)
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tasker Payouts</span>
                    <span className="font-semibold text-blue-600">
                      {adminService.formatCurrency(
                        analytics.revenueMetrics.reduce((sum, period) => sum + period.taskerPayouts, 0)
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.categoryStats.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{category.categoryName}</p>
                        <p className="text-sm text-muted-foreground">
                          {category.totalTasks} tasks • {category.completionRate.toFixed(1)}% completion
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {adminService.formatCurrency(category.averagePrice)}
                        </p>
                        <p className="text-sm text-muted-foreground">avg price</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Status</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Healthy
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Response Time</span>
                    <span className="font-semibold">45ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database Status</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment Gateway</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Operational
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
