// Authentication Service for Ghana Task Hub
import { apiService, API_ENDPOINTS } from './api';
import { 
  User, 
  LoginData, 
  RequestOTPData, 
  RegisterData,
  ApiResponse 
} from './models';
import { userService } from './userService';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface AuthUser extends User {
  tokens: AuthTokens;
}

export interface OTPResponse {
  message: string;
  expiresIn: number; // seconds
}

export class AuthService {
  private readonly TOKEN_KEY = 'ghana_task_hub_auth';
  private readonly REFRESH_KEY = 'ghana_task_hub_refresh';

  // Request OTP for phone number
  async requestOTP(phone: string): Promise<ApiResponse<OTPResponse>> {
    // Validate phone number first
    const phoneValidation = userService.validateGhanaPhoneNumber(phone);
    if (!phoneValidation.isValid) {
      return {
        data: null as any,
        success: false,
        error: phoneValidation.error || 'Invalid phone number',
      };
    }

    const requestData: RequestOTPData = {
      phone: phoneValidation.formatted,
    };

    return apiService.post<OTPResponse>(API_ENDPOINTS.AUTH.REGISTER, requestData);
  }

  // Verify OTP and login/register
  async verifyOTP(phone: string, otp: string): Promise<ApiResponse<AuthUser>> {
    const phoneValidation = userService.validateGhanaPhoneNumber(phone);
    if (!phoneValidation.isValid) {
      return {
        data: null as any,
        success: false,
        error: phoneValidation.error || 'Invalid phone number',
      };
    }

    const loginData: LoginData = {
      phone: phoneValidation.formatted,
      otp,
    };

    const response = await apiService.post<{ user: User; tokens: AuthTokens }>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      loginData
    );

    if (response.success && response.data) {
      const authUser: AuthUser = {
        ...response.data.user,
        tokens: response.data.tokens,
      };

      // Store tokens securely
      this.storeTokens(authUser.tokens);
      
      // Set token in API service
      apiService.setToken(authUser.tokens.accessToken);

      return {
        data: authUser,
        success: true,
      };
    }

    return {
      data: null as any,
      success: false,
      error: response.error || 'OTP verification failed',
    };
  }

  // Register new user
  async register(userData: RegisterData): Promise<ApiResponse<AuthUser>> {
    // Validate user data
    const validation = userService.validateUserProfile(userData);
    if (!validation.isValid) {
      return {
        data: null as any,
        success: false,
        error: validation.errors.join(', '),
      };
    }

    // Validate and format phone number
    const phoneValidation = userService.validateGhanaPhoneNumber(userData.phone);
    if (!phoneValidation.isValid) {
      return {
        data: null as any,
        success: false,
        error: phoneValidation.error || 'Invalid phone number',
      };
    }

    const registerData: RegisterData = {
      ...userData,
      phone: phoneValidation.formatted,
    };

    const response = await apiService.post<{ user: User; tokens: AuthTokens }>(
      API_ENDPOINTS.AUTH.REGISTER,
      registerData
    );

    if (response.success && response.data) {
      const authUser: AuthUser = {
        ...response.data.user,
        tokens: response.data.tokens,
      };

      // Store tokens securely
      this.storeTokens(authUser.tokens);
      
      // Set token in API service
      apiService.setToken(authUser.tokens.accessToken);

      return {
        data: authUser,
        success: true,
      };
    }

    return {
      data: null as any,
      success: false,
      error: response.error || 'Registration failed',
    };
  }

  // Complete user profile setup (after OTP verification)
  async completeProfile(
    phone: string,
    otp: string,
    profileData: Omit<RegisterData, 'phone'>
  ): Promise<ApiResponse<AuthUser>> {
    // First verify OTP
    const otpResponse = await this.verifyOTP(phone, otp);
    
    if (!otpResponse.success) {
      return otpResponse;
    }

    // Then complete profile registration
    const registerData: RegisterData = {
      ...profileData,
      phone,
    };

    return this.register(registerData);
  }

  // Refresh access token
  async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return {
        data: null as any,
        success: false,
        error: 'No refresh token available',
      };
    }

    const response = await apiService.post<AuthTokens>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      { refreshToken }
    );

    if (response.success && response.data) {
      // Update stored tokens
      this.storeTokens(response.data);
      
      // Update API service token
      apiService.setToken(response.data.accessToken);

      return {
        data: response.data,
        success: true,
      };
    }

    // If refresh fails, clear tokens
    this.clearTokens();
    apiService.setToken(null);

    return {
      data: null as any,
      success: false,
      error: response.error || 'Token refresh failed',
    };
  }

  // Logout user
  async logout(): Promise<ApiResponse<void>> {
    try {
      // Call logout endpoint if we have a token
      const token = this.getAccessToken();
      if (token) {
        await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    }

    // Clear local tokens and state
    this.clearTokens();
    apiService.setToken(null);

    return {
      data: undefined,
      success: true,
    };
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    // Check if token is expired
    try {
      const payload = this.parseJWT(token);
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  // Get current user from stored data
  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(this.TOKEN_KEY);
      if (!userData) return null;

      const parsed = JSON.parse(userData);
      return parsed.user || null;
    } catch {
      return null;
    }
  }

  // Get access token
  getAccessToken(): string | null {
    try {
      const tokenData = localStorage.getItem(this.TOKEN_KEY);
      if (!tokenData) return null;

      const parsed = JSON.parse(tokenData);
      return parsed.accessToken || null;
    } catch {
      return null;
    }
  }

  // Get refresh token
  getRefreshToken(): string | null {
    try {
      const refreshData = localStorage.getItem(this.REFRESH_KEY);
      if (!refreshData) return null;

      const parsed = JSON.parse(refreshData);
      return parsed.refreshToken || null;
    } catch {
      return null;
    }
  }

  // Store tokens securely
  private storeTokens(tokens: AuthTokens): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, JSON.stringify({
        accessToken: tokens.accessToken,
        expiresAt: tokens.expiresAt,
      }));

      localStorage.setItem(this.REFRESH_KEY, JSON.stringify({
        refreshToken: tokens.refreshToken,
      }));
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  // Clear all tokens
  private clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
  }

  // Parse JWT token
  private parseJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid JWT token');
    }
  }

  // Initialize auth state on app start
  async initializeAuth(): Promise<AuthUser | null> {
    const token = this.getAccessToken();
    
    if (!token) {
      return null;
    }

    // Check if token is expired
    if (!this.isAuthenticated()) {
      // Try to refresh token
      const refreshResponse = await this.refreshToken();
      if (!refreshResponse.success) {
        return null;
      }
    }

    // Set token in API service
    apiService.setToken(token);

    // Get user data
    const user = this.getCurrentUser();
    if (!user) {
      return null;
    }

    const tokens: AuthTokens = {
      accessToken: token,
      refreshToken: this.getRefreshToken() || '',
      expiresAt: this.getTokenExpiry() || '',
    };

    return {
      ...user,
      tokens,
    };
  }

  // Get token expiry time
  private getTokenExpiry(): string | null {
    try {
      const tokenData = localStorage.getItem(this.TOKEN_KEY);
      if (!tokenData) return null;

      const parsed = JSON.parse(tokenData);
      return parsed.expiresAt || null;
    } catch {
      return null;
    }
  }

  // Generate demo OTP (for development)
  generateDemoOTP(): string {
    return '123456';
  }

  // Validate OTP format
  validateOTP(otp: string): { isValid: boolean; error?: string } {
    if (!otp || otp.length !== 6) {
      return {
        isValid: false,
        error: 'OTP must be 6 digits',
      };
    }

    if (!/^\d{6}$/.test(otp)) {
      return {
        isValid: false,
        error: 'OTP must contain only numbers',
      };
    }

    return { isValid: true };
  }

  // Get authentication status info
  getAuthStatus(): {
    isAuthenticated: boolean;
    user: User | null;
    tokenExpiry: Date | null;
    needsRefresh: boolean;
  } {
    const isAuthenticated = this.isAuthenticated();
    const user = this.getCurrentUser();
    const tokenExpiry = this.getTokenExpiry() ? new Date(this.getTokenExpiry()!) : null;
    
    // Check if token needs refresh (expires in next 5 minutes)
    const needsRefresh = tokenExpiry ? 
      tokenExpiry.getTime() - Date.now() < 5 * 60 * 1000 : 
      false;

    return {
      isAuthenticated,
      user,
      tokenExpiry,
      needsRefresh,
    };
  }
}

// Export singleton instance
export const authService = new AuthService();
