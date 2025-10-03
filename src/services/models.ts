// Data models and validation for Ghana Task Hub
import { z } from 'zod';

// Enums
export enum TaskStatus {
  CREATED = 'CREATED',
  ASSIGNED = 'ASSIGNED',
  EN_ROUTE = 'EN_ROUTE',
  ON_SITE = 'ON_SITE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// User validation schemas
export const UserSchema = z.object({
  id: z.string(),
  role: z.enum(['CLIENT', 'TASKER', 'ADMIN']),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().regex(/^\+233\d{9}$/, 'Invalid Ghana phone number'),
  email: z.string().email().optional(),
  profilePhotoUrl: z.string().url().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateUserSchema = CreateUserSchema.partial();

// Task validation schemas
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  clientId: z.string(),
  taskerId: z.string().optional(),
  categoryId: z.string(),
  addressId: z.string(),
  scheduledAt: z.string(),
  durationEstMins: z.number().min(15, 'Minimum duration is 15 minutes'),
  status: z.enum(['CREATED', 'ASSIGNED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS', 'COMPLETED', 'DISPUTED', 'CANCELLED']),
  priceGHS: z.number().min(10, 'Minimum price is ₵10'),
  platformFeeGHS: z.number(),
  currency: z.string().default('GHS'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  isUrgent: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateTaskSchema = TaskSchema.omit({
  id: true,
  platformFeeGHS: true,
  currency: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

// Address validation schemas
export const AddressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  label: z.string().min(1, 'Label is required'),
  street: z.string().min(5, 'Street address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  region: z.string().min(2, 'Region is required'),
  ghpost_gps: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateAddressSchema = AddressSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

// Category validation schemas
export const CategorySchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  baseRateGHS: z.number().min(10, 'Base rate must be at least ₵10'),
  pricingModel: z.enum(['HOURLY', 'FIXED']),
});

// Tasker Profile validation schemas
export const TaskerProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  bio: z.string().min(20, 'Bio must be at least 20 characters').optional(),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  ratingsAvg: z.number().min(0).max(5),
  ratingsCount: z.number().min(0),
  verifiedBadges: z.array(z.string()),
  kycStatus: z.enum(['NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateTaskerProfileSchema = TaskerProfileSchema.omit({
  id: true,
  userId: true,
  ratingsAvg: true,
  ratingsCount: true,
  verifiedBadges: true,
  kycStatus: true,
  createdAt: true,
  updatedAt: true,
});

// Message validation schemas
export const MessageSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  senderId: z.string(),
  messageText: z.string().min(1, 'Message cannot be empty'),
  attachments: z.array(z.object({
    type: z.string(),
    url: z.string().url(),
  })).optional(),
  createdAt: z.string(),
});

export const CreateMessageSchema = MessageSchema.omit({
  id: true,
  createdAt: true,
});

// Payment validation schemas
export const PaymentSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  userId: z.string(),
  amountGHS: z.number().min(1, 'Amount must be at least ₵1'),
  currency: z.string().default('GHS'),
  provider: z.string(),
  providerChargeId: z.string(),
  status: z.enum(['pending', 'successful', 'failed']),
  metadata: z.record(z.any()).optional(),
  createdAt: z.string(),
});

export const CreatePaymentSchema = PaymentSchema.omit({
  id: true,
  providerChargeId: true,
  status: true,
  createdAt: true,
});

// Review validation schemas
export const ReviewSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  authorId: z.string(),
  targetId: z.string(),
  rating: z.number().min(1).max(5),
  text: z.string().optional(),
  createdAt: z.string(),
});

export const CreateReviewSchema = ReviewSchema.omit({
  id: true,
  createdAt: true,
});

// Authentication schemas
export const LoginSchema = z.object({
  phone: z.string().regex(/^\+233\d{9}$/, 'Invalid Ghana phone number'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const RequestOTPSchema = z.object({
  phone: z.string().regex(/^\+233\d{9}$/, 'Invalid Ghana phone number'),
});

export const RegisterSchema = z.object({
  phone: z.string().regex(/^\+233\d{9}$/, 'Invalid Ghana phone number'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email().optional(),
  role: z.enum(['CLIENT', 'TASKER']),
});

// Search and filter schemas
export const TaskSearchSchema = z.object({
  query: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.string().optional(),
  clientId: z.string().optional(),
  taskerId: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  location: z.string().optional(),
  priority: z.string().optional(),
  isUrgent: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});

export const TaskerSearchSchema = z.object({
  query: z.string().optional(),
  skills: z.array(z.string()).optional(),
  minRating: z.number().min(0).max(5).optional(),
  location: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});

// Type exports
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

export type Task = z.infer<typeof TaskSchema>;
export type CreateTask = z.infer<typeof CreateTaskSchema>;
export type UpdateTask = z.infer<typeof UpdateTaskSchema>;

export type Address = z.infer<typeof AddressSchema>;
export type CreateAddress = z.infer<typeof CreateAddressSchema>;

export type Category = z.infer<typeof CategorySchema>;

export type TaskerProfile = z.infer<typeof TaskerProfileSchema>;
export type CreateTaskerProfile = z.infer<typeof CreateTaskerProfileSchema>;

export type Message = z.infer<typeof MessageSchema>;
export type CreateMessage = z.infer<typeof CreateMessageSchema>;

export type Payment = z.infer<typeof PaymentSchema>;
export type CreatePayment = z.infer<typeof CreatePaymentSchema>;

export type Review = z.infer<typeof ReviewSchema>;
export type CreateReview = z.infer<typeof CreateReviewSchema>;

export type LoginData = z.infer<typeof LoginSchema>;
export type RequestOTPData = z.infer<typeof RequestOTPSchema>;
export type RegisterData = z.infer<typeof RegisterSchema>;

export type TaskSearch = z.infer<typeof TaskSearchSchema>;
export type TaskerSearch = z.infer<typeof TaskerSearchSchema>;

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
