import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Users, Star, Smartphone } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: 'Describe Your Task',
      description: 'Tell us what you need done and when',
      details: 'Be specific about your requirements, location, and timeline',
    },
    {
      icon: Users,
      title: 'Get Matched',
      description: 'We connect you with qualified taskers',
      details: 'Review profiles, ratings, and pricing from nearby taskers',
    },
    {
      icon: Star,
      title: 'Task Completed',
      description: 'Your tasker completes the job perfectly',
      details: 'Track progress, chat with your tasker, and pay securely',
    },
    {
      icon: Smartphone,
      title: 'Rate & Review',
      description: 'Share your experience to help others',
      details: 'Leave feedback and build trust in our community',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How TaskMarket Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Getting help has never been easier. Just four simple steps to get your task done.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card 
                key={index} 
                className="relative group hover:shadow-medium transition-all duration-300 hover:-translate-y-1 gradient-card"
              >
                <CardContent className="p-6 text-center">
                  {/* Step Number */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm shadow-medium">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className="mb-4 flex justify-center">
                    <div className="p-4 bg-primary/10 rounded-2xl group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    {step.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {step.details}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Mobile Money Integration */}
        <Card className="mt-12 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Pay with Mobile Money</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Seamlessly pay with MTN Mobile Money, Vodafone Cash, or AirtelTigo Money. 
              Secure transactions with instant confirmations.
            </p>
            <div className="flex justify-center items-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">MTN</div>
                <div className="text-sm text-muted-foreground">Mobile Money</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">Vodafone</div>
                <div className="text-sm text-muted-foreground">Cash</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">AirtelTigo</div>
                <div className="text-sm text-muted-foreground">Money</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}