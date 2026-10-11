import type { ApiResponse, PageResponse, UserStatus } from '@/utils/apiTypes';
import type { UserDetail, UserSearchQuery, UserSummary } from '@/api/staffApi';
import { getCollection, saveCollection, STORAGE_KEYS, mockDelay, paginate } from '@/mock/mockStorage';
import type { MockUser } from '@/mock/mockData';

export const customerApi = {
  // tìm kiếm và lọc danh sách khách hàng
  search: async (params: UserSearchQuery): Promise<ApiResponse<PageResponse<UserSummary>>> => {
    await mockDelay(100);
    const users = getCollection<MockUser>(STORAGE_KEYS.USERS);

    let filtered = users.filter((u) => u.role === 'CUSTOMER');

    if (params.name) {
      filtered = filtered.filter((u) => u.full_name.toLowerCase().includes(params.name!.toLowerCase()));
    }
    if (params.email) {
      filtered = filtered.filter((u) => u.email.toLowerCase().includes(params.email!.toLowerCase()));
    }
    if (params.phone) {
      filtered = filtered.filter((u) => u.phone.includes(params.phone!));
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
      msg: 'Lấy danh sách khách hàng thành công',
      data: paginate(summaries, params.page || 1, params.page_size || 10),
    };
  },

  // xem chi tiết một khách hàng
  get: async (id: string): Promise<ApiResponse<UserDetail>> => {
    await mockDelay(100);
    const users = getCollection<MockUser>(STORAGE_KEYS.USERS);
    const user = users.find((u) => u.id === id);

    if (!user) {
      throw {
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Không tìm thấy khách hàng' },
      };
    }

    return {
      success: true,
      msg: 'Lấy thông tin khách hàng thành công',
      data: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        status: user.status,
        email_verified: user.email_verified,
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        avatar_url: user.avatar_url,
        must_change_password: user.must_change_password,
        created_at: user.created_at,
      },
    };
  },

  // thay đổi trạng thái kích hoạt hoặc khóa tài khoản khách hàng
  changeStatus: async (id: string, status: UserStatus): Promise<ApiResponse<UserDetail>> => {
    await mockDelay(100);
    const users = getCollection<MockUser>(STORAGE_KEYS.USERS);
    const user = users.find((u) => u.id === id);

    if (!user) {
      throw {
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Không tìm thấy khách hàng' },
      };
    }

    user.status = status;
    saveCollection(STORAGE_KEYS.USERS, users);

    return {
      success: true,
      msg: 'Cập nhật trạng thái khách hàng thành công',
      data: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
        status: user.status,
        email_verified: user.email_verified,
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        avatar_url: user.avatar_url,
        must_change_password: user.must_change_password,
        created_at: user.created_at,
      },
    };
  },

  // xóa tài khoản khách hàng
  remove: async (id: string): Promise<ApiResponse<null>> => {
    await mockDelay(150);
    const users = getCollection<MockUser>(STORAGE_KEYS.USERS);
    const nextUsers = users.filter((u) => u.id !== id);
    saveCollection(STORAGE_KEYS.USERS, nextUsers);

    return {
      success: true,
      msg: 'Xóa khách hàng thành công',
      data: null,
    };
  },
};

export default customerApi;
