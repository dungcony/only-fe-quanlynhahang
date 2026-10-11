import type {
  ApiResponse,
  AuthResponse,
  ProfileResponse,
  UserLoginRequest,
  UserRegisterRequest,
  PasswordForgotRequest,
  PasswordResetRequest,
} from '@/utils/apiTypes';
import { getCollection, saveCollection, STORAGE_KEYS, mockDelay } from '@/mock/mockStorage';
import type { MockUser } from '@/mock/mockData';

export const authApi = {
  // gửi yêu cầu đăng nhập
  login: async (data: UserLoginRequest): Promise<ApiResponse<AuthResponse>> => {
    await mockDelay(150);
    const users = getCollection<MockUser>(STORAGE_KEYS.USERS);
    const user = users.find(
      (u) => u.email.toLowerCase() === data.email.toLowerCase() && u.password === data.password
    );

    if (!user) {
      throw {
        success: false,
        error: {
          code: 'AUTH_INVALID_CREDENTIALS',
          message: 'Email hoặc mật khẩu không chính xác',
        },
      };
    }

    if (user.status === 'LOCKED') {
      throw {
        success: false,
        error: {
          code: 'AUTH_ACCOUNT_LOCKED',
          message: 'Tài khoản đã bị tạm khóa',
        },
      };
    }

    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
    const mockToken = `mock-token-${user.id}-${Date.now()}`;
    localStorage.setItem('access_token', mockToken);

    return {
      success: true,
      msg: 'Đăng nhập thành công',
      data: {
        access_token: mockToken,
        expires_in: 86400,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          must_change_password: user.must_change_password,
        },
      },
    };
  },

  // gửi yêu cầu đăng ký tài khoản khách hàng
  register: async (data: UserRegisterRequest): Promise<ApiResponse<ProfileResponse>> => {
    await mockDelay(150);
    const users = getCollection<MockUser>(STORAGE_KEYS.USERS);
    const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      throw {
        success: false,
        error: {
          code: 'USER_EMAIL_EXISTS',
          message: 'Email này đã được sử dụng trong hệ thống',
        },
      };
    }

    const newUser: MockUser = {
      id: `usr-${Date.now()}`,
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      phone: data.phone || '',
      gender: 'OTHER',
      date_of_birth: '2000-01-01',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      email_verified: true,
      must_change_password: false,
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    saveCollection(STORAGE_KEYS.USERS, users);

    return {
      success: true,
      msg: 'Đăng ký thành công',
      data: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        phone: newUser.phone,
        gender: newUser.gender,
        date_of_birth: newUser.date_of_birth,
        avatar_url: newUser.avatar_url,
        role: newUser.role,
        status: newUser.status,
        email_verified: newUser.email_verified,
        must_change_password: newUser.must_change_password,
        created_at: newUser.created_at,
      },
    };
  },

  // gửi yêu cầu xác thực email theo mã token
  verifyEmail: async (_token: string): Promise<ApiResponse<null>> => {
    await mockDelay(100);
    return {
      success: true,
      msg: 'Xác thực email thành công',
      data: null,
    };
  },

  // gửi lại liên kết xác thực email
  resendVerification: async (_email: string): Promise<ApiResponse<null>> => {
    await mockDelay(100);
    return {
      success: true,
      msg: 'Đã gửi lại liên kết xác thực',
      data: null,
    };
  },

  // gửi yêu cầu cấp lại mật khẩu qua email
  forgotPassword: async (_data: PasswordForgotRequest): Promise<ApiResponse<null>> => {
    await mockDelay(100);
    return {
      success: true,
      msg: 'Đã gửi hướng dẫn khôi phục mật khẩu vào email',
      data: null,
    };
  },

  // gửi yêu cầu thiết lập mật khẩu mới
  resetPassword: async (data: PasswordResetRequest): Promise<ApiResponse<null>> => {
    await mockDelay(100);
    const users = getCollection<MockUser>(STORAGE_KEYS.USERS);
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    const user = users.find((u) => u.id === currentId) || users[0];
    if (user) {
      user.password = data.new_password;
      user.must_change_password = false;
      saveCollection(STORAGE_KEYS.USERS, users);
    }
    return {
      success: true,
      msg: 'Đặt lại mật khẩu thành công',
      data: null,
    };
  },
};

export default authApi;
