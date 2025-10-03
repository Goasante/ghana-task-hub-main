// User Service - Business logic for user management
import { apiService, API_ENDPOINTS } from './api';
import { 
  User, 
  CreateUser, 
  UpdateUser,
  TaskerProfile,
  CreateTaskerProfile,
  Address,
  CreateAddress,
  ApiResponse,
  PaginatedResponse 
} from './models';

export class UserService {
  // Get user profile
  async getProfile(): Promise<ApiResponse<User>> {
    return apiService.get<User>(API_ENDPOINTS.USERS.PROFILE);
  }

  // Update user profile
  async updateProfile(updates: UpdateUser): Promise<ApiResponse<User>> {
    return apiService.put<User>(API_ENDPOINTS.USERS.UPDATE_PROFILE, updates);
  }

  // Upload profile photo
  async uploadAvatar(file: File): Promise<ApiResponse<{ url: string }>> {
    return apiService.uploadFile<{ url: string }>(API_ENDPOINTS.USERS.UPLOAD_AVATAR, file);
  }

  // Get tasker profile
  async getTaskerProfile(userId: string): Promise<ApiResponse<TaskerProfile>> {
    return apiService.get<TaskerProfile>(API_ENDPOINTS.TASKERS.PROFILE(userId));
  }

  // Create or update tasker profile
  async updateTaskerProfile(profileData: CreateTaskerProfile): Promise<ApiResponse<TaskerProfile>> {
    return apiService.put<TaskerProfile>(API_ENDPOINTS.TASKERS.PROFILE('current'), profileData);
  }

  // Search taskers
  async searchTaskers(searchParams: {
    query?: string;
    skills?: string[];
    minRating?: number;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<User & { taskerProfile?: TaskerProfile }>>> {
    const params = new URLSearchParams();
    
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => params.append(key, item));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    const endpoint = `${API_ENDPOINTS.TASKERS.SEARCH}${params.toString() ? `?${params.toString()}` : ''}`;
    return apiService.get<PaginatedResponse<User & { taskerProfile?: TaskerProfile }>>(endpoint);
  }

  // Get user addresses
  async getAddresses(): Promise<ApiResponse<Address[]>> {
    return apiService.get<Address[]>('/users/addresses');
  }

  // Create new address
  async createAddress(addressData: CreateAddress): Promise<ApiResponse<Address>> {
    return apiService.post<Address>('/users/addresses', addressData);
  }

  // Update address
  async updateAddress(addressId: string, updates: Partial<CreateAddress>): Promise<ApiResponse<Address>> {
    return apiService.put<Address>(`/users/addresses/${addressId}`, updates);
  }

  // Delete address
  async deleteAddress(addressId: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/users/addresses/${addressId}`);
  }

  // Set default address
  async setDefaultAddress(addressId: string): Promise<ApiResponse<User>> {
    return apiService.put<User>('/users/default-address', { addressId });
  }

  // Validate Ghana phone number
  validateGhanaPhoneNumber(phone: string): { isValid: boolean; formatted: string; error?: string } {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Check if it starts with 233 (Ghana country code)
    if (digits.startsWith('233')) {
      if (digits.length === 12) {
        return {
          isValid: true,
          formatted: `+${digits}`,
        };
      } else {
        return {
          isValid: false,
          formatted: `+${digits}`,
          error: 'Invalid Ghana phone number length',
        };
      }
    }
    
    // Check if it starts with 0 (local format)
    if (digits.startsWith('0')) {
      if (digits.length === 10) {
        const formatted = `+233${digits.substring(1)}`;
        return {
          isValid: true,
          formatted,
        };
      } else {
        return {
          isValid: false,
          formatted: `+233${digits.substring(1)}`,
          error: 'Invalid local phone number length',
        };
      }
    }
    
    // Check if it's a 9-digit number (without country code or leading zero)
    if (digits.length === 9) {
      const formatted = `+233${digits}`;
      return {
        isValid: true,
        formatted,
      };
    }
    
    return {
      isValid: false,
      formatted: phone,
      error: 'Invalid phone number format',
    };
  }

  // Format phone number for display
  formatPhoneForDisplay(phone: string): string {
    const validation = this.validateGhanaPhoneNumber(phone);
    if (!validation.isValid) return phone;
    
    const digits = validation.formatted.replace('+233', '');
    return `+233 ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6)}`;
  }

  // Get user initials
  getUserInitials(user: User): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  // Get user display name
  getUserDisplayName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  // Check if user is tasker
  isTasker(user: User): boolean {
    return user.role === 'TASKER';
  }

  // Check if user is client
  isClient(user: User): boolean {
    return user.role === 'CLIENT';
  }

  // Check if user is admin
  isAdmin(user: User): boolean {
    return user.role === 'ADMIN';
  }

  // Get user role badge info
  getUserRoleInfo(role: User['role']) {
    const roleMap = {
      CLIENT: { 
        label: 'Client', 
        color: 'blue', 
        description: 'Books and pays for tasks' 
      },
      TASKER: { 
        label: 'Tasker', 
        color: 'green', 
        description: 'Provides services and earns money' 
      },
      ADMIN: { 
        label: 'Admin', 
        color: 'red', 
        description: 'Manages the platform' 
      },
    };

    return roleMap[role] || roleMap.CLIENT;
  }

  // Validate user profile data
  validateUserProfile(userData: CreateUser): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!userData.firstName) errors.push('First name is required');
    if (!userData.lastName) errors.push('Last name is required');
    if (!userData.phone) errors.push('Phone number is required');
    if (!userData.role) errors.push('Role is required');

    // Validate phone number
    if (userData.phone) {
      const phoneValidation = this.validateGhanaPhoneNumber(userData.phone);
      if (!phoneValidation.isValid) {
        errors.push(phoneValidation.error || 'Invalid phone number');
      }
    }

    // Validate email if provided
    if (userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        errors.push('Invalid email address');
      }
    }

    // Validate name length
    if (userData.firstName && userData.firstName.length < 2) {
      errors.push('First name must be at least 2 characters');
    }
    if (userData.lastName && userData.lastName.length < 2) {
      errors.push('Last name must be at least 2 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Get tasker verification status
  getTaskerVerificationStatus(taskerProfile: TaskerProfile) {
    const badges = taskerProfile.verifiedBadges || [];
    const kycStatus = taskerProfile.kycStatus;
    
    return {
      isVerified: kycStatus === 'APPROVED' && badges.length > 0,
      hasIdVerification: badges.includes('ID_VERIFIED'),
      hasBackgroundCheck: badges.includes('BACKGROUND_CHECK'),
      hasSkillCertification: badges.includes('SKILL_CERTIFIED'),
      kycStatus,
      verificationScore: this.calculateVerificationScore(badges, kycStatus),
    };
  }

  // Calculate verification score
  private calculateVerificationScore(badges: string[], kycStatus: string): number {
    let score = 0;
    
    // KYC status weight
    switch (kycStatus) {
      case 'APPROVED': score += 40; break;
      case 'PENDING': score += 20; break;
      case 'NOT_SUBMITTED': score += 0; break;
      case 'REJECTED': score += 0; break;
    }
    
    // Badge weights
    if (badges.includes('ID_VERIFIED')) score += 20;
    if (badges.includes('BACKGROUND_CHECK')) score += 20;
    if (badges.includes('SKILL_CERTIFIED')) score += 10;
    if (badges.includes('VEHICLE_VERIFIED')) score += 5;
    if (badges.includes('EDUCATION_VERIFIED')) score += 5;
    
    return Math.min(score, 100);
  }
}

// Export singleton instance
export const userService = new UserService();
