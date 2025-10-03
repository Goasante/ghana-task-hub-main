import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function DesignSystemDemo() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
          Enhanced Design System
        </h1>
        <p className="text-xl text-muted-foreground">
          New design tokens and components from cursor-phased-genesis
        </p>
      </div>

      {/* Button Variants */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Enhanced Button Variants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Default</Button>
            <Button variant="hero">Hero</Button>
            <Button variant="premium">Premium</Button>
            <Button variant="glow">Glow</Button>
            <Button variant="card">Card</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
          </div>
        </CardContent>
      </Card>

      {/* Color System */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Enhanced Color System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="w-full h-16 bg-primary rounded-lg shadow-primary"></div>
              <p className="text-sm font-medium">Primary</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-primary-light rounded-lg shadow-soft"></div>
              <p className="text-sm font-medium">Primary Light</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-secondary rounded-lg shadow-soft"></div>
              <p className="text-sm font-medium">Secondary</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-secondary-light rounded-lg shadow-soft"></div>
              <p className="text-sm font-medium">Secondary Light</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gradients */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Enhanced Gradients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="w-full h-16 gradient-primary rounded-lg shadow-primary"></div>
              <p className="text-sm font-medium">Gradient Primary</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 gradient-hero rounded-lg shadow-large"></div>
              <p className="text-sm font-medium">Gradient Hero</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 gradient-accent rounded-lg shadow-medium"></div>
              <p className="text-sm font-medium">Gradient Accent</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shadows */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Enhanced Shadow System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="w-full h-16 bg-card rounded-lg shadow-soft"></div>
              <p className="text-sm font-medium">Shadow Soft</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-card rounded-lg shadow-medium"></div>
              <p className="text-sm font-medium">Shadow Medium</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-card rounded-lg shadow-large"></div>
              <p className="text-sm font-medium">Shadow Large</p>
            </div>
            <div className="space-y-2">
              <div className="w-full h-16 bg-card rounded-lg shadow-primary"></div>
              <p className="text-sm font-medium">Shadow Primary</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Animations */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Enhanced Animations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-16 h-16 bg-primary rounded-lg shadow-glow animate-glow"></div>
            <div className="w-16 h-16 bg-secondary rounded-lg shadow-medium animate-float"></div>
            <div className="w-16 h-16 bg-accent rounded-lg shadow-soft animate-pulse"></div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Glow, Float, and Pulse animations for enhanced interactivity
          </p>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
            <h3 className="font-semibold text-primary mb-2">Gradient Background</h3>
            <p className="text-sm text-muted-foreground">
              Using gradient-primary with subtle opacity for background highlights
            </p>
          </div>
          
          <div className="p-4 bg-card rounded-lg shadow-card border border-border">
            <h3 className="font-semibold text-foreground mb-2">Card with Enhanced Shadow</h3>
            <p className="text-sm text-muted-foreground">
              Using shadow-card for subtle depth and professional appearance
            </p>
          </div>

          <div className="flex gap-2">
            <Badge variant="default" className="shadow-soft">Soft Shadow</Badge>
            <Badge variant="secondary" className="shadow-medium">Medium Shadow</Badge>
            <Badge className="bg-primary text-primary-foreground shadow-primary">Primary Shadow</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
