import type { ApiResponse, PageResponse } from '@/utils/apiTypes';
import type { ReservationDetail, ReservationSummary } from '@/api/reservationApi';
import { getCollection, saveCollection, STORAGE_KEYS, mockDelay, paginate } from '@/mock/mockStorage';
import type { MockReservation, MockTable, MockUser } from '@/mock/mockData';

export interface MyReservationQuery {
  page?: number;
  page_size?: number;
}

export const myReservationApi = {
  // lấy danh sách đặt bàn của chính khách hàng đang đăng nhập
  getMyReservations: async (params?: MyReservationQuery): Promise<ApiResponse<PageResponse<ReservationSummary>>> => {
    await mockDelay(100);
    const reservations = getCollection<MockReservation>(STORAGE_KEYS.RESERVATIONS);
    const tables = getCollection<MockTable>(STORAGE_KEYS.TABLES);
    const users = getCollection<MockUser>(STORAGE_KEYS.USERS);
    const tableMap = new Map(tables.map((t) => [t.id, t.name]));

    const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    const currentUser = users.find((u) => u.id === currentUserId) || users[4];

    // lọc theo email hoặc số điện thoại của người dùng hiện tại
    const myReservations = reservations.filter((r) => {
      if (currentUser.email && r.email?.toLowerCase() === currentUser.email.toLowerCase()) return true;
      if (currentUser.phone && r.phone === currentUser.phone) return true;
      return true;
    });

    myReservations.sort((a, b) => new Date(b.reserved_at).getTime() - new Date(a.reserved_at).getTime());

    const summaries: ReservationSummary[] = myReservations.map((r) => ({
      id: r.id,
      code: r.code,
      guest_name: r.guest_name,
      phone: r.phone,
      reserved_at: r.reserved_at,
      guest_count: r.guest_count,
      status: r.status,
      table_name: r.table_id ? tableMap.get(r.table_id) || null : null,
    }));

    return {
      success: true,
      msg: 'Lấy danh sách đặt bàn của tôi thành công',
      data: paginate(summaries, params?.page || 1, params?.page_size || 10),
    };
  },

  // lấy chi tiết một đơn đặt bàn của tôi
  getMyReservation: async (id: string): Promise<ApiResponse<ReservationDetail>> => {
    await mockDelay(100);
    const reservations = getCollection<MockReservation>(STORAGE_KEYS.RESERVATIONS);
    const tables = getCollection<MockTable>(STORAGE_KEYS.TABLES);
    const res = reservations.find((r) => r.id === id);

    if (!res) {
      throw {
        success: false,
        error: { code: 'RESERVATION_NOT_FOUND', message: 'Không tìm thấy đặt bàn' },
      };
    }

    const table = res.table_id ? tables.find((t) => t.id === res.table_id) : null;

    return {
      success: true,
      msg: 'Lấy chi tiết đặt bàn thành công',
      data: {
        id: res.id,
        code: res.code,
        status: res.status,
        guest_name: res.guest_name,
        phone: res.phone,
        email: res.email,
        reserved_at: res.reserved_at,
        reserved_end: res.reserved_end,
        guest_count: res.guest_count,
        preferred_zone: res.preferred_zone,
        note: res.note,
        table: table
          ? {
              id: table.id,
              name: table.name,
              zone: table.zone,
              capacity: table.capacity,
              status: table.status,
            }
          : null,
        cancel_reason: res.cancel_reason,
        created_at: res.created_at,
      },
    };
  },

  // khách hàng tự hủy lịch đặt bàn
  cancelMyReservation: async (id: string): Promise<ApiResponse<ReservationDetail>> => {
    await mockDelay(150);
    const reservations = getCollection<MockReservation>(STORAGE_KEYS.RESERVATIONS);
    const tables = getCollection<MockTable>(STORAGE_KEYS.TABLES);
    const res = reservations.find((r) => r.id === id);

    if (!res) {
      throw {
        success: false,
        error: { code: 'RESERVATION_NOT_FOUND', message: 'Không tìm thấy đặt bàn' },
      };
    }

    if (res.table_id) {
      const table = tables.find((t) => t.id === res.table_id);
      if (table && table.status === 'RESERVED') {
        table.status = 'AVAILABLE';
        saveCollection(STORAGE_KEYS.TABLES, tables);
      }
    }

    res.status = 'CANCELLED';
    res.cancel_reason = 'Khách hàng tự hủy trên website';
    saveCollection(STORAGE_KEYS.RESERVATIONS, reservations);

    const table = res.table_id ? tables.find((t) => t.id === res.table_id) : null;

    return {
      success: true,
      msg: 'Hủy đặt bàn thành công',
      data: {
        id: res.id,
        code: res.code,
        status: res.status,
        guest_name: res.guest_name,
        phone: res.phone,
        email: res.email,
        reserved_at: res.reserved_at,
        reserved_end: res.reserved_end,
        guest_count: res.guest_count,
        preferred_zone: res.preferred_zone,
        note: res.note,
        table: table
          ? {
              id: table.id,
              name: table.name,
              zone: table.zone,
              capacity: table.capacity,
              status: table.status,
            }
          : null,
        cancel_reason: res.cancel_reason,
        created_at: res.created_at,
      },
    };
  },
};

export default myReservationApi;
