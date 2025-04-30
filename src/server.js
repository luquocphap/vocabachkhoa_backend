import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import các thành phần cần thiết từ ứng dụng của bạn
import prisma from './common/prisma/prisma.init.js'; // Prisma client instance
import { setupSwagger } from './common/swagger/swagger.init.js'; // Hàm cài đặt Swagger
import authRouter from './routers/auth.router.js'; // Router xác thực
// Import các router khác nếu có (ví dụ: productRouter, orderRouter,...)
// import productRouter from './routers/product.router.js';
import { errorHandler } from './helpers/handleError.js'; // Middleware xử lý lỗi trung tâm
import { NotFoundError } from './helpers/handleError.js'; // Lỗi NotFound để xử lý route không tồn tại
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import rootRouter from './routers/root.router.js';


// --- Cấu hình ban đầu ---

// Nạp các biến môi trường từ file .env
dotenv.config();

// Khởi tạo ứng dụng Express
const app = express();


const PORT = 3069; 

app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies (ít dùng hơn với API JSON, nhưng có thể cần)
app.use(express.urlencoded({ extended: true }));

// --- Cài đặt Swagger ---
setupSwagger(app); // Gọi hàm để thiết lập Swagger UI

// --- Kết nối Routers ---

// Mount các router vào các đường dẫn gốc tương ứng
app.use('/', rootRouter); // Các route xác thực sẽ bắt đầu bằng /auth
// app.use('/products', productRouter); // Ví dụ mount router sản phẩm
// ...thêm các router khác ở đây

// --- Xử lý Route không tồn tại (404) ---
// Middleware này sẽ chạy nếu không có route nào khớp với request trước đó
app.use((req, res, next) => {
  // Tạo lỗi NotFound và chuyển đến error handler trung tâm
  next(new NotFoundError(`Không tìm thấy tài nguyên - ${req.originalUrl}`));
});

// --- Middleware Xử lý lỗi trung tâm ---
// Middleware này phải được đặt **cuối cùng**, sau tất cả các app.use() và routers khác
app.use(errorHandler);

// --- Khởi động Server ---
const server = app.listen(PORT, () => {
  console.log(`[SERVER] Đã khởi động thành công tại http://localhost:${PORT}`);
  console.log(`[SWAGGER] Tài liệu API có tại http://localhost:${PORT}/swagger/api`);
});

// --- Xử lý tắt server một cách an toàn (Graceful Shutdown) ---
process.on('SIGINT', async () => {
  console.log('[SERVER] Nhận tín hiệu SIGINT. Đang đóng server...');
  server.close(async () => {
    console.log('[SERVER] HTTP server đã đóng.');
    // Đóng kết nối Prisma
    await prisma.$disconnect();
    console.log('[PRISMA] Kết nối Prisma đã đóng.');
    process.exit(0); // Thoát tiến trình
  });
});

process.on('SIGTERM', async () => {
  console.log('[SERVER] Nhận tín hiệu SIGTERM. Đang đóng server...');
  server.close(async () => {
    console.log('[SERVER] HTTP server đã đóng.');
    // Đóng kết nối Prisma
    await prisma.$disconnect();
    console.log('[PRISMA] Kết nối Prisma đã đóng.');
    process.exit(0); // Thoát tiến trình
  });
});