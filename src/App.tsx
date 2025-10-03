import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { Categories } from "@/components/home/Categories";
import { TaskList } from "@/components/tasks/TaskList";

// Enhanced pages with Header and Footer
const HomePage = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main>
      <Hero />
      <Categories />
    </main>
    <Footer />
  </div>
);

const BrowsePage = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Tasks</h1>
        <p className="text-muted-foreground">Find the perfect tasks for your skills and schedule</p>
      </div>
      <TaskList userRole="TASKER" showFilters={true} />
    </main>
    <Footer />
  </div>
);

const DashboardPage = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Manage your tasks and track your progress</p>
      </div>
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-4">📊 Dashboard Page</h2>
        <p className="text-muted-foreground">This page will show user analytics and task management</p>
      </div>
    </main>
    <Footer />
  </div>
);

const App = () => (
  <BrowserRouter>
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </div>
  </BrowserRouter>
);

export default App;
