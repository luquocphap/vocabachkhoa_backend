// src/services/auth.service.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../common/prisma/prisma.init.js"; // Đảm bảo đường dẫn đúng
import { BadRequestError, UnAuthorizedError } from "../helpers/handleError.js"; // Đảm bảo đường dẫn đúng

const saltRounds = 10; // Số vòng băm, nên đặt trong biến môi trường

// Lấy JWT secret và thời gian hết hạn từ biến môi trường
// !!! QUAN TRỌNG: Đảm bảo các biến này được định nghĩa trong file .env của bạn !!!
const JWT_SECRET = process.env.JWT_SECRET || "your-default-super-secret-key"; // Cần thay thế bằng secret mạnh và an toàn
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h"; // Ví dụ: 1 giờ

class AuthService {
  /**
   * Đăng ký tài khoản mới.
   * Sử dụng tên trường đã map trong Prisma schema (username, passwordHash).
   * Nhận đầu vào là username và password.
   */
  async register(data) {
    // Đổi tên tham số đầu vào cho nhất quán
    const { username, password } = data;

    // Kiểm tra dữ liệu đầu vào
    if (!username || !password) {
      throw new BadRequestError("Thiếu thông tin bắt buộc: username, password");
    }
    // Nên thêm validation phức tạp hơn cho password ở đây
    if (password.length < 6) {
      throw new BadRequestError("Mật khẩu phải có ít nhất 6 ký tự.");
    }
    // Nên thêm validation cho username (ví dụ: ký tự, độ dài)

    // Kiểm tra tài khoản đã tồn tại chưa, sử dụng tên trường đã map 'username'
    const existingUser = await prisma.uSERINFO.findFirst({
      // Sử dụng findUnique vì username đã được đánh dấu @unique trong schema
      where: { username: username },
    });
    if (existingUser) {
      throw new BadRequestError(`Tài khoản "${username}" đã tồn tại!`);
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Tạo user mới, sử dụng tên trường đã map 'username' và 'passwordHash'
    const newUser = await prisma.uSERINFO.create({
      data: {
        username: username, // Map tới cột USERNAME
        passwordHash: hashedPassword, // Map tới cột PWord
        // Nếu có thêm các trường khác (như email, firstName,... đã map), thêm vào đây
      },
      // Chọn các trường trả về, sử dụng tên đã map
      select: {
        id: true, // Map từ cột U_ID
        username: true, // Map từ cột USERNAME
      },
    });

    // Trả về thông tin người dùng mới với tên đã map
    return {
      userId: newUser.id,
      username: newUser.username,
    };
  }

  /**
   * Đăng nhập tài khoản.
   * Sử dụng tên trường đã map trong Prisma schema (username, passwordHash).
   * Nhận đầu vào là username và password.
   */
  async login(data) {
    // Đổi tên tham số đầu vào cho nhất quán
    const { username, password } = data;

    if (!username || !password) {
      throw new BadRequestError("Vui lòng nhập đầy đủ tài khoản và mật khẩu.");
    }

    // Tìm user theo tài khoản, sử dụng tên trường đã map 'username'
    const user = await prisma.uSERINFO.findFirst({
      where: { username: username },
    });

    if (!user) {
      // Không tìm thấy user với username này
      throw new UnAuthorizedError("Tài khoản hoặc mật khẩu không đúng.");
    }

    // So sánh mật khẩu nhập vào với mật khẩu đã hash trong DB (sử dụng passwordHash đã map)
    const isMatch = await bcrypt.compare(password, user.passwordHash); // user.passwordHash map từ cột PWord
    if (!isMatch) {
      // Mật khẩu không khớp
      throw new UnAuthorizedError("Tài khoản hoặc mật khẩu không đúng.");
    }

    // Tạo JWT Payload, sử dụng tên trường đã map
    const payload = {
      userId: user.id, // Map từ cột U_ID
      username: user.username, // Map từ cột USERNAME
      // Nên thêm vai trò (role) nếu có hệ thống phân quyền
      // role: user.role // Ví dụ nếu có trường role
    };

    // Tạo token
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Trả về token và thông tin cơ bản của user (sử dụng tên đã map)
    return {
      token,
      userInfo: {
        userId: user.id,
        username: user.username,
        // Thêm các thông tin khác nếu cần (ví dụ: email, tên)
      },
    };
  }

  // Có thể thêm các phương thức khác như logout, refreshToken,... ở đây
}

export default new AuthService();

