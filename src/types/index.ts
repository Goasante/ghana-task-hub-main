export interface Category {
  id: string;
  name: string;
  description: string;
  baseRateGHS: number;
  icon: string;
  subcategories: string[];
}

export interface TaskerProfile {
  id: string;
  userId: string;
  bio: string;
  skills: string[];
  serviceAreas: string[];
  ratingsAvg: number;
  ratingsCount: number;
  verifiedBadges: string[];
  profilePhoto?: string;
  hourlyRateGHS: number;
  completedTasks: number;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  region: string;
  gpsCode?: string;
  lat?: number;
  lng?: number;
}

export interface Payment {
  id: string;
  taskId: string;
  userId: string;
  amountGHS: number;
  provider: 'MTN_MOMO' | 'VODAFONE_CASH' | 'AIRTELTIGO_MONEY' | 'CARD';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  createdAt: string;
}

export interface Review {
  id: string;
  taskId: string;
  authorId: string;
  targetId: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  taskId: string;
  senderId: string;
  messageText: string;
  attachments?: string[];
  createdAt: string;
}