// Admin Page
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { UserManagement } from '@/components/admin/UserManagement';
import { KycManagement } from '@/components/admin/KycManagement';
import { TaskManagement } from '@/components/admin/TaskManagement';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  Shield, 
  ClipboardList, 
  MessageSquare, 
  Settings,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is admin
    if (isAuthenticated && user?.role !== 'ADMIN') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel",
        variant: "destructive",
      });
      // Redirect to dashboard or home
      window.location.href = '/dashboard';
    }
  }, [isAuthenticated, user, toast]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please sign in to access admin panel</h1>
            <p className="text-muted-foreground">
              You need to be logged in as an admin to access this page
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access the admin panel. Admin privileges are required.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Settings className="h-8 w-8" />
                Admin Panel
              </h1>
              <p className="text-muted-foreground">
                Manage platform users, tasks, and system settings
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                System Healthy
              </Badge>
              <Badge variant="secondary">
                Admin: {user.firstName} {user.lastName}
              </Badge>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="kyc" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              KYC
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="kyc" className="mt-6">
            <KycManagement />
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <TaskManagement />
          </TabsContent>

          <TabsContent value="support" className="mt-6">
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Support Management</h3>
              <p className="text-muted-foreground mb-6">
                Manage user support tickets and inquiries
              </p>
              <Button disabled>
                <MessageSquare className="h-4 w-4 mr-2" />
                Coming Soon
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Users</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <Users className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Active Tasks</p>
                <p className="text-2xl font-bold">89</p>
              </div>
              <ClipboardList className="h-8 w-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Pending KYC</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <Shield className="h-8 w-8 text-yellow-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Revenue Today</p>
                <p className="text-2xl font-bold">₵2,456</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* System Alerts */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">System Alerts</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Payment Gateway Status</p>
                <p className="text-sm text-green-600">All payment methods are operational</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">KYC Review Backlog</p>
                <p className="text-sm text-yellow-600">23 documents pending review</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">System Performance</p>
                <p className="text-sm text-blue-600">All systems running optimally</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
