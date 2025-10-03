import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockTaskers } from '@/data/mockData';
import { Star, MapPin, Award, ArrowRight } from 'lucide-react';

export function FeaturedTaskers() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Top-Rated Taskers</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Meet our highest-rated professionals ready to help with your tasks
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {mockTaskers.slice(0, 6).map((tasker) => (
            <Card 
              key={tasker.id} 
              className="group cursor-pointer hover:shadow-large transition-all duration-300 hover:-translate-y-2 gradient-card"
            >
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                    <AvatarImage src={tasker.profilePhoto} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                      {tasker.userId.slice(-2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">Tasker #{tasker.userId.slice(-3)}</h3>
                      {tasker.verifiedBadges.includes('ID_VERIFIED') && (
                        <Badge variant="secondary" className="text-xs bg-accent/20 text-accent border-accent/30">
                          <Award className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="font-medium">{tasker.ratingsAvg}</span>
                      <span className="text-muted-foreground text-sm">
                        ({tasker.ratingsCount} reviews)
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{tasker.serviceAreas.slice(0, 2).join(', ')}</span>
                      {tasker.serviceAreas.length > 2 && (
                        <span>+{tasker.serviceAreas.length - 2} more</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {tasker.bio}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {tasker.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {tasker.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{tasker.skills.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Stats */}
                <div className="flex justify-between items-center mb-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Rate: </span>
                    <span className="font-semibold text-primary">₵{tasker.hourlyRateGHS}/hr</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Completed: </span>
                    <span className="font-semibold">{tasker.completedTasks}</span>
                  </div>
                </div>

                {/* Action */}
                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  View Profile
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="hero" size="lg">
            Browse All Taskers
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}