import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TaskDashboard } from '@/components/tasks/TaskDashboard';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <TaskDashboard />
      </main>
      
      <Footer />
    </div>
  );
}