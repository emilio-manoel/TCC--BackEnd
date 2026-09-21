import express from "express";
import { createOng } from "../controllers/ongController.mjs";
import { validaCriacaoOng } from "../middlewares/errorHandler.mjs";

const ongRoute = express.Router();

ongRoute.post("/", validaCriacaoOng, createOng);

export default ongRoute;
