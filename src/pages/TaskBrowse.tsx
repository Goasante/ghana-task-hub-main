import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskDetail } from '@/components/tasks/TaskDetail';
import { Task } from '@/services/models';
import { useAuthStore } from '@/stores/authStore';

export default function TaskBrowse() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { user } = useAuthStore();

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setSelectedTask(updatedTask);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Tasks</h1>
          <p className="text-muted-foreground">
            {user?.role === 'TASKER' 
              ? 'Find the perfect tasks for your skills and schedule'
              : 'Discover available services in your area'
            }
          </p>
        </div>

        {selectedTask ? (
          <TaskDetail
            taskId={selectedTask.id}
            onStatusUpdate={handleTaskUpdate}
            onClose={() => setSelectedTask(null)}
          />
        ) : (
          <TaskList
            userRole={user?.role || 'TASKER'}
            userId={user?.id}
            showFilters={true}
            onTaskSelect={handleTaskSelect}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}