import type {
  ApiResponse,
  PageResponse,
  ReservationStatus,
  TableStatus,
  TableZone,
} from '@/utils/apiTypes';
import { getCollection, saveCollection, STORAGE_KEYS, mockDelay, paginate } from '@/mock/mockStorage';
import type { MockReservation, MockTable, MockOrder, MockUser } from '@/mock/mockData';

export interface AvailabilityRequest {
  reserved_at: string;
  guest_count: number;
}

export interface AvailabilityResponse {
  available: boolean;
  suggestions: string[];
}

export interface ReservationCreateRequest {
  guest_name: string;
  phone: string;
  email?: string;
  reserved_at: string;
  guest_count: number;
  preferred_zone?: TableZone;
  note?: string;
}

export interface TableBrief {
  id: string;
  name: string;
  zone: TableZone;
  capacity: number;
  status: TableStatus;
}

export interface ReservationResponse {
  id: string;
  code: string;
  status: ReservationStatus;
  guest_name: string;
  phone: string;
  email: string | null;
  reserved_at: string;
  reserved_end: string;
  guest_count: number;
  preferred_zone: TableZone | null;
  note: string | null;
  table: TableBrief | null;
  cancel_reason: string | null;
  created_at: string;
}

export interface ReservationSummary {
  id: string;
  code: string;
  guest_name: string;
  phone: string;
  reserved_at: string;
  guest_count: number;
  status: ReservationStatus;
  table_name: string | null;
}

export interface ReservationDetail extends ReservationResponse {}

export interface ReservationCheckInResult {
  reservation: ReservationDetail;
  order_id: string;
}

export interface ReservationSearchQuery {
  keyword?: string;
  code?: string;
  date?: string;
  status?: ReservationStatus;
  page?: number;
  page_size?: number;
  sort_by?: 'reserved_at' | 'created_at' | 'guest_count';
  sort_order?: 'asc' | 'desc';
}

function buildReservationDetail(res: MockReservation, tables: MockTable[]): ReservationDetail {
  const table = res.table_id ? tables.find((t) => t.id === res.table_id) : null;
  return {
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
  };
}

// kiểm tra tính hợp lệ của thời gian đặt bàn theo quy định nhà hàng
function validateReservationTime(reservedAtIso: string): void {
  const reservedAt = new Date(reservedAtIso);
  const now = new Date();

  // kiểm tra thời gian trong quá khứ hoặc chưa đủ 2 tiếng trước giờ hẹn
  const minLeadTime = new Date(now.getTime() + 2 * 3600000);
  if (reservedAt.getTime() < minLeadTime.getTime()) {
    throw {
      success: false,
      error: {
        code: 'RESERVATION_TIME_INVALID',
        message: 'Giờ hẹn không hợp lệ: cần đặt trước tối thiểu 2 giờ so với thời điểm hiện tại.',
      },
    };
  }

  // kiểm tra không quá 30 ngày trong tương lai
  const maxAheadTime = new Date(now.getTime() + 30 * 86400000);
  if (reservedAt.getTime() > maxAheadTime.getTime()) {
    throw {
      success: false,
      error: {
        code: 'RESERVATION_TIME_INVALID',
        message: 'Giờ hẹn không hợp lệ: nhà hàng chỉ nhận đặt bàn trước tối đa 30 ngày.',
      },
    };
  }

  // kiểm tra trong khung giờ mở cửa từ 10:00 đến 22:00
  const hours = reservedAt.getHours();
  const minutes = reservedAt.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  const openInMinutes = 10 * 60;
  const closeInMinutes = 22 * 60;

  if (timeInMinutes < openInMinutes || timeInMinutes >= closeInMinutes) {
    throw {
      success: false,
      error: {
        code: 'RESERVATION_TIME_INVALID',
        message: 'Giờ hẹn không hợp lệ: nhà hàng chỉ phục vụ trong khung giờ mở cửa 10:00 – 22:00.',
      },
    };
  }
}

export const reservationApi = {
  // kiểm tra khả năng phục vụ bàn trống theo thời gian
  checkAvailability: async (params: AvailabilityRequest): Promise<ApiResponse<AvailabilityResponse>> => {
    await mockDelay(100);
    validateReservationTime(params.reserved_at);
    return {
      success: true,
      msg: 'Kiểm tra thành công',
      data: {
        available: true,
        suggestions: [],
      },
    };
  },

  // khách hàng tạo yêu cầu đặt bàn mới
  createReservation: async (data: ReservationCreateRequest): Promise<ApiResponse<ReservationResponse>> => {
    await mockDelay(150);
    validateReservationTime(data.reserved_at);
    const reservations = getCollection<MockReservation>(STORAGE_KEYS.RESERVATIONS);
    const tables = getCollection<MockTable>(STORAGE_KEYS.TABLES);

    const reservedAt = new Date(data.reserved_at);
    const reservedEnd = new Date(reservedAt.getTime() + 2 * 3600000);

    const newRes: MockReservation = {
      id: `res-${Date.now()}`,
      code: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'PENDING',
      guest_name: data.guest_name,
      phone: data.phone,
      email: data.email || null,
      reserved_at: reservedAt.toISOString(),
      reserved_end: reservedEnd.toISOString(),
      guest_count: data.guest_count,
      preferred_zone: data.preferred_zone || null,
      note: data.note || null,
      table_id: null,
      cancel_reason: null,
      created_at: new Date().toISOString(),
    };

    reservations.push(newRes);
    saveCollection(STORAGE_KEYS.RESERVATIONS, reservations);

    return {
      success: true,
      msg: 'Đặt bàn thành công',
      data: buildReservationDetail(newRes, tables),
    };
  },

  // tìm kiếm danh sách đặt bàn cho nhân viên quản lý
  search: async (params: ReservationSearchQuery): Promise<ApiResponse<PageResponse<ReservationSummary>>> => {
    await mockDelay(100);
    const reservations = getCollection<MockReservation>(STORAGE_KEYS.RESERVATIONS);
    const tables = getCollection<MockTable>(STORAGE_KEYS.TABLES);
    const tableMap = new Map(tables.map((t) => [t.id, t.name]));

    let filtered = reservations.filter((r) => {
      if (params.status && r.status !== params.status) return false;
      if (params.code && !r.code.toLowerCase().includes(params.code.toLowerCase())) return false;
      if (params.keyword) {
        const kw = params.keyword.toLowerCase();
        const matchName = r.guest_name.toLowerCase().includes(kw);
        const matchPhone = r.phone.includes(kw);
        const matchCode = r.code.toLowerCase().includes(kw);
        if (!matchName && !matchPhone && !matchCode) return false;
      }
      return true;
    });

    filtered.sort((a, b) => new Date(b.reserved_at).getTime() - new Date(a.reserved_at).getTime());

    const summaries: ReservationSummary[] = filtered.map((r) => ({
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
      msg: 'Lấy danh sách đặt bàn thành công',
      data: paginate(summaries, params.page || 1, params.page_size || 15),
    };
  },

  // lấy chi tiết một đơn đặt bàn
  get: async (id: string): Promise<ApiResponse<ReservationDetail>> => {
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

    return {
      success: true,
      msg: 'Lấy thông tin đặt bàn thành công',
      data: buildReservationDetail(res, tables),
    };
  },

  // lấy danh sách bàn còn trống để chọn khi xác nhận
  availableTables: async (id: string): Promise<ApiResponse<TableBrief[]>> => {
    await mockDelay(100);
    const reservations = getCollection<MockReservation>(STORAGE_KEYS.RESERVATIONS);
    const tables = getCollection<MockTable>(STORAGE_KEYS.TABLES);
    const res = reservations.find((r) => r.id === id);

    const available = tables.filter((t) => {
      if (res && t.capacity < res.guest_count) return false;
      return t.status === 'AVAILABLE';
    });

    return {
      success: true,
      msg: 'Lấy danh sách bàn trống thành công',
      data: available.map((t) => ({
        id: t.id,
        name: t.name,
        zone: t.zone,
        capacity: t.capacity,
        status: t.status,
      })),
    };
  },

  // nhân viên xác nhận đặt bàn và xếp bàn cho khách
  confirm: async (id: string, tableId: string): Promise<ApiResponse<ReservationDetail>> => {
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

    res.table_id = tableId;
    res.status = 'CONFIRMED';
    saveCollection(STORAGE_KEYS.RESERVATIONS, reservations);

    const table = tables.find((t) => t.id === tableId);
    if (table) {
      table.status = 'RESERVED';
      saveCollection(STORAGE_KEYS.TABLES, tables);
    }

    return {
      success: true,
      msg: 'Xác nhận đặt bàn thành công',
      data: buildReservationDetail(res, tables),
    };
  },

  // từ chối hoặc hủy đơn đặt bàn
  rejectOrCancel: async (id: string, reason: string): Promise<ApiResponse<ReservationDetail>> => {
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
    res.cancel_reason = reason;
    saveCollection(STORAGE_KEYS.RESERVATIONS, reservations);

    return {
      success: true,
      msg: 'Hủy đặt bàn thành công',
      data: buildReservationDetail(res, tables),
    };
  },

  // khách tới nhận bàn và mở đơn hàng bắt đầu phục vụ
  checkIn: async (id: string, tableId?: string): Promise<ApiResponse<ReservationCheckInResult>> => {
    await mockDelay(150);
    const reservations = getCollection<MockReservation>(STORAGE_KEYS.RESERVATIONS);
    const tables = getCollection<MockTable>(STORAGE_KEYS.TABLES);
    const orders = getCollection<MockOrder>(STORAGE_KEYS.ORDERS);
    const users = getCollection<MockUser>(STORAGE_KEYS.USERS);

    const res = reservations.find((r) => r.id === id);
    if (!res) {
      throw {
        success: false,
        error: { code: 'RESERVATION_NOT_FOUND', message: 'Không tìm thấy đặt bàn' },
      };
    }

    const selectedTableId = tableId || res.table_id;
    if (!selectedTableId) {
      throw {
        success: false,
        error: { code: 'TABLE_REQUIRED', message: 'Vui lòng chọn bàn khi nhận bàn' },
      };
    }

    res.status = 'CHECKED_IN';
    res.table_id = selectedTableId;
    saveCollection(STORAGE_KEYS.RESERVATIONS, reservations);

    const table = tables.find((t) => t.id === selectedTableId);
    if (table) {
      table.status = 'OCCUPIED';
      saveCollection(STORAGE_KEYS.TABLES, tables);
    }

    const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    const waiter = users.find((u) => u.id === currentUserId) || users[2];

    const newOrder: MockOrder = {
      id: `ord-${Date.now()}`,
      table_id: selectedTableId,
      status: 'OPEN',
      reservation_id: res.id,
      waiter_id: waiter.id,
      waiter_name: waiter.full_name,
      opened_at: new Date().toISOString(),
      closed_at: null,
      items: [],
    };

    orders.push(newOrder);
    saveCollection(STORAGE_KEYS.ORDERS, orders);

    return {
      success: true,
      msg: 'Nhận bàn thành công',
      data: {
        reservation: buildReservationDetail(res, tables),
        order_id: newOrder.id,
      },
    };
  },
};

export default reservationApi;
