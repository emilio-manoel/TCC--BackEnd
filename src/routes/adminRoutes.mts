import express from "express";
import { getPendingOngs, updateOngStatus, deleteRejectedOngs, loginAdmin } from "../controllers/adminController.mjs";
import { authMiddleware } from "../middlewares/auth.mjs";

const adminRoute = express.Router();

adminRoute.post('/login', loginAdmin);

adminRoute.get("/pending", authMiddleware, getPendingOngs);
adminRoute.patch("/:id/status", authMiddleware, updateOngStatus);
adminRoute.delete("/rejected", authMiddleware, deleteRejectedOngs);

export default adminRoute;
