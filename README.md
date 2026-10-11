# Dự Án Quản Lý Nhà Hàng - Phiên Bản Only-FE (Độc Lập 100%)

Phiên bản này chạy **hoàn toàn trên Frontend**, không cần cài đặt hay khởi động bất kỳ Server/Backend nào (không cần Java/Spring Boot, không cần Docker, PostgreSQL hay Redis).

Toàn bộ dữ liệu được lưu trữ trực tiếp trong `localStorage` của trình duyệt dưới dạng JSON dễ đọc, dễ chỉnh sửa và đã được **đồng bộ chính xác 100% theo các migration V8, V9, V10, V12 của Backend**.

---

## 1. Cài đặt và Chạy thử

Mở Terminal tại thư mục `only-fe`:

```bash
# cài đặt các gói phụ thuộc
npm install

# khởi động server phát triển
npm run dev
```

Sau đó mở trình duyệt tại địa chỉ hiển thị trên màn hình (thường là `http://localhost:5173`).

---

## 2. Danh sách Tài khoản Mẫu (Đồng bộ theo Migration V8 & V9)

Dữ liệu đã có sẵn cho đầy đủ các vai trò trong nhà hàng. **Mật khẩu chung cho tất cả tài khoản là: `123456`**

| Vai trò | Email đăng nhập | Mật khẩu | Chức năng chính |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Manager)** | `admin@gmail.com` | `123456` | Dashboard báo cáo, quản lý món ăn, bàn, danh mục, nhân viên, khách hàng, hóa đơn |
| **Thu ngân (Cashier)** | `thungan@gmail.com` | `123456` | Danh sách chờ thanh toán, màn hình tính tiền, in hóa đơn, quản lý hóa đơn |
| **Phục vụ (Waiter)** | `phucvu@gmail.com` | `123456` | Sơ đồ bàn ăn, mở bàn, gọi món cho khách, trả món ra bàn khi bếp nấu xong |
| **Bếp trưởng (Chef)** | `bep@gmail.com` | `123456` | Màn hình bếp nhận order, chuyển trạng thái nấu (Chờ -> Đang nấu -> Hoàn thành) |
| **Khách hàng (Customer)** | `khachhang@gmail.com` | `123456` | Xem thực đơn, đặt bàn trực tuyến, xem lịch sử đặt bàn và hóa đơn |

---

## 3. Danh mục & Thực đơn Mẫu (Đồng bộ theo Migration V10 & V12)

- **Danh mục:** Khai vị, Món chính, Đồ uống, Tráng miệng.
- **Thực đơn:** 21 món ăn Việt Nam & quốc tế phong phú (Gỏi ngó sen tôm thịt, Nem rán Hà Nội, Salad ức ngỗng, Bò bít tết sốt tiêu đen, Cá hồi áp chảo sốt chanh leo, Lẩu Thái Tom Yum, Phở bò tái, Bún chả, Trà đào cam sả, Cà phê muối, Panna Cotta, Tiramisu...) kèm ảnh minh họa độ phân giải cao.

---

## 4. Cách xem và chỉnh sửa dữ liệu trực tiếp

Vì dữ liệu lưu trong `localStorage`, bạn có thể kiểm tra hoặc sửa đổi dữ liệu rất dễ dàng:

1. Trên trình duyệt, nhấn phím **F12** (hoặc chuột phải chọn **Inspect / Kiểm tra**).
2. Chuyển sang tab **Application** (hoặc **Ứng dụng**).
3. Ở cột bên trái, chọn **Storage** -> **Local Storage** -> địa chỉ trang web (VD: `http://localhost:5173`).
4. Bạn sẽ thấy các "bảng" dữ liệu:
   - `app_mock_users`: Danh sách tài khoản người dùng
   - `app_mock_dishes`: Danh sách các món ăn trong thực đơn
   - `app_mock_categories`: Các danh mục món ăn
   - `app_mock_tables`: Danh sách bàn ăn và trạng thái
   - `app_mock_orders`: Các đơn hàng đang mở
   - `app_mock_invoices`: Lịch sử các hóa đơn đã thanh toán
   - `app_mock_reservations`: Danh sách đặt bàn của khách

---

## 5. Khôi phục dữ liệu mẫu ban đầu (Reset Data)

Nếu bạn thử nghiệm xóa hoặc sửa dữ liệu và muốn quay lại dữ liệu mẫu ban đầu:
- Mở **Console** (F12) và gõ lệnh:
  ```javascript
  resetDemoData()
  ```
- Hoặc đơn giản là xóa toàn bộ Local Storage trong tab Application rồi tải lại trang (F5).
