import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuthStore } from '@/stores/authStore';
import { Search, Star, Users, CheckCircle } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';

export function Hero() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated } = useAuthStore();

  const stats = [
    { icon: Users, value: '10,000+', label: 'Active Taskers' },
    { icon: CheckCircle, value: '50,000+', label: 'Tasks Completed' },
    { icon: Star, value: '4.9', label: 'Average Rating' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"></div>
      
      <div className="relative container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                  Ghana's #1
                </span>
                <br />
                Task Marketplace
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Connect with skilled taskers for cleaning, repairs, delivery, and more. 
                Fast, reliable, and trusted by thousands across Accra.
              </p>
            </div>

            {/* Search Bar */}
            <Card className="p-1 shadow-medium">
              <CardContent className="p-0">
                <div className="flex">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="What do you need help with?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-0 pl-12 focus-visible:ring-0 text-lg h-14"
                    />
                  </div>
                  <Link to="/browse">
                    <Button variant="hero" size="lg" className="h-14 px-8">
                      Find Taskers
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* CTA Buttons */}
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="premium" 
                  size="lg" 
                  className="text-lg px-8"
                  onClick={() => setAuthModalOpen(true)}
                >
                  Get Started
                </Button>
                <Link to="/browse">
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    Become a Tasker
                  </Button>
                </Link>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              {stats.map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center">
                  <div className="flex justify-center mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="font-bold text-2xl">{value}</div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src={heroImage}
                alt="Ghana task marketplace connecting clients with skilled taskers"
                className="w-full h-auto rounded-2xl shadow-large animate-float"
              />
            </div>
            {/* Floating Cards */}
            <Card className="absolute -top-4 -left-4 p-4 bg-card/90 backdrop-blur shadow-medium animate-float z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-semibold">Task Completed!</div>
                  <div className="text-sm text-muted-foreground">₵120 earned</div>
                </div>
              </div>
            </Card>
            
            <Card className="absolute -bottom-4 -right-4 p-4 bg-card/90 backdrop-blur shadow-medium animate-float z-20" style={{ animationDelay: '2s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                  <Star className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <div className="font-semibold">5 Star Rating!</div>
                  <div className="text-sm text-muted-foreground">Excellent service</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </section>
  );
}