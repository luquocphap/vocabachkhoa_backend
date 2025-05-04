import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "VOCABACHKHOA API",
      version: "1.0.0",
      description: "WEB HỌC TIẾNG ANH",
    },
    servers: [
      {
        url: "http://localhost:3069",
      },
      {
        url: "http://13.250.115.109:3069",
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "Các API liên quan tới đăng ký / đăng nhập",
      },
      {
        name: "Vocabulary",
        description: "Kho từ vựng cá nhân hóa"
      }
    ],
  },
  apis: ["./src/controllers/auth.controller.js", "./src/routers/auth.router.js", "./src/controllers/vocab.controller.js"], // nơi chứa comment @swagger

};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app) {
  app.use("/swagger/api", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
