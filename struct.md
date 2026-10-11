# Cấu Trúc Dự Án Frontend (`only-fe`)

Tài liệu mô tả chi tiết kiến trúc và cây thư mục của ứng dụng web quản lý nhà hàng & POS (React + TypeScript + Vite + Tailwind CSS).

---

## 1. Cây thư mục tổng quan

```text
only-fe/
├── configs/
│   └── vite.config.ts          # Cấu hình Vite & alias @ trỏ vào src
├── public/                     # Thư mục tài nguyên tĩnh (favicon, logo, icons, ...)
├── src/
│   ├── api/                    # Tầng xử lý nghiệp vụ & Mock API
│   │   ├── authApi.ts          # Đăng nhập, đăng ký, phiên làm việc
│   │   ├── billingApi.ts       # Nghiệp vụ thanh toán & hóa đơn
│   │   ├── categoryApi.ts      # Quản lý danh mục món ăn
│   │   ├── customerApi.ts      # Quản lý thông tin khách hàng
│   │   ├── dishApi.ts          # Quản lý món ăn
│   │   ├── invoiceApi.ts       # Quản lý hóa đơn
│   │   ├── kitchenApi.ts       # Nghiệp vụ điều phối khu vực bếp
│   │   ├── menuApi.ts          # Danh sách thực đơn phục vụ khách
│   │   ├── myInvoiceApi.ts     # Lịch sử hóa đơn cá nhân
│   │   ├── myReservationApi.ts # Lịch sử đặt bàn cá nhân
│   │   ├── orderApi.ts         # Quản lý đơn hàng & gọi món
│   │   ├── reportApi.ts        # Báo cáo thống kê & doanh thu
│   │   ├── reservationApi.ts   # Quản lý nghiệp vụ đặt bàn
│   │   ├── staffApi.ts         # Quản lý nhân sự
│   │   ├── tableApi.ts         # Quản lý bàn ăn & trạng thái bàn
│   │   └── userApi.ts          # Hồ sơ tài khoản người dùng
│   ├── components/             # Các component UI tái sử dụng (Button, Modal, Table, Badge, Header, Sidebar...)
│   ├── context/                # Context API toàn cục (AuthContext, ...)
│   ├── layouts/                # Khung giao diện (Layouts)
│   │   ├── AccountLayout.tsx   # Giao diện trang tài khoản khách hàng
│   │   ├── AdminLayout.tsx     # Giao diện bảng điều khiển quản trị (Sidebar, Topbar)
│   │   ├── CustomerLayout.tsx  # Giao diện khách hàng (Header menu, Banner, Footer)
│   │   ├── KitchenLayout.tsx   # Giao diện màn hình bếp (KDS)
│   │   └── PosLayout.tsx       # Giao diện thu ngân & nhân viên phục vụ (POS)
│   ├── mock/                   # Dữ liệu giả lập và lưu trữ cục bộ
│   │   ├── mockData.ts         # Dữ liệu khởi tạo (Tài khoản, Bàn, Món ăn, Danh mục)
│   │   └── mockStorage.ts      # Quản lý đọc/ghi localStorage và cơ chế reset dữ liệu
│   ├── pages/                  # Toàn bộ màn hình chức năng của hệ thống
│   │   ├── Admin/              # Quản trị (Dashboard, Menu, Tables, Categories, Staff, Customers, Invoices, Reports)
│   │   ├── Auth/               # Xác thực (Login, Register, ForgotPassword, ResetPassword)
│   │   ├── Home/               # Khách vãng lai (HomePage, MenuPage, ReservationPage)
│   │   ├── Kitchen/            # Màn hình điều phối chế biến (KitchenDashboard)
│   │   ├── Pos/                # Điểm bán hàng (PosTables, PosOrder, PosServe, PosPaymentList, PosPayment, PosInvoices)
│   │   └── Profile/            # Cá nhân (ProfilePage, MyReservationsPage, MyInvoicesPage)
│   ├── routes/                 # Cấu hình routing & phân quyền (ProtectedRoute, ...)
│   ├── utils/                  # Typescript types (apiTypes.ts) & helper hàm định dạng tiền tệ, ngày giờ
│   ├── App.tsx                 # Router trung tâm và nhà cung cấp Context Provider
│   ├── index.css               # Cấu hình CSS chính & directives của Tailwind CSS
│   └── main.tsx                # File đầu vào (entry point) khởi chạy React
├── index.html                  # File HTML chính
├── package.json                # Danh sách gói phụ thuộc và scripts dự án
├── tailwind.config.js          # Cấu hình theme, plugins và style Tailwind CSS
├── tsconfig.json               # Cấu hình biên dịch TypeScript
└── README.md                   # Tài liệu hướng dẫn cài đặt và vận hành
```

---

## 2. Chi tiết các tầng kiến trúc

### 2.1. Tầng Cấu hình & Khởi tạo (Root & `configs/`)
* **`configs/vite.config.ts`**: Thiết lập môi trường build Vite, thiết lập alias `@/` dẫn trực tiếp vào thư mục `src/`.
* **`tailwind.config.js`** & **`src/index.css`**: Cung cấp utility classes, biến màu sắc và phong cách thiết kế toàn dự án.
* **`package.json`**: Quản lý các dependency (React, React Router DOM, Tailwind CSS, Lucide React, ...).

### 2.2. Tầng Nghiệp vụ & Dữ liệu (`src/api/` & `src/mock/`)
* **Mock Service Architecture**: Toàn bộ luồng dữ liệu chạy độc lập không phụ thuộc backend thông qua `src/mock/mockStorage.ts` (lưu trữ và đồng bộ trạng thái qua `localStorage`).
* **API Modules**: Tách biệt từng domain nghiệp vụ:
  * **Xác thực & Người dùng**: `authApi.ts`, `userApi.ts`, `staffApi.ts`, `customerApi.ts`.
  * **Vận hành nhà hàng**: `tableApi.ts`, `dishApi.ts`, `categoryApi.ts`, `menuApi.ts`.
  * **Đơn hàng & Thanh toán**: `orderApi.ts`, `billingApi.ts`, `invoiceApi.ts`.
  * **Bếp & Điều phối**: `kitchenApi.ts`.
  * **Đặt chỗ & Báo cáo**: `reservationApi.ts`, `reportApi.ts`.

### 2.3. Khung giao diện (`src/layouts/`)
| Layout | Đối tượng phục vụ | Thành phần cốt lõi |
| :--- | :--- | :--- |
| **`CustomerLayout`** | Khách hàng ngoài | Header menu điều hướng, Banner, Footer |
| **`AccountLayout`** | Khách hàng đăng nhập | Sidebar thông tin cá nhân, lịch sử đơn |
| **`AdminLayout`** | Quản lý / Quản trị viên | Sidebar navigation, Topbar, thông báo, avatar |
| **`PosLayout`** | Thu ngân, Phục vụ | Giao diện thao tác nhanh bàn ăn, giỏ gọi món |
| **`KitchenLayout`** | Bộ phận bếp | Giao diện thẻ đơn, chế độ toàn màn hình KDS |

### 2.4. Phân hệ màn hình (`src/pages/`)
* **`Admin/`**: Bảng điều khiển doanh số, quản lý phân quyền nhân sự, cấu hình danh mục và danh sách món ăn, báo cáo doanh thu theo kỳ.
* **`Pos/`**: Lựa chọn bàn theo khu vực, thêm món nhanh, chuyển trạng thái chế biến/phục vụ, xuất hóa đơn và thanh toán.
* **`Kitchen/`**: Dashboard hiển thị danh sách món cần làm theo thời gian thực và cập nhật trạng thái hoàn thành.
* **`Home/` & `Profile/`**: Trải nghiệm gọi món online, đặt bàn giữ chỗ và tra cứu lịch sử chi tiêu.
* **`Auth/`**: Đăng nhập, đăng ký, quên mật khẩu và cơ chế khôi phục mật khẩu.

### 2.5. Thành phần dùng chung & Tiện ích (`src/components/`, `src/utils/`, `src/routes/`)
* **`components/`**: Các Atomic component (Button, Input, Select, Badge, Modal, DataTable...) được đóng gói độc lập.
* **`routes/`**: Tích hợp các bộ lọc quyền hạn (Guard/Protected Routes) để ngăn chặn truy cập trái phép giữa các vai trò (Khách, Bếp, Thu ngân, Admin).
* **`utils/`**: Chứa định nghĩa kiểu `TypeScript` chuẩn hóa (`apiTypes.ts`) cùng các helper định dạng số tiền VND, định dạng ngày giờ.