import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Clock, User, Star, ArrowLeft, MessageCircle, Shield } from 'lucide-react';

export default function TaskDetail() {
  const { id } = useParams();
  const { tasks, assignTask } = useTaskStore();
  const { user, isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [isApplying, setIsApplying] = useState(false);

  const task = tasks.find(t => t.id === id);

  if (!task) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Task Not Found</h1>
            <p className="text-muted-foreground mt-2">The task you're looking for doesn't exist.</p>
            <Link to="/browse">
              <Button className="mt-4">Back to Browse</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleApplyForTask = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to apply for tasks",
        variant: "destructive",
      });
      return;
    }

    if (user.role !== 'TASKER') {
      toast({
        title: "Tasker Account Required",
        description: "Only taskers can apply for tasks",
        variant: "destructive",
      });
      return;
    }

    setIsApplying(true);
    
    // Simulate API call
    setTimeout(() => {
      assignTask(task.id, user.id);
      setIsApplying(false);
      toast({
        title: "Application Sent!",
        description: "You've successfully applied for this task",
      });
    }, 1000);
  };

  const canApply = isAuthenticated && user?.role === 'TASKER' && task.status === 'OPEN';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Back Button */}
          <Link to="/browse">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Browse
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Task Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-2xl">{task.title}</CardTitle>
                    <Badge variant="default">{task.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">{task.description}</p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-muted-foreground">{task.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Scheduled</p>
                        <p className="text-muted-foreground">
                          {new Date(task.scheduledAt).toLocaleDateString()} at{' '}
                          {new Date(task.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold">Requirements</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Must bring own cleaning supplies</li>
                      <li>Previous cleaning experience preferred</li>
                      <li>Available for 2-3 hours</li>
                      <li>Must be reliable and punctual</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Chat Section */}
              {task.status !== 'OPEN' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Task Chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{task.client.firstName[0]}{task.client.lastName[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{task.client.firstName}</p>
                          <p className="text-sm text-muted-foreground">Hi! Looking forward to working with you on this task.</p>
                        </div>
                      </div>
                      
                      {task.assignedTasker && (
                        <div className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{task.assignedTasker.firstName[0]}{task.assignedTasker.lastName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{task.assignedTasker.firstName}</p>
                            <p className="text-sm text-muted-foreground">Thanks! I'll be there on time and bring all necessary supplies.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="space-y-4">
                    <div>
                      <p className="text-3xl font-bold text-primary">₵{task.price}</p>
                      <p className="text-muted-foreground">Fixed price</p>
                    </div>
                    
                    {canApply ? (
                      <Button 
                        onClick={handleApplyForTask} 
                        disabled={isApplying}
                        className="w-full" 
                        variant="hero"
                        size="lg"
                      >
                        {isApplying ? 'Applying...' : 'Apply for Task'}
                      </Button>
                    ) : task.status === 'ASSIGNED' ? (
                      <div className="space-y-2">
                        <Badge variant="secondary" className="w-full py-2">Task Assigned</Badge>
                        <Button variant="outline" className="w-full">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Contact Client
                        </Button>
                      </div>
                    ) : !isAuthenticated ? (
                      <Link to="/">
                        <Button className="w-full" variant="hero" size="lg">
                          Sign In to Apply
                        </Button>
                      </Link>
                    ) : (
                      <p className="text-muted-foreground">Only taskers can apply for tasks</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Client Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-lg">
                        {task.client.firstName[0]}{task.client.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{task.client.firstName} {task.client.lastName}</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-current text-yellow-500" />
                        <span className="text-sm text-muted-foreground">4.8 (24 reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span>Identity verified</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Member since Jan 2024</p>
                  </div>
                </CardContent>
              </Card>

              {/* Safety Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Safety Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• Always communicate through the app</p>
                  <p>• Meet in public places when possible</p>
                  <p>• Trust your instincts</p>
                  <p>• Report any suspicious behavior</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}