// src/controllers/auth.controller.js
import VocabService from "../services/vocab.service.js"; // Đảm bảo đường dẫn đúng
import { handleErrorResponse ,handleSuccessResponse } from "../helpers/handleResponse.js"; // Đảm bảo đường dẫn đúng

class VocabController {
  /**
   * @swagger
   * /vocab/save/:
   *   post:
   *     summary: Lưu từ vựng vào study list
   *     tags: [Vocabulary]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:              
   *               - UID
   *               - WORD
   *               - MEANINGS
   *             properties:               
   *               UID:
   *                 type: INT
   *                 example: "1"
   *                 description: ID NGƯỜI DÙNG
   *               WORD:
   *                 type: string
   *                 example: "hello"
   *                 description: từ vựng
   *               MEANINGS:
   *                 type: string
   *                 example: "greetings"
   *                 description: "Định Nghĩa"
   *     responses:
   *       200:
   *         description: Đăng ký thành công
   *       400:
   *         description: Dữ liệu không hợp lệ hoặc đã tồn tại
   *       500:
   *         description: Lỗi hệ thống trong quá trình đăng ký
   */
  async save(req, res, next) {
    try {
      // Dữ liệu đăng ký từ request body (mong đợi username, password)
      const registrationData = req.body;


      // Gọi service với dữ liệu từ body
      const newUserInfo = await VocabService.save(registrationData);

      // Trả về phản hồi thành công
      res.status(201).json(
        handleSuccessResponse(
          "Thêm từ vựng thành công",
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
   * /vocab/show/:
   *   get:
   *     summary: Lấy danh sách từ vựng của người dùng
   *     tags: [Vocabulary]
   *     parameters:
   *       - in: query
   *         name: U_ID
   *         required: true
   *         description: ID NGƯỜI DÙNG
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Thành công
   *       403:
   *         description: Lỗi yêu cầu
   *       404:
   *         description: Không tìm thấy phim
   */
  async show(req, res, next) {
    try {
      // Read UID from query parameters for a GET request
      const ID = parseInt(req.query.U_ID, 10);

      const showData = { UID: ID }; // <--- Corrected line

      // Check if U_ID was provided
      if (!showData.UID) {
         // You might want to throw a BadRequestError here or handle it appropriately
         return res.status(400).json(handleErrorResponse("Missing U_ID query parameter", 400));
      }

      // Call service with the correct data structure
      const vocabListResult = await VocabService.show(showData); // Pass { UID: ... }

      // Trả về phản hồi thành công
      res.status(200).json(
        handleSuccessResponse(
          "Truy xuất thành công",
          200,
          vocabListResult // Pass the result from the service
        )
      );
    } catch (error) {
      // Chuyển lỗi đến error handler trung tâm
      next(error);
    }
  }

  /**
   * @swagger
   * /vocab/delete/:
   *   delete:
   *     summary: Xóa card
   *     tags: [Vocabulary]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               U_ID:
   *                 type: int
   *                 example: "1002"
   *                 description: ID phim
   *               WORD:
   *                 type: string
   *                 example: "start"
   *                 description: ID phòng chiếu
   *     responses:
   *       200:
   *         description: Lấy thành công thông tin suất chiếu và ghế
   *       400:
   *         description: Lỗi yêu cầu
   *       404:
   *         description: Không tìm thấy suất chiếu
   */
  async delete(req, res, next){
    try {
      // Lấy dữ liệu từ body (vì Swagger gửi qua body)
      const data = req.body;
  
      if (!data.U_ID) {
        return res.status(400).json(handleErrorResponse("Missing U_ID in request body", 400));
      }
      if (!data.WORD) {
        return res.status(400).json(handleErrorResponse("Missing WORD in request body", 400));
      }
  
      const vocabListResult = await VocabService.delete(data);
  
      res.status(200).json(
        handleSuccessResponse(
          "Xóa thành công",
          200,
          vocabListResult
        )
      );
    } catch (error) {
      next(error);
    }
  }
}



export default new VocabController();

