// User Management Component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Shield, 
  ShieldOff, 
  UserCheck, 
  UserX,
  Eye,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { adminService, AdminUser } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';

interface UserManagementProps {
  className?: string;
}

export function UserManagement({ className }: UserManagementProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [kycFilter, setKycFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, [searchQuery, roleFilter, statusFilter, kycFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getUsers({
        search: searchQuery || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        kycStatus: kycFilter !== 'all' ? kycFilter : undefined,
        limit: 50,
      });
      
      if (response.success && response.data) {
        setUsers(response.data.data || response.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string, value?: any) => {
    setActionLoading(userId);
    try {
      let response;
      
      switch (action) {
        case 'status':
          response = await adminService.updateUserStatus(userId, value);
          break;
        case 'role':
          response = await adminService.updateUserRole(userId, value);
          break;
        default:
          throw new Error('Unknown action');
      }

      if (response.success) {
        toast({
          title: "Success",
          description: `User ${action} updated successfully`,
        });
        await loadUsers();
      } else {
        throw new Error(response.error || 'Action failed');
      }
    } catch (error) {
      console.error(`Error updating user ${action}:`, error);
      toast({
        title: "Error",
        description: `Failed to update user ${action}`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants = {
      ACTIVE: 'default',
      SUSPENDED: 'destructive',
      PENDING: 'secondary',
      REJECTED: 'destructive',
    };
    return variants[status] || 'secondary';
  };

  const getKycStatusBadgeVariant = (status: string) => {
    const variants = {
      APPROVED: 'default',
      PENDING: 'secondary',
      REJECTED: 'destructive',
      NOT_SUBMITTED: 'outline',
    };
    return variants[status] || 'outline';
  };

  const getRoleIcon = (role: string) => {
    return adminService.getRoleIcon(role);
  };

  const formatDate = (date: string) => {
    return adminService.formatDate(date);
  };

  const formatCurrency = (amount: number) => {
    return adminService.formatCurrency(amount);
  };

  const UserRow = ({ user }: { user: AdminUser }) => {
    const isActionLoading = actionLoading === user.id;

    return (
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.profilePhotoUrl} />
            <AvatarFallback>
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
              <span className="text-sm">{getRoleIcon(user.role)}</span>
              <Badge variant={getStatusBadgeVariant(user.status)}>
                {user.status}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{user.email}</span>
              <span>{user.phone}</span>
              <span>Joined {formatDate(user.createdAt)}</span>
            </div>

            <div className="flex items-center gap-4 mt-2">
              <Badge variant={getKycStatusBadgeVariant(user.kycStatus)}>
                KYC: {user.kycStatus}
              </Badge>
              
              {user.role === 'TASKER' && user.taskStats.totalEarnings && (
                <span className="text-sm text-green-600 font-medium">
                  Earned: {formatCurrency(user.taskStats.totalEarnings)}
                </span>
              )}
              
              {user.role === 'CLIENT' && user.taskStats.totalSpent && (
                <span className="text-sm text-blue-600 font-medium">
                  Spent: {formatCurrency(user.taskStats.totalSpent)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedUser(user);
              setShowUserDetails(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>

          <Select
            value={user.status}
            onValueChange={(value) => handleUserAction(user.id, 'status', value)}
            disabled={isActionLoading}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="SUSPENDED">Suspend</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REJECTED">Reject</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={user.role}
            onValueChange={(value) => handleUserAction(user.id, 'role', value)}
            disabled={isActionLoading}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CLIENT">Client</SelectItem>
              <SelectItem value="TASKER">Tasker</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>

          {isActionLoading && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            User Management
          </h2>
          <p className="text-muted-foreground">
            Manage users, roles, and account status
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="CLIENT">Clients</SelectItem>
                <SelectItem value="TASKER">Taskers</SelectItem>
                <SelectItem value="ADMIN">Admins</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={kycFilter} onValueChange={setKycFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by KYC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All KYC Status</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="NOT_SUBMITTED">Not Submitted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Users ({users.length})</span>
            <Button variant="outline" size="sm" onClick={loadUsers}>
              <Filter className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground">
                {searchQuery || roleFilter !== 'all' || statusFilter !== 'all' || kycFilter !== 'all'
                  ? 'Try adjusting your search criteria'
                  : 'No users have registered yet'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {users.map((user) => (
                <UserRow key={user.id} user={user} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.profilePhotoUrl} />
                  <AvatarFallback className="text-lg">
                    {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getStatusBadgeVariant(selectedUser.status)}>
                      {selectedUser.status}
                    </Badge>
                    <Badge variant={getKycStatusBadgeVariant(selectedUser.kycStatus)}>
                      KYC: {selectedUser.kycStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{selectedUser.taskStats.totalTasks}</p>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{selectedUser.taskStats.completedTasks}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{selectedUser.taskStats.averageRating.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">
                    {selectedUser.role === 'TASKER' 
                      ? formatCurrency(selectedUser.taskStats.totalEarnings || 0)
                      : formatCurrency(selectedUser.taskStats.totalSpent || 0)
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.role === 'TASKER' ? 'Total Earned' : 'Total Spent'}
                  </p>
                </div>
              </div>

              {/* Account Info */}
              <div className="space-y-4">
                <h4 className="font-semibold">Account Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p>{selectedUser.phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Role</p>
                    <p className="flex items-center gap-1">
                      <span>{getRoleIcon(selectedUser.role)}</span>
                      {selectedUser.role}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Joined</p>
                    <p>{formatDate(selectedUser.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Login</p>
                    <p>{selectedUser.lastLoginAt ? formatDate(selectedUser.lastLoginAt) : 'Never'}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleUserAction(selectedUser.id, 'status', 'SUSPENDED')}
                  disabled={actionLoading === selectedUser.id}
                >
                  {actionLoading === selectedUser.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ShieldOff className="h-4 w-4 mr-2" />
                  )}
                  Suspend
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleUserAction(selectedUser.id, 'status', 'ACTIVE')}
                  disabled={actionLoading === selectedUser.id}
                >
                  {actionLoading === selectedUser.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Shield className="h-4 w-4 mr-2" />
                  )}
                  Activate
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowUserDetails(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
