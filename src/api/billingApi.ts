import type { ApiResponse, OrderItemStatus, PaymentMethod } from '@/utils/apiTypes';
import type { TableBrief } from '@/api/reservationApi';
import type { InvoiceDetail } from '@/api/invoiceApi';
import { getCollection, saveCollection, STORAGE_KEYS, mockDelay } from '@/mock/mockStorage';
import type { MockOrder, MockTable, MockInvoice, MockUser } from '@/mock/mockData';

export interface PaymentLine {
  dish_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  status: OrderItemStatus;
}

export interface PaymentSummary {
  order_id: string;
  table: TableBrief;
  opened_at: string;
  lines: PaymentLine[];
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total_amount: number;
  unserved_count: number;
}

export interface InvoiceCreatePayload {
  order_id: string;
  payment_method: PaymentMethod;
  amount_received?: number;
  note?: string;
  confirm_unserved: boolean;
}

export const billingApi = {
  // tóm tắt thanh toán của đơn đang mở
  getPaymentSummary: async (orderId: string): Promise<ApiResponse<PaymentSummary>> => {
    await mockDelay(100);
    const orders = getCollection<MockOrder>(STORAGE_KEYS.ORDERS);
    const tables = getCollection<MockTable>(STORAGE_KEYS.TABLES);

    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      throw {
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: 'Không tìm thấy đơn hàng' },
      };
    }

    const table = tables.find((t) => t.id === order.table_id) || {
      id: order.table_id,
      name: 'Bàn',
      zone: 'INDOOR',
      capacity: 4,
      status: 'AVAILABLE',
    };

    const activeItems = order.items.filter((it) => it.status !== 'CANCELLED');
    const lines: PaymentLine[] = activeItems.map((it) => ({
      dish_name: it.dish_name,
      unit_price: it.unit_price,
      quantity: it.quantity,
      line_total: it.line_total,
      status: it.status,
    }));

    const subtotal = lines.reduce((acc, line) => acc + line.line_total, 0);
    const vatRate = 0.08;
    const vatAmount = Math.round(subtotal * vatRate);
    const totalAmount = subtotal + vatAmount;
    const unservedCount = activeItems.filter((it) => it.status !== 'SERVED').length;

    return {
      success: true,
      msg: 'Lấy thông tin thanh toán thành công',
      data: {
        order_id: order.id,
        table: {
          id: table.id,
          name: table.name,
          zone: table.zone,
          capacity: table.capacity,
          status: table.status,
        },
        opened_at: order.opened_at,
        lines,
        subtotal,
        vat_rate: vatRate,
        vat_amount: vatAmount,
        total_amount: totalAmount,
        unserved_count: unservedCount,
      },
    };
  },

  // tạo hóa đơn và hoàn tất đóng đơn hàng
  createInvoice: async (data: InvoiceCreatePayload): Promise<ApiResponse<InvoiceDetail>> => {
    await mockDelay(150);
    const orders = getCollection<MockOrder>(STORAGE_KEYS.ORDERS);
    const tables = getCollection<MockTable>(STORAGE_KEYS.TABLES);
    const invoices = getCollection<MockInvoice>(STORAGE_KEYS.INVOICES);
    const users = getCollection<MockUser>(STORAGE_KEYS.USERS);

    const order = orders.find((o) => o.id === data.order_id);
    if (!order) {
      throw {
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: 'Không tìm thấy đơn hàng' },
      };
    }

    const table = tables.find((t) => t.id === order.table_id);
    const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    const cashier = users.find((u) => u.id === currentUserId) || users[1];

    const activeItems = order.items.filter((it) => it.status !== 'CANCELLED');
    const subtotal = activeItems.reduce((acc, it) => acc + it.line_total, 0);
    const vatRate = 0.08;
    const vatAmount = Math.round(subtotal * vatRate);
    const totalAmount = subtotal + vatAmount;

    const amountReceived = data.amount_received || totalAmount;
    const changeAmount = Math.max(0, amountReceived - totalAmount);

    const invoiceDate = new Date();
    const dateCode = invoiceDate.toISOString().slice(0, 10).replace(/-/g, '');
    const code = `HD-${dateCode}-${String(invoices.length + 1).padStart(3, '0')}`;

    const newInvoice: MockInvoice = {
      id: `inv-${Date.now()}`,
      code,
      order_id: order.id,
      table_id: order.table_id,
      table_name: table ? table.name : 'Bàn',
      cashier_id: cashier.id,
      cashier_name: cashier.full_name,
      paid_at: invoiceDate.toISOString(),
      items: activeItems.map((it) => ({
        dish_name: it.dish_name,
        unit_price: it.unit_price,
        quantity: it.quantity,
        line_total: it.line_total,
      })),
      subtotal,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      total_amount: totalAmount,
      payment_method: data.payment_method,
      amount_received: amountReceived,
      change_amount: changeAmount,
      note: data.note || null,
      print_count: 1,
    };

    invoices.push(newInvoice);
    saveCollection(STORAGE_KEYS.INVOICES, invoices);

    // đóng đơn hàng
    order.status = 'CLOSED';
    order.closed_at = invoiceDate.toISOString();
    saveCollection(STORAGE_KEYS.ORDERS, orders);

    // giải phóng trạng thái bàn ăn về AVAILABLE
    if (table) {
      table.status = 'AVAILABLE';
      saveCollection(STORAGE_KEYS.TABLES, tables);
    }

    return {
      success: true,
      msg: 'Thanh toán và xuất hóa đơn thành công',
      data: {
        id: newInvoice.id,
        code: newInvoice.code,
        status: 'PAID',
        table_name: newInvoice.table_name,
        cashier_name: newInvoice.cashier_name,
        paid_at: newInvoice.paid_at,
        items: newInvoice.items,
        subtotal: newInvoice.subtotal,
        vat_rate: newInvoice.vat_rate,
        vat_amount: newInvoice.vat_amount,
        total_amount: newInvoice.total_amount,
        payment_method: newInvoice.payment_method,
        amount_received: newInvoice.amount_received,
        change_amount: newInvoice.change_amount,
        note: newInvoice.note,
        print_count: newInvoice.print_count,
        reprint: false,
      },
    };
  },
};

export default billingApi;
