// src/helpers/handleError.js
import { Prisma } from '@prisma/client'; // Import các loại lỗi từ Prisma
import { handleSuccessResponse, handleErrorResponse } from './handleResponse.js'; // Đảm bảo đường dẫn đúng

// Định nghĩa các lớp lỗi tùy chỉnh (giữ nguyên)
export class BadRequestError extends Error {
  constructor(message = 'Bad Request') { // Sửa message mặc định
    super(message);
    this.code = 400;
    this.name = 'Dữ Liệu Đã Tồn Tại'; // Thêm name để dễ nhận biết
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') { // Sửa message mặc định
    super(message);
    this.code = 403;
    this.name = 'ForbiddenError';
  }
}

export class UnAuthorizedError extends Error {
  constructor(message = 'Unauthorized') { // Sửa message mặc định
    super(message);
    this.code = 401;
    this.name = 'UnAuthorizedError';
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Not Found') { // Sửa message mặc định
    super(message);
    this.code = 404;
    this.name = 'NotFoundError';
  }
}


// Middleware xử lý lỗi trung tâm
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.code || 500; // Mặc định là 500 nếu không có code
  let message = err.message || 'Internal Server Error';

  // --- Logging Lỗi ---
  // Log tất cả lỗi ra console (trong môi trường production nên dùng logger chuyên nghiệp)
  console.error(`[${new Date().toISOString()}] ERROR: ${statusCode} - ${message} - URL: ${req.originalUrl} - Method: ${req.method}`);
  // Log stack trace cho lỗi 500 để debug
  if (statusCode === 500) {
    console.error(err.stack);
  }

  // --- Xử lý lỗi cụ thể ---

  // 1. Lỗi từ Prisma (Ví dụ: Vi phạm ràng buộc unique)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Mã P2002: Unique constraint failed
    if (err.code === 'P2002') {
      // Lấy tên trường bị vi phạm từ meta data của lỗi
      const target = err.meta?.target;
      message = `Giá trị đã tồn tại cho trường: ${Array.isArray(target) ? target.join(', ') : target}.`;
      statusCode = 400; // Bad Request
    }
    // Bạn có thể thêm các mã lỗi Prisma khác ở đây (P2000, P2025,...)
    // Tham khảo: https://www.prisma.io/docs/reference/api-reference/error-reference#prisma-client-query-engine
    else {
      // Các lỗi Prisma khác chưa xử lý cụ thể -> coi là lỗi server
      message = 'Lỗi từ cơ sở dữ liệu.';
      statusCode = 500;
    }
  }

  // 2. Lỗi từ JWT (nếu bạn dùng jsonwebtoken và muốn xử lý riêng)
  // import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'; // Cần import nếu dùng
  // if (err instanceof JsonWebTokenError) {
  //   message = 'Token không hợp lệ hoặc đã bị sửa đổi.';
  //   statusCode = 401; // Unauthorized
  // }
  // if (err instanceof TokenExpiredError) {
  //   message = 'Token đã hết hạn.';
  //   statusCode = 401; // Unauthorized (hoặc 403 Forbidden tùy logic)
  // }

  // 3. Lỗi validation từ express-validator (nếu bạn dùng)
  // (Đã xử lý ở middleware handleValidationErrors trước đó, nhưng có thể bắt lại ở đây nếu cần)

  // 4. Lỗi từ các lớp lỗi tùy chỉnh (BadRequestError, NotFoundError,...)
  // Đã được gán statusCode và message từ trước khi vào đây

  // Tạo response lỗi cuối cùng
  const errorResponse = handleErrorResponse(message, statusCode);

  // Gửi response về client
  res.status(errorResponse.code).json(errorResponse);
};
