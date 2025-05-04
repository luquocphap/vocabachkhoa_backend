// src/controllers/auth.controller.js
import AuthService from "../services/auth.service.js"; // Đảm bảo đường dẫn đúng
import { handleSuccessResponse } from "../helpers/handleResponse.js"; // Đảm bảo đường dẫn đúng

class AuthController {
  /**
   * @swagger
   * /auth/register/:
   *   post:
   *     summary: Đăng ký tài khoản khách hàng
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:              
   *               - username
   *               - password
   *             properties:               
   *               username:
   *                 type: string
   *                 example: "luquocphap123"
   *                 description: Tên tài khoản
   *               password:
   *                 type: string
   *                 format: password
   *                 example: "123456"
   *                 description: Mật khẩu
   *     responses:
   *       200:
   *         description: Đăng ký thành công
   *       400:
   *         description: Dữ liệu không hợp lệ hoặc đã tồn tại
   *       500:
   *         description: Lỗi hệ thống trong quá trình đăng ký
   */
  async register(req, res, next) {
    try {
      // Dữ liệu đăng ký từ request body (mong đợi username, password)
      const registrationData = req.body;

      // Gọi service với dữ liệu từ body
      const newUserInfo = await AuthService.register(registrationData);

      // Trả về phản hồi thành công
      res.status(201).json(
        handleSuccessResponse(
          "Đăng ký tài khoản thành công!",
          201,
          newUserInfo // Bao gồm { userId, username }
        )
      );
    } catch (error) {
      // Chuyển lỗi đến error handler trung tâm
      next(error);
    }
  }

  /**
   * @swagger
   * /auth/login/:
   *   post:
   *     summary: Đăng nhập khách hàng
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *                 example: "luquocphap123"
   *                 description: Email hoặc tài khoản đăng nhập
   *               password:
   *                 type: string
   *                 format: password
   *                 example: "123456"
   *                 description: Mật khẩu
   *     responses:
   *       200:
   *         description: Đăng nhập thành công
   *       400:
   *         description: Thiếu thông tin đăng nhập
   *       401:
   *         description: Thông tin đăng nhập không đúng hoặc không phải tài khoản khách hàng
   *       500:
   *         description: Lỗi hệ thống trong quá trình đăng nhập
   */
  async login(req, res, next) {
    try {
      // Dữ liệu đăng nhập từ request body (mong đợi username, password)
      const loginData = req.body;

      // Gọi service với dữ liệu từ body
      const loginResult = await AuthService.login(loginData);

      // Trả về phản hồi thành công
      res.status(200).json(
        handleSuccessResponse(
          "Đăng nhập thành công!",
          200,
          loginResult // Bao gồm { token, userInfo: { userId, username } }
        )
      );
    } catch (error) {
      // Chuyển lỗi đến error handler trung tâm
      next(error);
    }
  }
}

export default new AuthController();

