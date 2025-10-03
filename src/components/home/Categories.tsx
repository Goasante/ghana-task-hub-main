import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { categories } from '@/data/mockData';
import { ArrowRight } from 'lucide-react';
import categoriesImage from '@/assets/categories-grid.jpg';

export function Categories() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Services</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From house cleaning to handyman services, find skilled taskers for every need
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.slice(0, 6).map((category) => (
            <Card 
              key={category.id} 
              className="group cursor-pointer hover:shadow-medium transition-all duration-300 hover:-translate-y-1 gradient-card"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Starting at</div>
                    <div className="font-bold text-lg text-primary">₵{category.baseRateGHS}</div>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  {category.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {category.subcategories.slice(0, 3).map((sub) => (
                    <span 
                      key={sub} 
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                    >
                      {sub}
                    </span>
                  ))}
                  {category.subcategories.length > 3 && (
                    <span className="text-xs text-muted-foreground px-2 py-1">
                      +{category.subcategories.length - 3} more
                    </span>
                  )}
                </div>
                
                <Link to="/browse">
                  <Button variant="ghost" className="w-full group-hover:bg-primary/10 transition-colors">
                    Browse Taskers
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Categories Visual */}
        <div className="relative">
          <img
            src={categoriesImage}
            alt="Various task categories including cleaning, handyman, delivery, and more"
            className="w-full h-64 object-cover rounded-2xl shadow-large"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent rounded-2xl"></div>
          <div className="absolute bottom-6 left-6">
            <h3 className="text-2xl font-bold mb-2">Ready to get started?</h3>
            <Link to="/browse">
              <Button variant="premium" size="lg">
                Book Your First Task
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}