import type { ApiResponse, DishStatus, PageResponse } from '@/utils/apiTypes';
import { getCollection, saveCollection, STORAGE_KEYS, mockDelay, paginate } from '@/mock/mockStorage';
import type { MockCategory, MockDish } from '@/mock/mockData';

export interface DishSummary {
  id: string;
  name: string;
  category_id: string;
  category_name: string;
  price: number;
  unit: string;
  image_url: string | null;
  status: DishStatus;
}

export interface DishDetail extends DishSummary {
  description: string | null;
  prep_time_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface DishSearchQuery {
  name?: string;
  category_id?: string;
  min_price?: number;
  max_price?: number;
  status?: DishStatus;
  page?: number;
  page_size?: number;
  sort_by?: 'name' | 'price' | 'category' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface DishPayload {
  name: string;
  category_id: string;
  price: number;
  unit: string;
  description?: string;
  prep_time_minutes?: number;
  status: DishStatus;
}

export const dishApi = {
  // tìm kiếm và lọc danh sách món ăn cho trang quản trị
  search: async (params: DishSearchQuery): Promise<ApiResponse<PageResponse<DishSummary>>> => {
    await mockDelay(100);
    const dishes = getCollection<MockDish>(STORAGE_KEYS.DISHES);
    const categories = getCollection<MockCategory>(STORAGE_KEYS.CATEGORIES);

    let filtered = dishes.filter((dish) => {
      if (params.name && !dish.name.toLowerCase().includes(params.name.toLowerCase())) {
        return false;
      }
      if (params.category_id && dish.category_id !== params.category_id) {
        return false;
      }
      if (params.status && dish.status !== params.status) {
        return false;
      }
      if (params.min_price !== undefined && dish.price < params.min_price) {
        return false;
      }
      if (params.max_price !== undefined && dish.price > params.max_price) {
        return false;
      }
      return true;
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    const summaries: DishSummary[] = filtered.map((d) => ({
      id: d.id,
      name: d.name,
      category_id: d.category_id,
      category_name: categoryMap.get(d.category_id) || 'Khác',
      price: d.price,
      unit: d.unit,
      image_url: d.image_url,
      status: d.status,
    }));

    if (params.sort_by === 'price') {
      summaries.sort((a, b) => (params.sort_order === 'desc' ? b.price - a.price : a.price - b.price));
    } else {
      summaries.sort((a, b) => a.name.localeCompare(b.name));
    }

    return {
      success: true,
      msg: 'Lấy danh sách món ăn thành công',
      data: paginate(summaries, params.page || 1, params.page_size || 10),
    };
  },

  // lấy chi tiết món ăn theo mã
  get: async (id: string): Promise<ApiResponse<DishDetail>> => {
    await mockDelay(100);
    const dishes = getCollection<MockDish>(STORAGE_KEYS.DISHES);
    const categories = getCollection<MockCategory>(STORAGE_KEYS.CATEGORIES);
    const dish = dishes.find((d) => d.id === id);

    if (!dish) {
      throw {
        success: false,
        error: { code: 'DISH_NOT_FOUND', message: 'Không tìm thấy món ăn' },
      };
    }

    const category = categories.find((c) => c.id === dish.category_id);

    return {
      success: true,
      msg: 'Lấy chi tiết món ăn thành công',
      data: {
        id: dish.id,
        name: dish.name,
        category_id: dish.category_id,
        category_name: category ? category.name : 'Khác',
        price: dish.price,
        unit: dish.unit,
        description: dish.description,
        image_url: dish.image_url,
        prep_time_minutes: dish.prep_time_minutes,
        status: dish.status,
        created_at: dish.created_at,
        updated_at: dish.updated_at,
      },
    };
  },

  // thêm món ăn mới
  create: async (data: DishPayload): Promise<ApiResponse<DishDetail>> => {
    await mockDelay(150);
    const dishes = getCollection<MockDish>(STORAGE_KEYS.DISHES);
    const categories = getCollection<MockCategory>(STORAGE_KEYS.CATEGORIES);

    const newDish: MockDish = {
      id: `dish-${Date.now()}`,
      name: data.name,
      category_id: data.category_id,
      price: data.price,
      unit: data.unit,
      description: data.description || '',
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      prep_time_minutes: data.prep_time_minutes || 15,
      status: data.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dishes.push(newDish);
    saveCollection(STORAGE_KEYS.DISHES, dishes);

    const category = categories.find((c) => c.id === newDish.category_id);

    return {
      success: true,
      msg: 'Thêm món ăn thành công',
      data: {
        id: newDish.id,
        name: newDish.name,
        category_id: newDish.category_id,
        category_name: category ? category.name : 'Khác',
        price: newDish.price,
        unit: newDish.unit,
        description: newDish.description,
        image_url: newDish.image_url,
        prep_time_minutes: newDish.prep_time_minutes,
        status: newDish.status,
        created_at: newDish.created_at,
        updated_at: newDish.updated_at,
      },
    };
  },

  // cập nhật thông tin món ăn
  update: async (id: string, data: DishPayload): Promise<ApiResponse<DishDetail>> => {
    await mockDelay(150);
    const dishes = getCollection<MockDish>(STORAGE_KEYS.DISHES);
    const categories = getCollection<MockCategory>(STORAGE_KEYS.CATEGORIES);
    const dish = dishes.find((d) => d.id === id);

    if (!dish) {
      throw {
        success: false,
        error: { code: 'DISH_NOT_FOUND', message: 'Không tìm thấy món ăn' },
      };
    }

    dish.name = data.name;
    dish.category_id = data.category_id;
    dish.price = data.price;
    dish.unit = data.unit;
    dish.description = data.description || dish.description;
    dish.prep_time_minutes = data.prep_time_minutes || dish.prep_time_minutes;
    dish.status = data.status;
    dish.updated_at = new Date().toISOString();

    saveCollection(STORAGE_KEYS.DISHES, dishes);

    const category = categories.find((c) => c.id === dish.category_id);

    return {
      success: true,
      msg: 'Cập nhật món ăn thành công',
      data: {
        id: dish.id,
        name: dish.name,
        category_id: dish.category_id,
        category_name: category ? category.name : 'Khác',
        price: dish.price,
        unit: dish.unit,
        description: dish.description,
        image_url: dish.image_url,
        prep_time_minutes: dish.prep_time_minutes,
        status: dish.status,
        created_at: dish.created_at,
        updated_at: dish.updated_at,
      },
    };
  },

  // tải lên và cập nhật hình ảnh món ăn
  uploadImage: async (id: string, file: File): Promise<ApiResponse<DishDetail>> => {
    await mockDelay(200);
    const dishes = getCollection<MockDish>(STORAGE_KEYS.DISHES);
    const categories = getCollection<MockCategory>(STORAGE_KEYS.CATEGORIES);
    const dish = dishes.find((d) => d.id === id);

    if (!dish) {
      throw {
        success: false,
        error: { code: 'DISH_NOT_FOUND', message: 'Không tìm thấy món ăn' },
      };
    }

    dish.image_url = URL.createObjectURL(file);
    dish.updated_at = new Date().toISOString();
    saveCollection(STORAGE_KEYS.DISHES, dishes);

    const category = categories.find((c) => c.id === dish.category_id);

    return {
      success: true,
      msg: 'Cập nhật hình ảnh thành công',
      data: {
        id: dish.id,
        name: dish.name,
        category_id: dish.category_id,
        category_name: category ? category.name : 'Khác',
        price: dish.price,
        unit: dish.unit,
        description: dish.description,
        image_url: dish.image_url,
        prep_time_minutes: dish.prep_time_minutes,
        status: dish.status,
        created_at: dish.created_at,
        updated_at: dish.updated_at,
      },
    };
  },

  // xóa món ăn khỏi thực đơn
  remove: async (id: string): Promise<ApiResponse<null>> => {
    await mockDelay(150);
    const dishes = getCollection<MockDish>(STORAGE_KEYS.DISHES);
    const nextDishes = dishes.filter((d) => d.id !== id);
    saveCollection(STORAGE_KEYS.DISHES, nextDishes);

    return {
      success: true,
      msg: 'Xóa món ăn thành công',
      data: null,
    };
  },
};
