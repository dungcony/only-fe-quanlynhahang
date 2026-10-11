import type { ApiResponse } from '@/utils/apiTypes';
import { getCollection, saveCollection, STORAGE_KEYS, mockDelay } from '@/mock/mockStorage';
import type { MockCategory, MockDish } from '@/mock/mockData';

export interface CategoryResponse {
  id: string;
  name: string;
  sort_order: number;
  dish_count: number;
}

export interface CategoryPayload {
  name: string;
  sort_order: number;
}

export const categoryApi = {
  // lấy danh sách tất cả các danh mục món ăn
  list: async (): Promise<ApiResponse<CategoryResponse[]>> => {
    await mockDelay(100);
    const categories = getCollection<MockCategory>(STORAGE_KEYS.CATEGORIES);
    const dishes = getCollection<MockDish>(STORAGE_KEYS.DISHES);

    const result: CategoryResponse[] = categories
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        sort_order: cat.sort_order,
        dish_count: dishes.filter((d) => d.category_id === cat.id).length,
      }));

    return {
      success: true,
      msg: 'Lấy danh mục thành công',
      data: result,
    };
  },

  // tạo mới một danh mục món ăn
  create: async (data: CategoryPayload): Promise<ApiResponse<CategoryResponse>> => {
    await mockDelay(150);
    const categories = getCollection<MockCategory>(STORAGE_KEYS.CATEGORIES);
    const newCat: MockCategory = {
      id: `cat-${Date.now()}`,
      name: data.name,
      sort_order: data.sort_order,
    };
    categories.push(newCat);
    saveCollection(STORAGE_KEYS.CATEGORIES, categories);

    return {
      success: true,
      msg: 'Tạo danh mục thành công',
      data: {
        id: newCat.id,
        name: newCat.name,
        sort_order: newCat.sort_order,
        dish_count: 0,
      },
    };
  },

  // cập nhật tên hoặc thứ tự hiển thị danh mục
  update: async (id: string, data: CategoryPayload): Promise<ApiResponse<CategoryResponse>> => {
    await mockDelay(150);
    const categories = getCollection<MockCategory>(STORAGE_KEYS.CATEGORIES);
    const cat = categories.find((c) => c.id === id);
    if (!cat) {
      throw {
        success: false,
        error: { code: 'CATEGORY_NOT_FOUND', message: 'Không tìm thấy danh mục' },
      };
    }

    cat.name = data.name;
    cat.sort_order = data.sort_order;
    saveCollection(STORAGE_KEYS.CATEGORIES, categories);

    const dishes = getCollection<MockDish>(STORAGE_KEYS.DISHES);
    return {
      success: true,
      msg: 'Cập nhật danh mục thành công',
      data: {
        id: cat.id,
        name: cat.name,
        sort_order: cat.sort_order,
        dish_count: dishes.filter((d) => d.category_id === cat.id).length,
      },
    };
  },

  // xóa danh mục nếu không còn món ăn nào thuộc danh mục này
  remove: async (id: string): Promise<ApiResponse<null>> => {
    await mockDelay(150);
    const categories = getCollection<MockCategory>(STORAGE_KEYS.CATEGORIES);
    const dishes = getCollection<MockDish>(STORAGE_KEYS.DISHES);

    const hasDish = dishes.some((d) => d.category_id === id);
    if (hasDish) {
      throw {
        success: false,
        error: {
          code: 'CATEGORY_IN_USE',
          message: 'Không thể xóa danh mục đang có món ăn',
        },
      };
    }

    const nextCats = categories.filter((c) => c.id !== id);
    saveCollection(STORAGE_KEYS.CATEGORIES, nextCats);

    return {
      success: true,
      msg: 'Xóa danh mục thành công',
      data: null,
    };
  },
};
