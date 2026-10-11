import type { ApiResponse } from '@/utils/apiTypes';
import { getCollection, STORAGE_KEYS, mockDelay } from '@/mock/mockStorage';
import type { MockInvoice } from '@/mock/mockData';

export interface RevenuePoint {
  date?: string;
  month?: string;
  invoice_count: number;
  subtotal: number;
  vat_amount: number;
  total_amount: number;
}

export interface RevenueSummary {
  invoice_count: number;
  subtotal: number;
  vat_amount: number;
  total_amount: number;
}

export interface RevenueReport {
  points: RevenuePoint[];
  summary: RevenueSummary;
}

export interface TopDishItem {
  dish_id: string;
  dish_name: string;
  quantity: number;
  revenue: number;
}

export interface TopDishesReport {
  items: TopDishItem[];
}

export interface ReportRange {
  from_date: string;
  to_date: string;
}

export const reportApi = {
  // báo cáo doanh thu theo từng ngày
  dailyRevenue: async (_params: ReportRange): Promise<ApiResponse<RevenueReport>> => {
    await mockDelay(100);
    const invoices = getCollection<MockInvoice>(STORAGE_KEYS.INVOICES);

    const dateMap = new Map<string, { count: number; subtotal: number; vat: number; total: number }>();

    for (const inv of invoices) {
      const d = inv.paid_at.slice(0, 10);
      const curr = dateMap.get(d) || { count: 0, subtotal: 0, vat: 0, total: 0 };
      curr.count += 1;
      curr.subtotal += inv.subtotal;
      curr.vat += inv.vat_amount;
      curr.total += inv.total_amount;
      dateMap.set(d, curr);
    }

    const points: RevenuePoint[] = Array.from(dateMap.entries()).map(([date, val]) => ({
      date,
      invoice_count: val.count,
      subtotal: val.subtotal,
      vat_amount: val.vat,
      total_amount: val.total,
    }));

    points.sort((a, b) => a.date!.localeCompare(b.date!));

    const totalSub = points.reduce((acc, p) => acc + p.subtotal, 0);
    const totalVat = points.reduce((acc, p) => acc + p.vat_amount, 0);
    const totalAll = points.reduce((acc, p) => acc + p.total_amount, 0);

    return {
      success: true,
      msg: 'Lấy báo cáo doanh thu theo ngày thành công',
      data: {
        points,
        summary: {
          invoice_count: invoices.length,
          subtotal: totalSub,
          vat_amount: totalVat,
          total_amount: totalAll,
        },
      },
    };
  },

  // báo cáo doanh thu theo từng tháng
  monthlyRevenue: async (_params: ReportRange): Promise<ApiResponse<RevenueReport>> => {
    await mockDelay(100);
    const invoices = getCollection<MockInvoice>(STORAGE_KEYS.INVOICES);

    const monthMap = new Map<string, { count: number; subtotal: number; vat: number; total: number }>();

    for (const inv of invoices) {
      const m = inv.paid_at.slice(0, 7);
      const curr = monthMap.get(m) || { count: 0, subtotal: 0, vat: 0, total: 0 };
      curr.count += 1;
      curr.subtotal += inv.subtotal;
      curr.vat += inv.vat_amount;
      curr.total += inv.total_amount;
      monthMap.set(m, curr);
    }

    const points: RevenuePoint[] = Array.from(monthMap.entries()).map(([month, val]) => ({
      month,
      invoice_count: val.count,
      subtotal: val.subtotal,
      vat_amount: val.vat,
      total_amount: val.total,
    }));

    points.sort((a, b) => a.month!.localeCompare(b.month!));

    const totalSub = points.reduce((acc, p) => acc + p.subtotal, 0);
    const totalVat = points.reduce((acc, p) => acc + p.vat_amount, 0);
    const totalAll = points.reduce((acc, p) => acc + p.total_amount, 0);

    return {
      success: true,
      msg: 'Lấy báo cáo doanh thu theo tháng thành công',
      data: {
        points,
        summary: {
          invoice_count: invoices.length,
          subtotal: totalSub,
          vat_amount: totalVat,
          total_amount: totalAll,
        },
      },
    };
  },

  // top các món ăn bán chạy nhất
  topDishes: async (params: ReportRange & { top_n?: number }): Promise<ApiResponse<TopDishesReport>> => {
    await mockDelay(100);
    const invoices = getCollection<MockInvoice>(STORAGE_KEYS.INVOICES);

    const dishSales = new Map<string, { name: string; quantity: number; revenue: number }>();

    for (const inv of invoices) {
      for (const item of inv.items) {
        const curr = dishSales.get(item.dish_name) || { name: item.dish_name, quantity: 0, revenue: 0 };
        curr.quantity += item.quantity;
        curr.revenue += item.line_total;
        dishSales.set(item.dish_name, curr);
      }
    }

    const sortedDishes = Array.from(dishSales.entries())
      .map(([name, val], idx) => ({
        dish_id: `dish-top-${idx + 1}`,
        dish_name: name,
        quantity: val.quantity,
        revenue: val.revenue,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, params.top_n || 10);

    return {
      success: true,
      msg: 'Lấy danh sách món bán chạy thành công',
      data: {
        items: sortedDishes,
      },
    };
  },
};
