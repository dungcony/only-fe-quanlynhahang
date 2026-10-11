import type { ApiResponse, PageResponse, PaymentMethod } from '@/utils/apiTypes';
import { getCollection, saveCollection, STORAGE_KEYS, mockDelay, paginate } from '@/mock/mockStorage';
import type { MockInvoice } from '@/mock/mockData';

export interface InvoiceSummary {
  id: string;
  code: string;
  table_name: string;
  paid_at: string;
  total_amount: number;
  payment_method: PaymentMethod;
}

export interface InvoiceItem {
  dish_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface InvoiceDetail {
  id: string;
  code: string;
  status: 'PAID';
  table_name: string;
  cashier_name: string;
  paid_at: string;
  items: InvoiceItem[];
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  amount_received: number;
  change_amount: number;
  note: string | null;
  print_count: number;
  reprint: boolean;
}

export interface InvoiceSearchQuery {
  code?: string;
  from_date?: string;
  to_date?: string;
  table?: string;
  payment_method?: PaymentMethod;
  page?: number;
  page_size?: number;
  sort_by?: 'paid_at' | 'total_amount' | 'code';
  sort_order?: 'asc' | 'desc';
}

export const invoiceApi = {
  // tìm kiếm và lọc danh sách hóa đơn đã thanh toán
  search: async (params: InvoiceSearchQuery): Promise<ApiResponse<PageResponse<InvoiceSummary>>> => {
    await mockDelay(100);
    const invoices = getCollection<MockInvoice>(STORAGE_KEYS.INVOICES);

    let filtered = invoices.filter((inv) => {
      if (params.code && !inv.code.toLowerCase().includes(params.code.toLowerCase())) {
        return false;
      }
      if (params.table && !inv.table_name.toLowerCase().includes(params.table.toLowerCase())) {
        return false;
      }
      if (params.payment_method && inv.payment_method !== params.payment_method) {
        return false;
      }
      if (params.from_date && new Date(inv.paid_at) < new Date(params.from_date)) {
        return false;
      }
      if (params.to_date && new Date(inv.paid_at) > new Date(params.to_date)) {
        return false;
      }
      return true;
    });

    filtered.sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime());

    const summaries: InvoiceSummary[] = filtered.map((inv) => ({
      id: inv.id,
      code: inv.code,
      table_name: inv.table_name,
      paid_at: inv.paid_at,
      total_amount: inv.total_amount,
      payment_method: inv.payment_method,
    }));

    return {
      success: true,
      msg: 'Lấy danh sách hóa đơn thành công',
      data: paginate(summaries, params.page || 1, params.page_size || 15),
    };
  },

  // xem chi tiết hóa đơn
  get: async (id: string): Promise<ApiResponse<InvoiceDetail>> => {
    await mockDelay(100);
    const invoices = getCollection<MockInvoice>(STORAGE_KEYS.INVOICES);
    const inv = invoices.find((i) => i.id === id);

    if (!inv) {
      throw {
        success: false,
        error: { code: 'INVOICE_NOT_FOUND', message: 'Không tìm thấy hóa đơn' },
      };
    }

    return {
      success: true,
      msg: 'Lấy chi tiết hóa đơn thành công',
      data: {
        id: inv.id,
        code: inv.code,
        status: 'PAID',
        table_name: inv.table_name,
        cashier_name: inv.cashier_name,
        paid_at: inv.paid_at,
        items: inv.items,
        subtotal: inv.subtotal,
        vat_rate: inv.vat_rate,
        vat_amount: inv.vat_amount,
        total_amount: inv.total_amount,
        payment_method: inv.payment_method,
        amount_received: inv.amount_received,
        change_amount: inv.change_amount,
        note: inv.note,
        print_count: inv.print_count,
        reprint: false,
      },
    };
  },

  // in lại hóa đơn
  reprint: async (id: string): Promise<ApiResponse<InvoiceDetail>> => {
    await mockDelay(100);
    const invoices = getCollection<MockInvoice>(STORAGE_KEYS.INVOICES);
    const inv = invoices.find((i) => i.id === id);

    if (!inv) {
      throw {
        success: false,
        error: { code: 'INVOICE_NOT_FOUND', message: 'Không tìm thấy hóa đơn' },
      };
    }

    inv.print_count = (inv.print_count || 1) + 1;
    saveCollection(STORAGE_KEYS.INVOICES, invoices);

    return {
      success: true,
      msg: 'In lại hóa đơn thành công',
      data: {
        id: inv.id,
        code: inv.code,
        status: 'PAID',
        table_name: inv.table_name,
        cashier_name: inv.cashier_name,
        paid_at: inv.paid_at,
        items: inv.items,
        subtotal: inv.subtotal,
        vat_rate: inv.vat_rate,
        vat_amount: inv.vat_amount,
        total_amount: inv.total_amount,
        payment_method: inv.payment_method,
        amount_received: inv.amount_received,
        change_amount: inv.change_amount,
        note: inv.note,
        print_count: inv.print_count,
        reprint: true,
      },
    };
  },
};

export default invoiceApi;
