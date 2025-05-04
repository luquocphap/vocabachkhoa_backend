// src/services/vocab.service.js
import prisma from "../common/prisma/prisma.init.js";

class VocabService {
  async save(data) {
    const { UID, WORD, MEANINGS } = data; 
    const userExists = await prisma.uSERINFO.findUnique({
        where: { U_ID: UID } 
    });
    if (!userExists) {
        throw new Error(`Không tìm thấy người dùng với U_ID: ${UID}`);
    }

    const newVocabEntry = await prisma.vOCAB.create({
      data: {
        WORD: WORD,
        MEANINGS: MEANINGS,
        USERINFO: { 
          connect: {
            U_ID: UID, 
          },
        },
      },
      select: {
        WORD: true,
        MEANINGS: true,
        U_ID: true
      },
    });

    return newVocabEntry;
  }

  async show(data) {
    const { UID } = data; // UID là giá trị của U_ID từ UserInfo

     // Kiểm tra UserInfo tồn tại bằng U_ID
     const userExists = await prisma.uSERINFO.findUnique({
        where: { U_ID: UID } 
    });
     if (!userExists) {
        throw new Error(`Không tìm thấy người dùng với U_ID: ${UID}`);
    }

    const vocab_list =
      await prisma.$queryRaw`EXEC GET_VOCAB_BY_ID @UID = ${UID}`;

    return { vocab_list: vocab_list };
  }

  async delete(data) {
    const { U_ID, WORD } = data;
  
    // Kiểm tra bản ghi tồn tại
    const vocab = await prisma.vOCAB.findUnique({
      where: {
        U_ID_WORD: {
          U_ID: U_ID,
          WORD: WORD,
        },
      },
    });
  
    if (!vocab) {
      throw new Error(`Không tìm thấy từ vựng với U_ID: ${UID} và WORD: ${WORD}`);
    }
  
    // Xóa bản ghi
    await prisma.vOCAB.delete({
      where: {
        U_ID_WORD: {
          U_ID: U_ID,
          WORD: WORD,
        },
      },
    });
  
    return { message: "Xóa thành công!", word: WORD };
  }
}

export default new VocabService();