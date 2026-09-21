import express from "express";
import { getPendingOngs, updateOngStatus, deleteRejectedOngs } from "../controllers/adminController.mjs";

const adminRoute = express.Router();

adminRoute.get("/pending", getPendingOngs);
adminRoute.patch("/:id/status", updateOngStatus);
adminRoute.delete("/rejected", deleteRejectedOngs);

export default adminRoute;
