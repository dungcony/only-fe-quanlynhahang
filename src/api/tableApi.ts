import type {
  ApiResponse,
  PageResponse,
  TableResponse,
  TableCreateRequest,
  TableUpdateRequest,
  TableSearchRequest,
} from '@/utils/apiTypes';
import { getCollection, saveCollection, STORAGE_KEYS, mockDelay, paginate } from '@/mock/mockStorage';
import type { MockTable } from '@/mock/mockData';

export const tableApi = {
  // tìm kiếm và lấy danh sách phân trang bàn ăn
  searchTables: async (
    params: TableSearchRequest & { page?: number; page_size?: number; sort_by?: string; sort_order?: string }
  ): Promise<ApiResponse<PageResponse<TableResponse>>> => {
    await mockDelay(100);
    const tables = getCollection<MockTable>(STORAGE_KEYS.TABLES);

    let filtered = tables.filter((tbl) => {
      if (params.name && !tbl.name.toLowerCase().includes(params.name.toLowerCase())) {
        return false;
      }
      if (params.zone && tbl.zone !== params.zone) {
        return false;
      }
      if (params.status && tbl.status !== params.status) {
        return false;
      }
      if (params.min_capacity && tbl.capacity < params.min_capacity) {
        return false;
      }
      return true;
    });

    const responseTables: TableResponse[] = filtered.map((t) => ({
      id: t.id,
      name: t.name,
      zone: t.zone,
      capacity: t.capacity,
      status: t.status,
      note: t.note,
    }));

    return {
      success: true,
      msg: 'Lấy danh sách bàn thành công',
      data: paginate(responseTables, params.page || 1, params.page_size || 20),
    };
  },

  // lấy chi tiết một bàn ăn
  getTable: async (id: string): Promise<ApiResponse<TableResponse>> => {
    await mockDelay(100);
    const tables = getCollection<MockTable>(STORAGE_KEYS.TABLES);
    const tbl = tables.find((t) => t.id === id);

    if (!tbl) {
      throw {
        success: false,
        error: { code: 'TABLE_NOT_FOUND', message: 'Không tìm thấy bàn ăn' },
      };
    }

    return {
      success: true,
      msg: 'Lấy chi tiết bàn thành công',
      data: {
        id: tbl.id,
        name: tbl.name,
        zone: tbl.zone,
        capacity: tbl.capacity,
        status: tbl.status,
        note: tbl.note,
      },
    };
  },

  // tạo mới bàn ăn
  createTable: async (data: TableCreateRequest): Promise<ApiResponse<TableResponse>> => {
    await mockDelay(150);
    const tables = getCollection<MockTable>(STORAGE_KEYS.TABLES);

    const newTable: MockTable = {
      id: `tbl-${Date.now()}`,
      name: data.name,
      zone: data.zone,
      capacity: data.capacity,
      status: 'AVAILABLE',
      note: data.note,
    };

    tables.push(newTable);
    saveCollection(STORAGE_KEYS.TABLES, tables);

    return {
      success: true,
      msg: 'Tạo bàn ăn thành công',
      data: {
        id: newTable.id,
        name: newTable.name,
        zone: newTable.zone,
        capacity: newTable.capacity,
        status: newTable.status,
        note: newTable.note,
      },
    };
  },

  // cập nhật thông tin bàn ăn
  updateTable: async (id: string, data: TableUpdateRequest): Promise<ApiResponse<TableResponse>> => {
    await mockDelay(150);
    const tables = getCollection<MockTable>(STORAGE_KEYS.TABLES);
    const tbl = tables.find((t) => t.id === id);

    if (!tbl) {
      throw {
        success: false,
        error: { code: 'TABLE_NOT_FOUND', message: 'Không tìm thấy bàn ăn' },
      };
    }

    tbl.name = data.name;
    tbl.zone = data.zone;
    tbl.capacity = data.capacity;
    if (data.note !== undefined) tbl.note = data.note;
    if (data.status) tbl.status = data.status;

    saveCollection(STORAGE_KEYS.TABLES, tables);

    return {
      success: true,
      msg: 'Cập nhật bàn ăn thành công',
      data: {
        id: tbl.id,
        name: tbl.name,
        zone: tbl.zone,
        capacity: tbl.capacity,
        status: tbl.status,
        note: tbl.note,
      },
    };
  },

  // xóa bàn ăn
  deleteTable: async (id: string): Promise<ApiResponse<void>> => {
    await mockDelay(150);
    const tables = getCollection<MockTable>(STORAGE_KEYS.TABLES);
    const nextTables = tables.filter((t) => t.id !== id);
    saveCollection(STORAGE_KEYS.TABLES, nextTables);

    return {
      success: true,
      msg: 'Xóa bàn ăn thành công',
      data: undefined,
    };
  },
};

export default tableApi;
