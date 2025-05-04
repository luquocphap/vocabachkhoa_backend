// src/services/auth.service.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../common/prisma/prisma.init.js"; 
import { BadRequestError, UnAuthorizedError } from "../helpers/handleError.js"; 

const saltRounds = 10; 


const JWT_SECRET = process.env.JWT_SECRET || "your-default-super-secret-key"; 
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h"; 

class AuthService {
  
  async register(data) {
    // Đổi tên tham số đầu vào cho nhất quán
    const { username, password } = data;

    // Kiểm tra dữ liệu đầu vào
    if (!username || !password) {
      throw new BadRequestError("Thiếu thông tin bắt buộc: username, password");
    }

    if (password.length < 6) {
      throw new BadRequestError("Mật khẩu phải có ít nhất 6 ký tự.");
    }

    const existingUser = await prisma.uSERINFO.findFirst({
      where: { USERNAME: username },
    });
    if (existingUser) {
      throw new BadRequestError(`Tài khoản "${username}" đã tồn tại!`);
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.uSERINFO.create({
      data: {
        USERNAME: username, 
        PWord: hashedPassword, 
      },
      select: {
        U_ID: true, 
        USERNAME: true,
      },
    });

    // Trả về thông tin người dùng mới với tên đã map
    return {
      userId: newUser.U_ID,
      username: newUser.USERNAME,
    };
  }

  
  async login(data) {
    const { username, password } = data;

    if (!username || !password) {
      throw new BadRequestError("Vui lòng nhập đầy đủ tài khoản và mật khẩu.");
    }

    const user = await prisma.uSERINFO.findFirst({
      where: { USERNAME: username },
    });

    if (!user) {
      throw new UnAuthorizedError("Tài khoản hoặc mật khẩu không đúng.");
    }

    const isMatch = await bcrypt.compare(password, user.PWord); 
    if (!isMatch) {
      // Mật khẩu không khớp
      throw new UnAuthorizedError("Tài khoản hoặc mật khẩu không đúng.");
    }

    // Tạo JWT Payload, sử dụng tên trường đã map
    const payload = {
      U_ID: user.U_ID, // Map từ cột U_ID
      USERNAME: user.USERNAME, // Map từ cột USERNAME
      
    };

    // Tạo token
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Trả về token và thông tin cơ bản của user (sử dụng tên đã map)
    return {
      token,
      userInfo: {
        U_ID: user.U_ID,
        USERNAME: user.USERNAME,
      },
    };
  }

}

export default new AuthService();

