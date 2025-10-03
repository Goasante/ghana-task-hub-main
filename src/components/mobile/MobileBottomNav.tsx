// Mobile Bottom Navigation Component
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Search, 
  Plus, 
  MessageCircle, 
  User,
  ClipboardList
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  className?: string;
}

export function MobileBottomNav({ className }: MobileBottomNavProps) {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: Home,
      requiresAuth: false,
    },
    {
      name: 'Browse',
      path: '/browse',
      icon: Search,
      requiresAuth: false,
    },
    {
      name: 'Create',
      path: '/dashboard?tab=create',
      icon: Plus,
      requiresAuth: true,
      roles: ['CLIENT'],
    },
    {
      name: 'Messages',
      path: '/messages',
      icon: MessageCircle,
      requiresAuth: true,
      badge: 3, // Mock unread count
    },
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: isAuthenticated && user?.role === 'TASKER' ? ClipboardList : User,
      requiresAuth: true,
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path.includes('?')) {
      const [basePath, query] = path.split('?');
      return location.pathname === basePath && location.search.includes(query.split('=')[1]);
    }
    return location.pathname.startsWith(path);
  };

  const isItemVisible = (item: typeof navItems[0]) => {
    if (item.requiresAuth && !isAuthenticated) return false;
    if (item.roles && user && !item.roles.includes(user.role)) return false;
    return true;
  };

  const visibleItems = navItems.filter(isItemVisible);

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t shadow-lg md:hidden",
      className
    )}>
      <div className="grid grid-cols-5 gap-1 px-2 py-1">
        {visibleItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link key={item.name} to={item.path}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col items-center justify-center h-16 w-full gap-1 text-xs font-medium transition-colors",
                  active 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <div className="relative">
                  <Icon className={cn(
                    "h-5 w-5 transition-colors",
                    active ? "text-primary" : "text-muted-foreground"
                  )} />
                  {item.badge && item.badge > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </Badge>
                  )}
                </div>
                <span className={cn(
                  "text-xs transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.name}
                </span>
              </Button>
            </Link>
          );
        })}
        
        {/* Fill remaining columns if less than 5 items */}
        {visibleItems.length < 5 && (
          <>
            {[...Array(5 - visibleItems.length)].map((_, index) => (
              <div key={`spacer-${index}`} className="h-16" />
            ))}
          </>
        )}
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-background" />
    </nav>
  );
}
