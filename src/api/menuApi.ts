import type { ApiResponse, PageResponse } from '@/utils/apiTypes';
import { getCollection, STORAGE_KEYS, mockDelay, paginate } from '@/mock/mockStorage';
import type { MockCategory, MockDish } from '@/mock/mockData';

export interface MenuCategoryResponse {
  id: string;
  name: string;
  sort_order: number;
  dish_count: number;
}

export interface DishSummaryResponse {
  id: string;
  name: string;
  category_id: string;
  category_name: string;
  price: number;
  unit: string;
  description: string | null;
  image_url: string | null;
  status: 'AVAILABLE' | 'OUT_OF_STOCK';
}

export interface DishDetailResponse extends DishSummaryResponse {
  prep_time_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface MenuDishQuery {
  category_id?: string;
  name?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  page_size?: number;
  sort_by?: 'name' | 'price' | 'category' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export const menuApi = {
  // danh mục kèm số món đang hiển thị trên thực đơn công khai
  getCategories: async (): Promise<ApiResponse<MenuCategoryResponse[]>> => {
    await mockDelay(100);
    const categories = getCollection<MockCategory>(STORAGE_KEYS.CATEGORIES);
    const dishes = getCollection<MockDish>(STORAGE_KEYS.DISHES);

    const result: MenuCategoryResponse[] = categories
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        sort_order: cat.sort_order,
        dish_count: dishes.filter(
          (d) => d.category_id === cat.id && (d.status === 'AVAILABLE' || d.status === 'OUT_OF_STOCK')
        ).length,
      }));

    return {
      success: true,
      msg: 'Lấy danh mục thực đơn thành công',
      data: result,
    };
  },

  // lấy danh sách món ăn hiển thị cho khách hàng
  getDishes: async (params?: MenuDishQuery): Promise<ApiResponse<PageResponse<DishSummaryResponse>>> => {
    await mockDelay(100);
    const dishes = getCollection<MockDish>(STORAGE_KEYS.DISHES);
    const categories = getCollection<MockCategory>(STORAGE_KEYS.CATEGORIES);
    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    let publicDishes = dishes.filter(
      (d) => d.status === 'AVAILABLE' || d.status === 'OUT_OF_STOCK'
    );

    if (params?.category_id) {
      publicDishes = publicDishes.filter((d) => d.category_id === params.category_id);
    }
    if (params?.name) {
      publicDishes = publicDishes.filter((d) =>
        d.name.toLowerCase().includes(params.name!.toLowerCase())
      );
    }
    if (params?.min_price !== undefined) {
      publicDishes = publicDishes.filter((d) => d.price >= params.min_price!);
    }
    if (params?.max_price !== undefined) {
      publicDishes = publicDishes.filter((d) => d.price <= params.max_price!);
    }

    const items: DishSummaryResponse[] = publicDishes.map((d) => ({
      id: d.id,
      name: d.name,
      category_id: d.category_id,
      category_name: categoryMap.get(d.category_id) || 'Khác',
      price: d.price,
      unit: d.unit,
      description: d.description,
      image_url: d.image_url,
      status: d.status as 'AVAILABLE' | 'OUT_OF_STOCK',
    }));

    if (params?.sort_by === 'price') {
      items.sort((a, b) => (params.sort_order === 'desc' ? b.price - a.price : a.price - b.price));
    } else {
      items.sort((a, b) => a.name.localeCompare(b.name));
    }

    return {
      success: true,
      msg: 'Lấy danh sách món ăn thành công',
      data: paginate(items, params?.page || 1, params?.page_size || 12),
    };
  },

  // xem chi tiết một món ăn
  getDish: async (id: string): Promise<ApiResponse<DishDetailResponse>> => {
    await mockDelay(100);
    const dishes = getCollection<MockDish>(STORAGE_KEYS.DISHES);
    const categories = getCollection<MockCategory>(STORAGE_KEYS.CATEGORIES);
    const dish = dishes.find((d) => d.id === id);

    if (!dish) {
      throw {
        success: false,
        error: { code: 'DISH_NOT_FOUND', message: 'Món ăn không tồn tại' },
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
        status: (dish.status === 'AVAILABLE' ? 'AVAILABLE' : 'OUT_OF_STOCK') as 'AVAILABLE' | 'OUT_OF_STOCK',
        created_at: dish.created_at,
        updated_at: dish.updated_at,
      },
    };
  },
};
