import type {
  ApiResponse,
  ProfileResponse,
  ProfileUpdateRequest,
  PasswordChangeRequest,
} from '@/utils/apiTypes';
import { getCollection, saveCollection, STORAGE_KEYS, mockDelay } from '@/mock/mockStorage';
import type { MockUser } from '@/mock/mockData';

export const userApi = {
  // lấy thông tin hồ sơ của người dùng hiện tại
  getProfile: async (): Promise<ApiResponse<ProfileResponse>> => {
    await mockDelay(100);
    const users = getCollection<MockUser>(STORAGE_KEYS.USERS);
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    const user = users.find((u) => u.id === currentId) || users[0];

    if (!user) {
      throw {
        success: false,
        error: {
          code: 'AUTH_UNAUTHORIZED',
          message: 'Chưa đăng nhập vào hệ thống',
        },
      };
    }

    return {
      success: true,
      msg: 'Lấy thông tin người dùng thành công',
      data: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        avatar_url: user.avatar_url,
        role: user.role,
        status: user.status,
        email_verified: user.email_verified,
        must_change_password: user.must_change_password,
        created_at: user.created_at,
      },
    };
  },

  // cập nhật thông tin hồ sơ cá nhân
  updateProfile: async (data: ProfileUpdateRequest): Promise<ApiResponse<ProfileResponse>> => {
    await mockDelay(150);
    const users = getCollection<MockUser>(STORAGE_KEYS.USERS);
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    const user = users.find((u) => u.id === currentId) || users[0];

    if (!user) {
      throw {
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Không tìm thấy người dùng' },
      };
    }

    user.full_name = data.full_name;
    user.phone = data.phone || user.phone;
    if (data.gender) user.gender = data.gender;
    if (data.date_of_birth) user.date_of_birth = data.date_of_birth;

    saveCollection(STORAGE_KEYS.USERS, users);

    return {
      success: true,
      msg: 'Cập nhật hồ sơ thành công',
      data: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        avatar_url: user.avatar_url,
        role: user.role,
        status: user.status,
        email_verified: user.email_verified,
        must_change_password: user.must_change_password,
        created_at: user.created_at,
      },
    };
  },

  // cập nhật ảnh đại diện người dùng
  updateAvatar: async (file: File): Promise<ApiResponse<ProfileResponse>> => {
    await mockDelay(200);
    const users = getCollection<MockUser>(STORAGE_KEYS.USERS);
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    const user = users.find((u) => u.id === currentId) || users[0];

    // giả lập tạo url cho avatar bằng blob url
    const objectUrl = URL.createObjectURL(file);
    user.avatar_url = objectUrl;
    saveCollection(STORAGE_KEYS.USERS, users);

    return {
      success: true,
      msg: 'Cập nhật ảnh đại diện thành công',
      data: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        avatar_url: user.avatar_url,
        role: user.role,
        status: user.status,
        email_verified: user.email_verified,
        must_change_password: user.must_change_password,
        created_at: user.created_at,
      },
    };
  },

  // đổi mật khẩu tài khoản
  changePassword: async (data: PasswordChangeRequest): Promise<ApiResponse<null>> => {
    await mockDelay(150);
    const users = getCollection<MockUser>(STORAGE_KEYS.USERS);
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    const user = users.find((u) => u.id === currentId) || users[0];

    if (user.password !== data.old_password) {
      throw {
        success: false,
        error: { code: 'AUTH_OLD_PASSWORD_MISMATCH', message: 'Mật khẩu cũ không chính xác' },
      };
    }

    user.password = data.new_password;
    user.must_change_password = false;
    saveCollection(STORAGE_KEYS.USERS, users);

    return {
      success: true,
      msg: 'Đổi mật khẩu thành công',
      data: null,
    };
  },
};

export default userApi;
