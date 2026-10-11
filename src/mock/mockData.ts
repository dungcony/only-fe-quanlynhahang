import type { Role, UserStatus, Gender, TableZone, TableStatus, ReservationStatus, OrderStatus, OrderItemStatus, PaymentMethod } from '@/utils/apiTypes';

export interface MockUser {
  id: string;
  email: string;
  password: string;
  full_name: string;
  phone: string;
  gender: Gender;
  date_of_birth: string;
  avatar_url: string;
  role: Role;
  status: UserStatus;
  email_verified: boolean;
  must_change_password: boolean;
  created_at: string;
}

export interface MockCategory {
  id: string;
  name: string;
  sort_order: number;
}

export interface MockDish {
  id: string;
  name: string;
  category_id: string;
  price: number;
  unit: string;
  description: string;
  image_url: string;
  prep_time_minutes: number;
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED';
  created_at: string;
  updated_at: string;
}

export interface MockTable {
  id: string;
  name: string;
  zone: TableZone;
  capacity: number;
  status: TableStatus;
  note?: string;
}

export interface MockOrderItem {
  id: string;
  order_id: string;
  dish_id: string;
  dish_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  note: string | null;
  status: OrderItemStatus;
  sent_at: string;
  started_at: string | null;
  ready_at: string | null;
  served_at: string | null;
}

export interface MockOrder {
  id: string;
  table_id: string;
  status: OrderStatus;
  reservation_id: string | null;
  waiter_id: string;
  waiter_name: string;
  opened_at: string;
  closed_at: string | null;
  items: MockOrderItem[];
}

export interface MockReservation {
  id: string;
  code: string;
  status: ReservationStatus;
  guest_name: string;
  phone: string;
  email: string | null;
  reserved_at: string;
  reserved_end: string;
  guest_count: number;
  preferred_zone: TableZone | null;
  note: string | null;
  table_id: string | null;
  cancel_reason: string | null;
  created_at: string;
}

export interface MockInvoiceItem {
  dish_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface MockInvoice {
  id: string;
  code: string;
  order_id: string;
  table_id: string;
  table_name: string;
  cashier_id: string;
  cashier_name: string;
  paid_at: string;
  items: MockInvoiceItem[];
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  amount_received: number;
  change_amount: number;
  note: string | null;
  print_count: number;
}

// dữ liệu tài khoản khớp chính xác với migration V8 và V9 của Backend (Mật khẩu: 123456)
export const INITIAL_USERS: MockUser[] = [
  // tài khoản Quản lý theo V8
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@gmail.com',
    password: '123456',
    full_name: 'Quản trị viên',
    phone: '0901234567',
    gender: 'MALE',
    date_of_birth: '1990-01-15',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'MANAGER',
    status: 'ACTIVE',
    email_verified: true,
    must_change_password: false,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  // tài khoản Bếp trưởng theo V9
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'bep@gmail.com',
    password: '123456',
    full_name: 'Bếp Trưởng',
    phone: '0934567890',
    gender: 'MALE',
    date_of_birth: '1988-12-05',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    role: 'CHEF',
    status: 'ACTIVE',
    email_verified: true,
    must_change_password: false,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  // tài khoản Thu ngân theo V9
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'thungan@gmail.com',
    password: '123456',
    full_name: 'Thu Ngân 1',
    phone: '0912345678',
    gender: 'FEMALE',
    date_of_birth: '1996-05-20',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    role: 'CASHIER',
    status: 'ACTIVE',
    email_verified: true,
    must_change_password: false,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  // tài khoản Phục vụ theo V9
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'phucvu@gmail.com',
    password: '123456',
    full_name: 'Phục Vụ 1',
    phone: '0923456789',
    gender: 'MALE',
    date_of_birth: '1999-08-10',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    role: 'WAITER',
    status: 'ACTIVE',
    email_verified: true,
    must_change_password: false,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  // tài khoản Khách hàng mẫu
  {
    id: '55555555-5555-5555-5555-555555555555',
    email: 'khachhang@gmail.com',
    password: '123456',
    full_name: 'Khách Hàng Thân Thiết',
    phone: '0987654321',
    gender: 'MALE',
    date_of_birth: '1995-03-25',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    email_verified: true,
    must_change_password: false,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

// danh mục món ăn khớp chính xác với migration V10 của Backend
export const INITIAL_CATEGORIES: MockCategory[] = [
  { id: '00000000-0000-4000-8000-000000000001', name: 'Khai vị', sort_order: 1 },
  { id: '00000000-0000-4000-8000-000000000002', name: 'Món chính', sort_order: 2 },
  { id: '00000000-0000-4000-8000-000000000003', name: 'Đồ uống', sort_order: 3 },
  { id: '00000000-0000-4000-8000-000000000004', name: 'Tráng miệng', sort_order: 4 },
];

// danh sách món ăn khớp chính xác với migration V12 của Backend
export const INITIAL_DISHES: MockDish[] = [
  // Khai vị
  {
    id: '00000000-0000-4001-8000-000000000001',
    name: 'Gỏi ngó sen tôm thịt',
    category_id: '00000000-0000-4000-8000-000000000001',
    price: 89000,
    unit: 'Đĩa',
    description: 'Ngó sen giòn ngọt kết hợp cùng tôm sú tươi và thịt ba chỉ luộc, rưới nước mắm chua ngọt đặc trưng.',
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    prep_time_minutes: 10,
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-4001-8000-000000000002',
    name: 'Nem rán Hà Nội',
    category_id: '00000000-0000-4000-8000-000000000001',
    price: 69000,
    unit: 'Đĩa',
    description: 'Vỏ nem giòn rụm, nhân thịt nạc vai, mộc nhĩ, miến dong truyền thống ăn kèm rau sống và nước chấm.',
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    prep_time_minutes: 15,
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-4001-8000-000000000003',
    name: 'Salad ức ngỗng hun khói',
    category_id: '00000000-0000-4000-8000-000000000001',
    price: 109000,
    unit: 'Đĩa',
    description: 'Ức ngỗng xông khói đậm đà kết hợp cùng xà lách tươi, cà chua bi và sốt mè rang.',
    image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    prep_time_minutes: 10,
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 16 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 16 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-4001-8000-000000000004',
    name: 'Súp hải sản măng tây',
    category_id: '00000000-0000-4000-8000-000000000001',
    price: 59000,
    unit: 'Chén',
    description: 'Nước dùng súp thanh ngọt tự nhiên từ xương gà hầm, thịt cua tươi, mực và măng tây xanh.',
    image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
    prep_time_minutes: 10,
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },

  // Món chính
  {
    id: '00000000-0000-4002-8000-000000000001',
    name: 'Bò bít tết sốt tiêu đen',
    category_id: '00000000-0000-4000-8000-000000000002',
    price: 199000,
    unit: 'Phần',
    description: 'Thăn bò Úc nướng mềm mọng nước, dùng kèm sốt tiêu đen Phú Quốc cay nồng và khoai tây múi cau chiên bơ.',
    image_url: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?auto=format&fit=crop&w=800&q=80',
    prep_time_minutes: 20,
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-4002-8000-000000000002',
    name: 'Cá hồi áp chảo sốt chanh leo',
    category_id: '00000000-0000-4000-8000-000000000002',
    price: 229000,
    unit: 'Phần',
    description: 'Phi lê cá hồi Na Uy da giòn thịt ngọt, phủ sốt chanh leo chua thanh và măng tây áp chảo.',
    image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
    prep_time_minutes: 20,
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 13 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 13 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-4002-8000-000000000003',
    name: 'Sườn heo nướng BBQ mật ong',
    category_id: '00000000-0000-4000-8000-000000000002',
    price: 179000,
    unit: 'Đĩa',
    description: 'Sườn heo non ướp sốt BBQ đậm vị nướng than hoa vàng óng, ăn kèm salad bắp cải tím.',
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    prep_time_minutes: 25,
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-4002-8000-000000000004',
    name: 'Cơm chiên hải sản Hoàng Kim',
    category_id: '00000000-0000-4000-8000-000000000002',
    price: 119000,
    unit: 'Đĩa',
    description: 'Hạt cơm tơi giòn áo đều lòng đỏ trứng muối, tôm tươi, mực và hành hoa dậy mùi thơm.',
    image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
    prep_time_minutes: 15,
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 11 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 11 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-4002-8000-000000000005',
    name: 'Gà nướng thảo mộc Tây Bắc',
    category_id: '00000000-0000-4000-8000-000000000002',
    price: 169000,
    unit: 'Nửa con',
    description: 'Gà ta thả vườn nướng than ướp hạt dổi, mắc khén thơm lừng, chấm muối tiêu chanh ớt.',
    image_url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80',
    prep_time_minutes: 30,
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-4002-8000-000000000006',
    name: 'Lẩu Thái hải sản Tom Yum',
    category_id: '00000000-0000-4000-8000-000000000002',
    price: 359000,
    unit: 'Nồi',
    description: 'Nước lẩu cốt dừa chua cay chuẩn vị Thái, ăn kèm tôm, mực, nghêu, nấm tươi và rau xanh các loại.',
    image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    prep_time_minutes: 25,
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-4002-8000-000000000007',
    name: 'Phở bò tái truyền thống',
    category_id: '00000000-0000-4000-8000-000000000002',
    price: 69000,
    unit: 'Bát',
    description: 'Bánh phở mềm dai, nước dùng hầm xương bò 12 tiếng cùng quế hồi thảo quả thơm lừng, thịt bò tái tươi mềm.',
    image_url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
    prep_time_minutes: 10,
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-4002-8000-000000000008',
    name: 'Bún chả Hà Nội nướng than',
    category_id: '00000000-0000-4000-8000-000000000002',
    price: 65000,
    unit: 'Phần',
    description: 'Chả miếng và chả viên nướng xém cạnh thơm nức mùi hành tiêu, ăn kèm nước chấm chua ngọt đu đủ cà rốt.',
    image_url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80',
    prep_time_minutes: 12,
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },

  // Đồ uống
  {
    id: '00000000-0000-4003-8000-000000000001',
    name: 'Trà đào cam sả',
    category_id: '00000000-0000-4000-8000-000000000003',
    price: 45000,
    unit: 'Ly',
    description: 'Trà thanh mát quyện cùng đào ngâm giòn ngọt, cam tươi mọng nước và hương thơm nhẹ dịu của sả tươi.',
    image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80',
    prep_time_minutes: 5,
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-4003-8000-000000000002',
    name: 'Cà phê muối xứ Huế',
    category_id: '00000000-0000-4000-8000-000000000003',
    price: 39000,
    unit: 'Ly',
    description: 'Cà phê phin Robusta đậm đà hòa quyện cùng lớp kem béo ngậy mặn ngọt cân bằng tinh tế.',
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    prep_time_minutes: 5,
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-4003-8000-000000000003',
    name: 'Nước ép dưa hấu bạc hà',
    category_id: '00000000-0000-4000-8000-000000000003',
    price: 45000,
    unit: 'Ly',
    description: '100% dưa hấu tươi nguyên chất mát lạnh điểm xuyết hương bạc hà sảng khoái.',
    image_url: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=800&q=80',
    prep_time_minutes: 5,
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-4003-8000-000000000004',
    name: 'Sinh tố bơ hạt chia',
    category_id: '00000000-0000-4000-8000-000000000003',
    price: 55000,
    unit: 'Ly',
    description: 'Bơ sáp dẻo béo ngậy xay mịn cùng sữa tươi và hạt chia giàu dưỡng chất.',
    image_url: 'https://images.unsplash.com/photo-1638176066666-ffb2f5d22f6d?auto=format&fit=crop&w=800&q=80',
    prep_time_minutes: 7,
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-4003-8000-000000000005',
    name: 'Bia craft Pale Ale thủ công',
    category_id: '00000000-0000-4000-8000-000000000003',
    price: 69000,
    unit: 'Chai',
    description: 'Bia thủ công vị thanh, hương hoa bia và vỏ cam tươi đặc trưng nồng độ cồn nhẹ dịu.',
    image_url: 'https://images.unsplash.com/photo-1608270104670-36a8d8e574ad?auto=format&fit=crop&w=800&q=80',
    prep_time_minutes: 3,
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },

  // Tráng miệng
  {
    id: '00000000-0000-4004-8000-000000000001',
    name: 'Panna Cotta sốt dâu rừng',
    category_id: '00000000-0000-4000-8000-000000000004',
    price: 49000,
    unit: 'Phần',
    description: 'Bánh kem sữa mềm mịn tan ngay trong miệng, phủ sốt dâu tây chua ngọt mát lịm.',
    image_url: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80',
    prep_time_minutes: 5,
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-4004-8000-000000000002',
    name: 'Tiramisu phong vị Ý',
    category_id: '00000000-0000-4000-8000-000000000004',
    price: 59000,
    unit: 'Phần',
    description: 'Lớp bánh ladyfinger thấm đẫm cà phê espresso hòa quyện phô mai mascarpone béo ngậy phủ bột cacao đắng.',
    image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80',
    prep_time_minutes: 5,
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-4004-8000-000000000003',
    name: 'Chè khúc bạch hạnh nhân',
    category_id: '00000000-0000-4000-8000-000000000004',
    price: 45000,
    unit: 'Bát',
    description: 'Khúc bạch phô mai mềm ngậy, nhãn lồng giòn ngọt trong nước đường phèn thanh mát và hạnh nhân lát rang vàng.',
    image_url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
    prep_time_minutes: 5,
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: '00000000-0000-4004-8000-000000000004',
    name: 'Kem dừa sầu riêng tươi',
    category_id: '00000000-0000-4000-8000-000000000004',
    price: 49000,
    unit: 'Phần',
    description: 'Kem dừa béo tự nhiên phục vụ kèm thịt sầu riêng Ri6 thơm lừng và đậu phộng rang giòn.',
    image_url: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=800&q=80',
    prep_time_minutes: 5,
    status: 'AVAILABLE',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

// danh sách bàn ăn mẫu
export const INITIAL_TABLES: MockTable[] = [
  { id: 'tbl-1', name: 'Bàn 01', zone: 'INDOOR', capacity: 4, status: 'AVAILABLE', note: 'Gần cửa sổ' },
  { id: 'tbl-2', name: 'Bàn 02', zone: 'INDOOR', capacity: 4, status: 'OCCUPIED', note: 'Khách đang ăn' },
  { id: 'tbl-3', name: 'Bàn 03', zone: 'INDOOR', capacity: 2, status: 'AVAILABLE' },
  { id: 'tbl-4', name: 'Bàn 04', zone: 'INDOOR', capacity: 6, status: 'AVAILABLE' },
  { id: 'tbl-5', name: 'Bàn 05', zone: 'SECOND_FLOOR', capacity: 4, status: 'AVAILABLE' },
  { id: 'tbl-6', name: 'Bàn 06', zone: 'SECOND_FLOOR', capacity: 8, status: 'AVAILABLE', note: 'Bàn tiệc gia đình' },
  { id: 'tbl-7', name: 'Bàn VIP 01', zone: 'VIP_ROOM', capacity: 10, status: 'RESERVED', note: 'Đặt tiệc sinh nhật 19h' },
  { id: 'tbl-8', name: 'Bàn VIP 02', zone: 'VIP_ROOM', capacity: 12, status: 'AVAILABLE', note: 'Phòng riêng sang trọng' },
  { id: 'tbl-9', name: 'Bàn Sân Vườn 01', zone: 'OUTDOOR', capacity: 4, status: 'AVAILABLE', note: 'View cây xanh' },
  { id: 'tbl-10', name: 'Bàn Sân Vườn 02', zone: 'OUTDOOR', capacity: 4, status: 'AVAILABLE' },
];

// đơn hàng mẫu gắn với Phục vụ 1 (phucvu@gmail.com)
export const INITIAL_ORDERS: MockOrder[] = [
  {
    id: 'ord-101',
    table_id: 'tbl-2',
    status: 'OPEN',
    reservation_id: null,
    waiter_id: '44444444-4444-4444-4444-444444444444',
    waiter_name: 'Phục Vụ 1',
    opened_at: new Date(Date.now() - 40 * 60000).toISOString(),
    closed_at: null,
    items: [
      {
        id: 'item-1',
        order_id: 'ord-101',
        dish_id: '00000000-0000-4001-8000-000000000001',
        dish_name: 'Gỏi ngó sen tôm thịt',
        unit_price: 89000,
        quantity: 1,
        line_total: 89000,
        note: 'Ít chua',
        status: 'READY',
        sent_at: new Date(Date.now() - 35 * 60000).toISOString(),
        started_at: new Date(Date.now() - 30 * 60000).toISOString(),
        ready_at: new Date(Date.now() - 10 * 60000).toISOString(),
        served_at: null,
      },
      {
        id: 'item-2',
        order_id: 'ord-101',
        dish_id: '00000000-0000-4002-8000-000000000001',
        dish_name: 'Bò bít tết sốt tiêu đen',
        unit_price: 199000,
        quantity: 2,
        line_total: 398000,
        note: 'Chín vừa (medium)',
        status: 'COOKING',
        sent_at: new Date(Date.now() - 35 * 60000).toISOString(),
        started_at: new Date(Date.now() - 20 * 60000).toISOString(),
        ready_at: null,
        served_at: null,
      },
      {
        id: 'item-3',
        order_id: 'ord-101',
        dish_id: '00000000-0000-4003-8000-000000000001',
        dish_name: 'Trà đào cam sả',
        unit_price: 45000,
        quantity: 2,
        line_total: 90000,
        note: 'Ít đường nhiều đá',
        status: 'SERVED',
        sent_at: new Date(Date.now() - 35 * 60000).toISOString(),
        started_at: new Date(Date.now() - 34 * 60000).toISOString(),
        ready_at: new Date(Date.now() - 30 * 60000).toISOString(),
        served_at: new Date(Date.now() - 25 * 60000).toISOString(),
      },
    ],
  },
];

// đặt bàn mẫu
export const INITIAL_RESERVATIONS: MockReservation[] = [
  {
    id: 'res-1',
    code: 'RES-8831',
    status: 'CONFIRMED',
    guest_name: 'Anh Trần Hữu Đạt',
    phone: '0978112233',
    email: 'dat.tran@gmail.com',
    reserved_at: new Date(Date.now() + 2 * 3600000).toISOString(),
    reserved_end: new Date(Date.now() + 4 * 3600000).toISOString(),
    guest_count: 6,
    preferred_zone: 'VIP_ROOM',
    note: 'Chuẩn bị thêm ghế trẻ em và bánh sinh nhật',
    table_id: 'tbl-7',
    cancel_reason: null,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: 'res-2',
    code: 'RES-5542',
    status: 'PENDING',
    guest_name: 'Chị Lê Thu Trang',
    phone: '0981998877',
    email: 'thutrang@gmail.com',
    reserved_at: new Date(Date.now() + 5 * 3600000).toISOString(),
    reserved_end: new Date(Date.now() + 7 * 3600000).toISOString(),
    guest_count: 4,
    preferred_zone: 'OUTDOOR',
    note: 'Thích bàn thoáng mát ngắm phố',
    table_id: null,
    cancel_reason: null,
    created_at: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
];

// hóa đơn mẫu gắn với Thu Ngân 1 (thungan@gmail.com)
export const INITIAL_INVOICES: MockInvoice[] = [
  {
    id: 'inv-1',
    code: 'HD-20261011-001',
    order_id: 'ord-100',
    table_id: 'tbl-1',
    table_name: 'Bàn 01',
    cashier_id: '33333333-3333-3333-3333-333333333333',
    cashier_name: 'Thu Ngân 1',
    paid_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    items: [
      { dish_name: 'Bò bít tết sốt tiêu đen', unit_price: 199000, quantity: 1, line_total: 199000 },
      { dish_name: 'Trà đào cam sả', unit_price: 45000, quantity: 2, line_total: 90000 },
    ],
    subtotal: 289000,
    vat_rate: 0.08,
    vat_amount: 23120,
    total_amount: 312120,
    payment_method: 'BANK_TRANSFER',
    amount_received: 312120,
    change_amount: 0,
    note: 'Khách thanh toán chuyển khoản quét mã QR',
    print_count: 1,
  },
  {
    id: 'inv-2',
    code: 'HD-20261011-002',
    order_id: 'ord-099',
    table_id: 'tbl-4',
    table_name: 'Bàn 04',
    cashier_id: '33333333-3333-3333-3333-333333333333',
    cashier_name: 'Thu Ngân 1',
    paid_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    items: [
      { dish_name: 'Lẩu Thái hải sản Tom Yum', unit_price: 359000, quantity: 1, line_total: 359000 },
      { dish_name: 'Gỏi ngó sen tôm thịt', unit_price: 89000, quantity: 1, line_total: 89000 },
      { dish_name: 'Tiramisu phong vị Ý', unit_price: 59000, quantity: 2, line_total: 118000 },
    ],
    subtotal: 566000,
    vat_rate: 0.08,
    vat_amount: 45280,
    total_amount: 611280,
    payment_method: 'CASH',
    amount_received: 700000,
    change_amount: 88720,
    note: 'Tiền mặt',
    print_count: 1,
  },
];
