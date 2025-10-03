import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuthStore } from '@/stores/authStore';
import { Bell, Menu, User, LogOut, Settings, Wallet, MessageCircle } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
  showMobileMenu?: boolean;
}

export function Header({ onMenuClick, showMobileMenu = false }: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'TASKER':
        return 'default';
      case 'CLIENT':
        return 'secondary';
      case 'ADMIN':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-soft">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          {showMobileMenu && (
            <Button variant="ghost" size="icon" onClick={onMenuClick}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">TM</span>
            </div>
            <span className="font-semibold text-lg">TaskMarket</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              <Link to="/messages">
                <Button variant="ghost" size="icon" className="relative">
                  <MessageCircle className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profilePhotoUrl} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getUserInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium">{user.firstName}</span>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                        {user.role}
                      </Badge>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <Link to="/dashboard">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link to="/admin">
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Panel
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuItem>
                    <Wallet className="mr-2 h-4 w-4" />
                    Wallet
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setAuthModalOpen(true)}>Sign In</Button>
              <Button variant="hero" onClick={() => setAuthModalOpen(true)}>Get Started</Button>
            </div>
          )}
        </div>
      </div>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </header>
  );
}