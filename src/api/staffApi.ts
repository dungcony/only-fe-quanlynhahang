import type { ApiResponse, Gender, PageResponse, Role, UserStatus } from '@/utils/apiTypes';
import { getCollection, saveCollection, STORAGE_KEYS, mockDelay, paginate } from '@/mock/mockStorage';
import type { MockUser } from '@/mock/mockData';

export interface UserSummary {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: Role;
  status: UserStatus;
  email_verified: boolean;
}

export interface UserDetail extends UserSummary {
  gender: Gender | null;
  date_of_birth: string | null;
  avatar_url: string | null;
  must_change_password: boolean;
  created_at: string;
}

export interface UserSearchQuery {
  name?: string;
  email?: string;
  phone?: string;
  role?: Role;
  status?: UserStatus;
  email_verified?: boolean;
  page?: number;
  page_size?: number;
  sort_by?: 'created_at' | 'full_name' | 'email';
  sort_order?: 'asc' | 'desc';
}

export interface StaffUpdatePayload {
  full_name: string;
  email: string;
  role: Role;
  date_of_birth?: string;
  phone?: string;
  gender?: Gender;
}

export interface StaffCreatePayload extends StaffUpdatePayload {
  password: string;
  status: UserStatus;
}

function buildUserDetail(u: MockUser): UserDetail {
  return {
    id: u.id,
    email: u.email,
    full_name: u.full_name,
    phone: u.phone,
    role: u.role,
    status: u.status,
    email_verified: u.email_verified,
    gender: u.gender,
    date_of_birth: u.date_of_birth,
    avatar_url: u.avatar_url,
    must_change_password: u.must_change_password,
    created_at: u.created_at,
  };
}

export const staffApi = {
  // tìm kiếm và lọc danh sách nhân viên
  search: async (params: UserSearchQuery): Promise<ApiResponse<PageResponse<UserSummary>>> => {
    await mockDelay(100);
    const users = getCollection<MockUser>(STORAGE_KEYS.USERS);

    let filtered = users.filter((u) => u.role !== 'CUSTOMER');

    if (params.name) {
      filtered = filtered.filter((u) => u.full_name.toLowerCase().includes(params.name!.toLowerCase()));
    }
    if (params.email) {
      filtered = filtered.filter((u) => u.email.toLowerCase().includes(params.email!.toLowerCase()));
    }
    if (params.phone) {
      filtered = filtered.filter((u) => u.phone.includes(params.phone!));
    }
    if (params.role) {
      filtered = filtered.filter((u) => u.role === params.role);
    }
    if (params.status) {
      filtered = filtered.filter((u) => u.status === params.status);
    }

    const summaries: UserSummary[] = filtered.map((u) => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      phone: u.phone,
      role: u.role,
      status: u.status,
      email_verified: u.email_verified,
    }));

    return {
      success: true,
      msg: 'Lấy danh sách nhân viên thành công',
      data: paginate(summaries, params.page || 1, params.page_size || 10),
    };
  },

  // xem chi tiết một nhân viên
  get: async (id: string): Promise<ApiResponse<UserDetail>> => {
    await mockDelay(100);
    const users = getCollection<MockUser>(STORAGE_KEYS.USERS);
    const user = users.find((u) => u.id === id);

    if (!user) {
      throw {
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Không tìm thấy nhân viên' },
      };
    }

    return {
      success: true,
      msg: 'Lấy chi tiết nhân viên thành công',
      data: buildUserDetail(user),
    };
  },

  // tạo mới một nhân viên
  create: async (data: StaffCreatePayload): Promise<ApiResponse<UserDetail>> => {
    await mockDelay(150);
    const users = getCollection<MockUser>(STORAGE_KEYS.USERS);

    const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      throw {
        success: false,
        error: { code: 'USER_EMAIL_EXISTS', message: 'Email đã tồn tại' },
      };
    }

    const newUser: MockUser = {
      id: `usr-${Date.now()}`,
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      phone: data.phone || '',
      gender: data.gender || 'OTHER',
      date_of_birth: data.date_of_birth || '1995-01-01',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      role: data.role,
      status: data.status,
      email_verified: true,
      must_change_password: false,
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    saveCollection(STORAGE_KEYS.USERS, users);

    return {
      success: true,
      msg: 'Tạo nhân viên thành công',
      data: buildUserDetail(newUser),
    };
  },

  // cập nhật thông tin nhân viên
  update: async (id: string, data: StaffUpdatePayload): Promise<ApiResponse<UserDetail>> => {
    await mockDelay(150);
    const users = getCollection<MockUser>(STORAGE_KEYS.USERS);
    const user = users.find((u) => u.id === id);

    if (!user) {
      throw {
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Không tìm thấy nhân viên' },
      };
    }

    user.full_name = data.full_name;
    user.email = data.email;
    user.role = data.role;
    if (data.phone) user.phone = data.phone;
    if (data.gender) user.gender = data.gender;
    if (data.date_of_birth) user.date_of_birth = data.date_of_birth;

    saveCollection(STORAGE_KEYS.USERS, users);

    return {
      success: true,
      msg: 'Cập nhật nhân viên thành công',
      data: buildUserDetail(user),
    };
  },

  // tải lên và cập nhật ảnh đại diện nhân viên
  uploadAvatar: async (id: string, file: File): Promise<ApiResponse<UserDetail>> => {
    await mockDelay(200);
    const users = getCollection<MockUser>(STORAGE_KEYS.USERS);
    const user = users.find((u) => u.id === id);

    if (!user) {
      throw {
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Không tìm thấy nhân viên' },
      };
    }

    user.avatar_url = URL.createObjectURL(file);
    saveCollection(STORAGE_KEYS.USERS, users);

    return {
      success: true,
      msg: 'Cập nhật ảnh đại diện thành công',
      data: buildUserDetail(user),
    };
  },

  // thay đổi trạng thái kích hoạt hoặc khóa tài khoản
  changeStatus: async (id: string, status: UserStatus): Promise<ApiResponse<UserDetail>> => {
    await mockDelay(100);
    const users = getCollection<MockUser>(STORAGE_KEYS.USERS);
    const user = users.find((u) => u.id === id);

    if (!user) {
      throw {
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Không tìm thấy nhân viên' },
      };
    }

    user.status = status;
    saveCollection(STORAGE_KEYS.USERS, users);

    return {
      success: true,
      msg: 'Cập nhật trạng thái thành công',
      data: buildUserDetail(user),
    };
  },

  // xóa nhân viên khỏi hệ thống
  remove: async (id: string): Promise<ApiResponse<null>> => {
    await mockDelay(150);
    const users = getCollection<MockUser>(STORAGE_KEYS.USERS);
    const nextUsers = users.filter((u) => u.id !== id);
    saveCollection(STORAGE_KEYS.USERS, nextUsers);

    return {
      success: true,
      msg: 'Xóa nhân viên thành công',
      data: null,
    };
  },
};

export default staffApi;
