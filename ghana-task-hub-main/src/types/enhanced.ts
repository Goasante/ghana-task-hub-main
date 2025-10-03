// Enhanced types based on the Gemini app's production-ready schema

export enum UserRole {
  CLIENT = 'CLIENT',
  TASKER = 'TASKER',
  ADMIN = 'ADMIN'
}

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

export enum KycStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum PayoutMethod {
  MTN_MOMO = 'MTN_MOMO',
  VODAFONE_CASH = 'VODAFONE_CASH',
  AIRTELTIGO_MONEY = 'AIRTELTIGO_MONEY'
}

export enum PayoutStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface EnhancedUser {
  id: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  profilePhotoUrl?: string;
  suspendedAt?: string;
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relationships
  defaultAddressId?: string;
  taskerProfile?: TaskerProfile;
  wallet?: Wallet;
}

export interface TaskerProfile {
  id: string;
  userId: string;
  bio?: string;
  skills: string[];
  ratingsAvg: number;
  ratingsCount: number;
  verifiedBadges: string[];
  kycStatus: KycStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string; // e.g., "Home", "Work"
  street: string;
  ghpost_gps?: string; // Ghana Post GPS code
  city: string;
  region: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  baseRateGHS: number;
  pricingModel: 'HOURLY' | 'FIXED';
  subServices: SubService[];
}

export interface SubService {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
}

export interface EnhancedTask {
  id: string;
  clientId: string;
  taskerId?: string;
  categoryId: string;
  addressId: string;
  scheduledAt: string;
  durationEstMins: number;
  status: TaskStatus;
  priceGHS: number;
  platformFeeGHS: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  
  // Relationships
  client: EnhancedUser;
  tasker?: EnhancedUser;
  category: Category;
  address: Address;
  events: TaskEvent[];
  messages: TaskMessage[];
  payment?: Payment;
  reviews: Review[];
}

export interface TaskEvent {
  id: string;
  taskId: string;
  type: string; // e.g., "STATUS_CHANGE", "NOTE_ADDED"
  payload?: any;
  createdAt: string;
}

export interface TaskMessage {
  id: string;
  taskId: string;
  senderId: string;
  messageText: string;
  attachments?: Array<{
    type: string;
    url: string;
  }>;
  createdAt: string;
  
  sender: EnhancedUser;
}

export interface Payment {
  id: string;
  taskId: string;
  userId: string;
  amountGHS: number;
  currency: string;
  provider: string; // "paystack", "flutterwave"
  providerChargeId: string;
  status: 'pending' | 'successful' | 'failed';
  metadata?: any;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balanceGHS: number;
  reservedGHS: number; // Funds held for pending payouts
  updatedAt: string;
}

export interface Payout {
  id: string;
  taskerId: string;
  amountGHS: number;
  method: PayoutMethod;
  status: PayoutStatus;
  providerRef?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  taskId: string;
  authorId: string;
  targetId: string;
  rating: number;
  text?: string;
  createdAt: string;
  
  author: EnhancedUser;
  target: EnhancedUser;
}

export interface KycDocument {
  id: string;
  userId: string;
  type: string; // "GHANA_CARD_FRONT", "GHANA_CARD_BACK", "SELFIE"
  documentUrl: string;
  status: KycStatus;
  reviewerId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  taskId?: string;
  type: string; // "payment_dispute", "account_issue", etc.
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  subject: string;
  messages: Array<{
    senderId: string;
    text: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  refreshToken: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: string;
  createdAt: string;
}

export interface DeviceToken {
  id: string;
  userId: string;
  token: string;
  platform: 'ios' | 'android';
  createdAt: string;
}
