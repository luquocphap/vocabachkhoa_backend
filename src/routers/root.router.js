import express from "express";
import authRouter from "./auth.router.js";
import vocabRouter from "./vocab.router.js";

const rootRouter = express.Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/vocab", vocabRouter)

export default rootRouter;