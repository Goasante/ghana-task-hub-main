import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';
import { Categories } from '@/components/home/Categories';
import { FeaturedTaskers } from '@/components/home/FeaturedTaskers';
import { HowItWorks } from '@/components/home/HowItWorks';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Categories />
        <FeaturedTaskers />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
