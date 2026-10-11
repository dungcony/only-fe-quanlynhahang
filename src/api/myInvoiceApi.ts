import type { ApiResponse, PageResponse } from '@/utils/apiTypes';
import type { InvoiceDetail, InvoiceSummary } from '@/api/invoiceApi';
import { getCollection, STORAGE_KEYS, mockDelay, paginate } from '@/mock/mockStorage';
import type { MockInvoice } from '@/mock/mockData';

export interface MyInvoiceQuery {
  page?: number;
  page_size?: number;
}

export const myInvoiceApi = {
  // danh sách hóa đơn đã thanh toán của chính khách hàng
  getMyInvoices: async (params?: MyInvoiceQuery): Promise<ApiResponse<PageResponse<InvoiceSummary>>> => {
    await mockDelay(100);
    const invoices = getCollection<MockInvoice>(STORAGE_KEYS.INVOICES);

    invoices.sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime());

    const summaries: InvoiceSummary[] = invoices.map((inv) => ({
      id: inv.id,
      code: inv.code,
      table_name: inv.table_name,
      paid_at: inv.paid_at,
      total_amount: inv.total_amount,
      payment_method: inv.payment_method,
    }));

    return {
      success: true,
      msg: 'Lấy danh sách hóa đơn của tôi thành công',
      data: paginate(summaries, params?.page || 1, params?.page_size || 10),
    };
  },

  // xem chi tiết một hóa đơn của tôi
  getMyInvoiceDetail: async (id: string): Promise<ApiResponse<InvoiceDetail>> => {
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
};

export default myInvoiceApi;
