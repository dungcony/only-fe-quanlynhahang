import type { ApiResponse } from '@/utils/apiTypes';
import { getCollection, saveCollection, STORAGE_KEYS, mockDelay } from '@/mock/mockStorage';
import type { MockOrder, MockTable, MockOrderItem } from '@/mock/mockData';

export interface KitchenItem {
  id: string;
  order_id: string;
  table_name: string;
  dish_name: string;
  quantity: number;
  note: string | null;
  status: 'PENDING' | 'COOKING';
  sent_at: string;
  started_at: string | null;
}

export const kitchenApi = {
  // lấy hàng đợi các món cần nấu trong bếp
  getQueue: async (status?: 'PENDING' | 'COOKING'): Promise<ApiResponse<KitchenItem[]>> => {
    await mockDelay(100);
    const orders = getCollection<MockOrder>(STORAGE_KEYS.ORDERS);
    const tables = getCollection<MockTable>(STORAGE_KEYS.TABLES);
    const tableMap = new Map(tables.map((t) => [t.id, t.name]));

    const queue: KitchenItem[] = [];

    for (const order of orders) {
      if (order.status !== 'OPEN') continue;
      const tableName = tableMap.get(order.table_id) || 'Bàn';

      for (const item of order.items) {
        if (item.status === 'PENDING' || item.status === 'COOKING') {
          if (!status || item.status === status) {
            queue.push({
              id: item.id,
              order_id: order.id,
              table_name: tableName,
              dish_name: item.dish_name,
              quantity: item.quantity,
              note: item.note,
              status: item.status,
              sent_at: item.sent_at,
              started_at: item.started_at,
            });
          }
        }
      }
    }

    queue.sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());

    return {
      success: true,
      msg: 'Lấy hàng đợi bếp thành công',
      data: queue,
    };
  },

  // bếp nhận bắt đầu chế biến món
  start: async (id: string): Promise<ApiResponse<KitchenItem>> => {
    await mockDelay(100);
    const orders = getCollection<MockOrder>(STORAGE_KEYS.ORDERS);
    const tables = getCollection<MockTable>(STORAGE_KEYS.TABLES);
    const tableMap = new Map(tables.map((t) => [t.id, t.name]));

    let foundItem: MockOrderItem | null = null;
    let foundOrder: MockOrder | null = null;

    for (const order of orders) {
      const it = order.items.find((item) => item.id === id);
      if (it) {
        it.status = 'COOKING';
        it.started_at = new Date().toISOString();
        foundItem = it;
        foundOrder = order;
        break;
      }
    }

    if (!foundItem || !foundOrder) {
      throw {
        success: false,
        error: { code: 'ITEM_NOT_FOUND', message: 'Không tìm thấy dòng món' },
      };
    }

    saveCollection(STORAGE_KEYS.ORDERS, orders);

    return {
      success: true,
      msg: 'Đã nhận nấu món',
      data: {
        id: foundItem.id,
        order_id: foundOrder.id,
        table_name: tableMap.get(foundOrder.table_id) || 'Bàn',
        dish_name: foundItem.dish_name,
        quantity: foundItem.quantity,
        note: foundItem.note,
        status: 'COOKING',
        sent_at: foundItem.sent_at,
        started_at: foundItem.started_at,
      },
    };
  },

  // báo món đã nấu xong để phục vụ mang ra bàn
  ready: async (id: string): Promise<ApiResponse<KitchenItem>> => {
    await mockDelay(100);
    const orders = getCollection<MockOrder>(STORAGE_KEYS.ORDERS);
    const tables = getCollection<MockTable>(STORAGE_KEYS.TABLES);
    const tableMap = new Map(tables.map((t) => [t.id, t.name]));

    let foundItem: MockOrderItem | null = null;
    let foundOrder: MockOrder | null = null;

    for (const order of orders) {
      const it = order.items.find((item) => item.id === id);
      if (it) {
        it.status = 'READY';
        it.ready_at = new Date().toISOString();
        foundItem = it;
        foundOrder = order;
        break;
      }
    }

    if (!foundItem || !foundOrder) {
      throw {
        success: false,
        error: { code: 'ITEM_NOT_FOUND', message: 'Không tìm thấy dòng món' },
      };
    }

    saveCollection(STORAGE_KEYS.ORDERS, orders);

    return {
      success: true,
      msg: 'Món ăn đã sẵn sàng phục vụ',
      data: {
        id: foundItem.id,
        order_id: foundOrder.id,
        table_name: tableMap.get(foundOrder.table_id) || 'Bàn',
        dish_name: foundItem.dish_name,
        quantity: foundItem.quantity,
        note: foundItem.note,
        status: 'COOKING',
        sent_at: foundItem.sent_at,
        started_at: foundItem.started_at,
      },
    };
  },
};
