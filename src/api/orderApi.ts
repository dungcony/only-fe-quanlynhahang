import type { ApiResponse, OrderItemStatus, OrderStatus, PageResponse } from '@/utils/apiTypes';
import type { TableBrief } from '@/api/reservationApi';
import { getCollection, saveCollection, STORAGE_KEYS, mockDelay, paginate } from '@/mock/mockStorage';
import type { MockTable, MockOrder, MockOrderItem, MockDish, MockUser } from '@/mock/mockData';

export interface OrderSummary {
  id: string;
  table: TableBrief;
  status: OrderStatus;
  waiter_name: string;
  opened_at: string;
  item_count: number;
  subtotal: number;
}

export interface OrderItem {
  id: string;
  dish_id: string;
  dish_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  note: string | null;
  status: OrderItemStatus;
  sent_at: string;
  started_at: string | null;
  ready_at: string | null;
  served_at: string | null;
}

export interface OrderDetail {
  id: string;
  table: TableBrief;
  status: OrderStatus;
  reservation_id: string | null;
  waiter: { id: string; full_name: string; email: string; phone: string | null; role: string };
  opened_at: string;
  closed_at: string | null;
  items: OrderItem[];
  subtotal: number;
  unserved_count: number;
}

export interface OrderSearchQuery {
  status?: OrderStatus;
  table_id?: string;
  page?: number;
  page_size?: number;
  sort_by?: 'opened_at' | 'closed_at';
  sort_order?: 'asc' | 'desc';
}

export interface OrderItemLine {
  dish_id: string;
  quantity: number;
  note?: string;
}

export interface ReadyItem {
  id: string;
  order_id: string;
  table_name: string;
  dish_name: string;
  quantity: number;
  note: string | null;
  ready_at: string;
}

// hàm tiện ích tạo đối tượng chi tiết OrderDetail
function buildOrderDetail(order: MockOrder, tables: MockTable[], users: MockUser[]): OrderDetail {
  const table = tables.find((t) => t.id === order.table_id) || {
    id: order.table_id,
    name: 'Bàn',
    zone: 'INDOOR',
    capacity: 4,
    status: 'AVAILABLE',
  };

  const waiter = users.find((u) => u.id === order.waiter_id) || {
    id: order.waiter_id,
    full_name: order.waiter_name || 'Nhân viên phục vụ',
    email: 'waiter@restaurant.local',
    phone: '0900000000',
    role: 'WAITER',
  };

  const activeItems = order.items.filter((it) => it.status !== 'CANCELLED');
  const subtotal = activeItems.reduce((acc, it) => acc + it.line_total, 0);
  const unservedCount = activeItems.filter((it) => it.status !== 'SERVED').length;

  return {
    id: order.id,
    table: {
      id: table.id,
      name: table.name,
      zone: table.zone,
      capacity: table.capacity,
      status: table.status,
    },
    status: order.status,
    reservation_id: order.reservation_id,
    waiter: {
      id: waiter.id,
      full_name: waiter.full_name,
      email: waiter.email,
      phone: waiter.phone,
      role: waiter.role,
    },
    opened_at: order.opened_at,
    closed_at: order.closed_at,
    items: order.items,
    subtotal,
    unserved_count: unservedCount,
  };
}

export const orderApi = {
  // mở đơn mới cho bàn ăn
  open: async (tableId: string): Promise<ApiResponse<OrderDetail>> => {
    await mockDelay(150);
    const orders = getCollection<MockOrder>(STORAGE_KEYS.ORDERS);
    const tables = getCollection<MockTable>(STORAGE_KEYS.TABLES);
    const users = getCollection<MockUser>(STORAGE_KEYS.USERS);

    const existingOpen = orders.find((o) => o.table_id === tableId && o.status === 'OPEN');
    if (existingOpen) {
      return {
        success: true,
        msg: 'Bàn đã có đơn đang mở',
        data: buildOrderDetail(existingOpen, tables, users),
      };
    }

    const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    const currentUser = users.find((u) => u.id === currentUserId) || users[2];

    const newOrder: MockOrder = {
      id: `ord-${Date.now()}`,
      table_id: tableId,
      status: 'OPEN',
      reservation_id: null,
      waiter_id: currentUser.id,
      waiter_name: currentUser.full_name,
      opened_at: new Date().toISOString(),
      closed_at: null,
      items: [],
    };

    orders.push(newOrder);
    saveCollection(STORAGE_KEYS.ORDERS, orders);

    // cập nhật trạng thái bàn sang OCCUPIED
    const table = tables.find((t) => t.id === tableId);
    if (table) {
      table.status = 'OCCUPIED';
      saveCollection(STORAGE_KEYS.TABLES, tables);
    }

    return {
      success: true,
      msg: 'Mở đơn thành công',
      data: buildOrderDetail(newOrder, tables, users),
    };
  },

  // tìm kiếm các đơn hàng
  search: async (params: OrderSearchQuery): Promise<ApiResponse<PageResponse<OrderSummary>>> => {
    await mockDelay(100);
    const orders = getCollection<MockOrder>(STORAGE_KEYS.ORDERS);
    const tables = getCollection<MockTable>(STORAGE_KEYS.TABLES);

    const tableMap = new Map(tables.map((t) => [t.id, t]));

    let filtered = orders.filter((o) => {
      const targetStatus = params.status || 'OPEN';
      if (o.status !== targetStatus) return false;
      if (params.table_id && o.table_id !== params.table_id) return false;
      return true;
    });

    const summaries: OrderSummary[] = filtered.map((o) => {
      const table = tableMap.get(o.table_id);
      const activeItems = o.items.filter((it) => it.status !== 'CANCELLED');
      const subtotal = activeItems.reduce((sum, it) => sum + it.line_total, 0);

      return {
        id: o.id,
        table: {
          id: table?.id || o.table_id,
          name: table?.name || 'Bàn',
          zone: table?.zone || 'INDOOR',
          capacity: table?.capacity || 4,
          status: table?.status || 'AVAILABLE',
        },
        status: o.status,
        waiter_name: o.waiter_name,
        opened_at: o.opened_at,
        item_count: activeItems.reduce((sum, it) => sum + it.quantity, 0),
        subtotal,
      };
    });

    return {
      success: true,
      msg: 'Lấy danh sách đơn thành công',
      data: paginate(summaries, params.page || 1, params.page_size || 20),
    };
  },

  // lấy chi tiết đơn hàng
  get: async (id: string): Promise<ApiResponse<OrderDetail>> => {
    await mockDelay(100);
    const orders = getCollection<MockOrder>(STORAGE_KEYS.ORDERS);
    const tables = getCollection<MockTable>(STORAGE_KEYS.TABLES);
    const users = getCollection<MockUser>(STORAGE_KEYS.USERS);

    const order = orders.find((o) => o.id === id);
    if (!order) {
      throw {
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: 'Không tìm thấy đơn hàng' },
      };
    }

    return {
      success: true,
      msg: 'Lấy chi tiết đơn thành công',
      data: buildOrderDetail(order, tables, users),
    };
  },

  // thêm các dòng món ăn vào đơn
  addItems: async (id: string, items: OrderItemLine[]): Promise<ApiResponse<OrderDetail>> => {
    await mockDelay(150);
    const orders = getCollection<MockOrder>(STORAGE_KEYS.ORDERS);
    const dishes = getCollection<MockDish>(STORAGE_KEYS.DISHES);
    const tables = getCollection<MockTable>(STORAGE_KEYS.TABLES);
    const users = getCollection<MockUser>(STORAGE_KEYS.USERS);

    const order = orders.find((o) => o.id === id);
    if (!order) {
      throw {
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: 'Không tìm thấy đơn hàng' },
      };
    }

    const dishMap = new Map(dishes.map((d) => [d.id, d]));

    const newItems: MockOrderItem[] = items.map((line) => {
      const dish = dishMap.get(line.dish_id);
      const unitPrice = dish ? dish.price : 50000;
      const dishName = dish ? dish.name : 'Món ăn';

      return {
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        order_id: order.id,
        dish_id: line.dish_id,
        dish_name: dishName,
        unit_price: unitPrice,
        quantity: line.quantity,
        line_total: unitPrice * line.quantity,
        note: line.note || null,
        status: 'PENDING',
        sent_at: new Date().toISOString(),
        started_at: null,
        ready_at: null,
        served_at: null,
      };
    });

    order.items.push(...newItems);
    saveCollection(STORAGE_KEYS.ORDERS, orders);

    return {
      success: true,
      msg: 'Thêm món thành công',
      data: buildOrderDetail(order, tables, users),
    };
  },

  // hủy đơn trống
  cancelEmpty: async (id: string): Promise<ApiResponse<null>> => {
    await mockDelay(100);
    const orders = getCollection<MockOrder>(STORAGE_KEYS.ORDERS);
    const tables = getCollection<MockTable>(STORAGE_KEYS.TABLES);

    const order = orders.find((o) => o.id === id);
    if (order) {
      const table = tables.find((t) => t.id === order.table_id);
      if (table) {
        table.status = 'AVAILABLE';
        saveCollection(STORAGE_KEYS.TABLES, tables);
      }
    }

    const nextOrders = orders.filter((o) => o.id !== id);
    saveCollection(STORAGE_KEYS.ORDERS, nextOrders);

    return {
      success: true,
      msg: 'Hủy đơn thành công',
      data: null,
    };
  },

  // danh sách các món đã nấu xong đang chờ phục vụ mang ra bàn
  readyItems: async (): Promise<ApiResponse<ReadyItem[]>> => {
    await mockDelay(100);
    const orders = getCollection<MockOrder>(STORAGE_KEYS.ORDERS);
    const tables = getCollection<MockTable>(STORAGE_KEYS.TABLES);
    const tableMap = new Map(tables.map((t) => [t.id, t.name]));

    const result: ReadyItem[] = [];

    for (const order of orders) {
      if (order.status !== 'OPEN') continue;
      const tableName = tableMap.get(order.table_id) || 'Bàn';
      for (const it of order.items) {
        if (it.status === 'READY') {
          result.push({
            id: it.id,
            order_id: order.id,
            table_name: tableName,
            dish_name: it.dish_name,
            quantity: it.quantity,
            note: it.note,
            ready_at: it.ready_at || it.sent_at,
          });
        }
      }
    }

    return {
      success: true,
      msg: 'Lấy danh sách món chờ phục vụ thành công',
      data: result,
    };
  },

  // đánh dấu món ăn đã được phục vụ ra bàn
  markServed: async (itemId: string): Promise<ApiResponse<OrderItem>> => {
    await mockDelay(100);
    const orders = getCollection<MockOrder>(STORAGE_KEYS.ORDERS);

    let updatedItem: MockOrderItem | null = null;

    for (const order of orders) {
      const it = order.items.find((item) => item.id === itemId);
      if (it) {
        it.status = 'SERVED';
        it.served_at = new Date().toISOString();
        updatedItem = it;
        break;
      }
    }

    if (!updatedItem) {
      throw {
        success: false,
        error: { code: 'ITEM_NOT_FOUND', message: 'Không tìm thấy dòng món' },
      };
    }

    saveCollection(STORAGE_KEYS.ORDERS, orders);

    return {
      success: true,
      msg: 'Đã phục vụ món ra bàn',
      data: updatedItem,
    };
  },
};
