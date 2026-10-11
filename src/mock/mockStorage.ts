import type { PageMeta, PageResponse } from '@/utils/apiTypes';
import {
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_DISHES,
  INITIAL_TABLES,
  INITIAL_ORDERS,
  INITIAL_RESERVATIONS,
  INITIAL_INVOICES,
} from './mockData';

export const STORAGE_KEYS = {
  USERS: 'app_mock_users',
  CATEGORIES: 'app_mock_categories',
  DISHES: 'app_mock_dishes',
  TABLES: 'app_mock_tables',
  ORDERS: 'app_mock_orders',
  RESERVATIONS: 'app_mock_reservations',
  INVOICES: 'app_mock_invoices',
  CURRENT_USER_ID: 'app_mock_current_user_id',
};

// đọc danh sách từ localStorage
export function getCollection<T>(key: string, fallback: T[] = []): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

// lưu danh sách vào localStorage
export function saveCollection<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (err) {
    console.error('Lỗi khi lưu dữ liệu localStorage:', err);
  }
}

// khóa phiên bản dữ liệu mẫu để tự động nâng cấp khi có cập nhật từ migration
const DATA_VERSION_KEY = 'app_mock_version';
const CURRENT_DATA_VERSION = 'v2';

// khởi tạo dữ liệu mẫu nếu chưa có hoặc khi phiên bản dữ liệu được nâng cấp
export function initSeedDataIfEmpty(): void {
  const currentVersion = localStorage.getItem(DATA_VERSION_KEY);
  if (currentVersion !== CURRENT_DATA_VERSION) {
    resetToDefaultData();
    localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
    return;
  }

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    saveCollection(STORAGE_KEYS.USERS, INITIAL_USERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    saveCollection(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.DISHES)) {
    saveCollection(STORAGE_KEYS.DISHES, INITIAL_DISHES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.TABLES)) {
    saveCollection(STORAGE_KEYS.TABLES, INITIAL_TABLES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    saveCollection(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.RESERVATIONS)) {
    saveCollection(STORAGE_KEYS.RESERVATIONS, INITIAL_RESERVATIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.INVOICES)) {
    saveCollection(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
  }
}

// khôi phục toàn bộ dữ liệu về trạng thái mẫu ban đầu
export function resetToDefaultData(): void {
  saveCollection(STORAGE_KEYS.USERS, INITIAL_USERS);
  saveCollection(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  saveCollection(STORAGE_KEYS.DISHES, INITIAL_DISHES);
  saveCollection(STORAGE_KEYS.TABLES, INITIAL_TABLES);
  saveCollection(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  saveCollection(STORAGE_KEYS.RESERVATIONS, INITIAL_RESERVATIONS);
  saveCollection(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
}

// tạo độ trễ giả lập mạng giúp giao diện hiển thị spinner mượt mà
export function mockDelay(ms = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// tiện ích phân trang mảng theo trang và kích thước trang
export function paginate<T>(items: T[], page = 1, pageSize = 10): PageResponse<T> {
  const currentPage = Math.max(1, page);
  const size = Math.max(1, pageSize);
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / size) || 1;
  const startIndex = (currentPage - 1) * size;
  const pageItems = items.slice(startIndex, startIndex + size);

  const meta: PageMeta = {
    page: currentPage,
    page_size: size,
    total_items: totalItems,
    total_pages: totalPages,
  };

  return {
    items: pageItems,
    meta,
  };
}

// tự động chạy khởi tạo ngay khi nạp module
initSeedDataIfEmpty();
