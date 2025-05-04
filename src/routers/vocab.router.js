// src/routers/auth.router.js
import express from "express";
import vocabController from "../controllers/vocab.controller.js";
const vocabRouter = express.Router();

// POST /api/auth/register
vocabRouter.post("/save", vocabController.save);

// POST /api/auth/login
vocabRouter.get("/show", vocabController.show)

vocabRouter.delete("/delete", vocabController.delete);
export default vocabRouter;
