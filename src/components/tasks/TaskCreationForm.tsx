// Task Creation Form Component
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, MapPin, Clock, DollarSign, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '@/stores/authStore';
import { taskService } from '@/services/taskService';
import { categories } from '@/data/mockData';
import { Task, TaskStatus, TaskPriority } from '@/services/models';
import { useToast } from '@/hooks/use-toast';

interface TaskCreationFormProps {
  onSuccess?: (taskId: string) => void;
  onCancel?: () => void;
}

export function TaskCreationForm({ onSuccess, onCancel }: TaskCreationFormProps) {
  const [formData, setFormData] = useState<Partial<any>>({
    title: '',
    description: '',
    categoryId: '',
    addressId: '',
    scheduledAt: '',
    durationEstMins: 60,
    priceGHS: 50,
    priority: 'MEDIUM',
    isUrgent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');

  const { user } = useAuthStore();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && selectedTime) {
      const [hours, minutes] = selectedTime.split(':');
      const scheduledDateTime = new Date(date);
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));
      handleInputChange('scheduledAt', scheduledDateTime.toISOString());
    }
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    if (selectedDate && time) {
      const [hours, minutes] = time.split(':');
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));
      handleInputChange('scheduledAt', scheduledDateTime.toISOString());
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Task description is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (!formData.scheduledAt) {
      newErrors.scheduledAt = 'Please select date and time';
    } else {
      const scheduledDate = new Date(formData.scheduledAt);
      if (scheduledDate <= new Date()) {
        newErrors.scheduledAt = 'Scheduled time must be in the future';
      }
    }

    if (!formData.durationEstMins || formData.durationEstMins < 15) {
      newErrors.durationEstMins = 'Minimum duration is 15 minutes';
    }

    if (!formData.priceGHS || formData.priceGHS < 10) {
      newErrors.priceGHS = 'Minimum price is ₵10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) {
      return;
    }

    setIsSubmitting(true);

    try {
      const createTaskData: any = {
        title: formData.title!,
        description: formData.description!,
        categoryId: formData.categoryId!,
        clientId: user.id,
        addressId: formData.addressId || 'default-address', // TODO: Implement address selection
        scheduledAt: formData.scheduledAt!,
        durationEstMins: formData.durationEstMins!,
        priceGHS: formData.priceGHS!,
        priority: formData.priority || 'MEDIUM',
        isUrgent: formData.isUrgent || false,
      };

      const response = await taskService.createTask(createTaskData);
      
      if (response.success && response.data) {
        toast({
          title: "Task Created Successfully!",
          description: "Your task has been posted and is now available for taskers.",
        });
        
        if (onSuccess) {
          onSuccess(response.data.id);
        }
      } else {
        toast({
          title: "Failed to Create Task",
          description: response.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Task creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
  const costBreakdown = taskService.calculateTotalCost(formData.priceGHS || 0);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Task
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide detailed information about the task..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isSubmitting}
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => handleInputChange('categoryId', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <img src={category.icon} alt={category.name} className="w-4 h-4" />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-destructive">{errors.categoryId}</p>
            )}
            {selectedCategory && (
              <p className="text-sm text-muted-foreground">
                {selectedCategory.description}
              </p>
            )}
          </div>

          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Time *</Label>
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>
          {errors.scheduledAt && (
            <p className="text-sm text-destructive">{errors.scheduledAt}</p>
          )}

          {/* Duration and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  max="480"
                  value={formData.durationEstMins}
                  onChange={(e) => handleInputChange('durationEstMins', parseInt(e.target.value) || 0)}
                  className="pl-10"
                  disabled={isSubmitting}
                />
              </div>
              {errors.durationEstMins && (
                <p className="text-sm text-destructive">{errors.durationEstMins}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (₵) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="price"
                  type="number"
                  min="10"
                  max="10000"
                  step="0.01"
                  value={formData.priceGHS}
                  onChange={(e) => handleInputChange('priceGHS', parseFloat(e.target.value) || 0)}
                  className="pl-10"
                  disabled={isSubmitting}
                />
              </div>
              {errors.priceGHS && (
                <p className="text-sm text-destructive">{errors.priceGHS}</p>
              )}
            </div>
          </div>

          {/* Priority Selection */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: TaskPriority) => handleInputChange('priority', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">
                  <Badge variant="secondary">Low Priority</Badge>
                </SelectItem>
                <SelectItem value="MEDIUM">
                  <Badge variant="default">Medium Priority</Badge>
                </SelectItem>
                <SelectItem value="HIGH">
                  <Badge variant="destructive">High Priority</Badge>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cost Breakdown */}
          {formData.priceGHS && formData.priceGHS > 0 && (
            <Alert>
              <AlertDescription>
                <div className="space-y-1">
                  <p><strong>Cost Breakdown:</strong></p>
                  <p>Task Price: ₵{formData.priceGHS.toFixed(2)}</p>
                  <p>Platform Fee (10%): ₵{costBreakdown.fee.toFixed(2)}</p>
                  <p><strong>Total: ₵{costBreakdown.total.toFixed(2)}</strong></p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Task...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Task
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}