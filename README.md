# AppChitieu - SaveMoney Pro

Ứng dụng quản lý chi tiêu viết bằng React + TypeScript + Vite.

## Điểm đã hoàn thiện ở bản này

- Chatbot hoạt động được ngay cả khi không có Gemini API Key
- Chatbot đọc dữ liệu thật trong app: ví, giao dịch, ngân sách, tiết kiệm, hóa đơn, khoản vay, đầu tư
- Có gợi ý câu hỏi nhanh
- Có lưu lịch sử chat bằng localStorage
- Có cơ chế fallback: nếu Gemini lỗi hoặc thiếu key thì chatbot vẫn trả lời nội bộ
- Có file `.env.example` để cấu hình nhanh

## Cách chạy

### 1) Cài thư viện
```bash
npm install
```

### 2) Chạy local
```bash
npm run dev
```

### 3) Mở trình duyệt
```bash
http://localhost:3000
```

## Bật chế độ Gemini nâng cao (không bắt buộc)

### Cách 1: dùng file `.env.local`
Tạo file `.env.local` và thêm:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Cách 2: sao chép từ file mẫu
```bash
copy .env.example .env.local
```
Sau đó sửa giá trị API key.

## Các câu chatbot hiện hỗ trợ tốt

- Tôi còn bao nhiêu tiền?
- Phân tích chi tiêu tháng này
- Tổng thu nhập tháng này
- Ngân sách nào sắp vượt mức?
- Tiến độ tiết kiệm của tôi ra sao?
- Hóa đơn nào sắp đến hạn?
- Ví nào còn nhiều tiền nhất?
- Cho tôi lời khuyên tiết kiệm

## Cấu trúc phần chatbot

- `components/ChatBot.tsx`: giao diện chatbot
- `utils/chatbot.ts`: xử lý logic chatbot nội bộ, tạo phân tích từ dữ liệu tài chính
- `context/FinanceContext.tsx`: nguồn dữ liệu tài chính của app

## Ghi chú

- Chatbot nội bộ không cần internet
- Gemini chỉ là phần mở rộng để câu trả lời tự nhiên hơn
- Dữ liệu hiện tại được lưu bằng `localStorage`
