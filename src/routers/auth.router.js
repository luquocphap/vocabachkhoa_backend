// src/routers/auth.router.js
import express from "express";
import AuthController from "../controllers/auth.controller.js";

const authRouter = express.Router();

// POST /api/auth/register
authRouter.post("/register", AuthController.register);

// POST /api/auth/login
authRouter.post("/login", AuthController.login);

export default authRouter;
