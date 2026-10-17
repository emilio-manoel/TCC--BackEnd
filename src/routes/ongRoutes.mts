import express from "express";
import { createOng } from "../controllers/ongController.mjs";
import { validateCreationOng } from "../middlewares/validateCreationOng.mjs";

const ongRoute = express.Router();

ongRoute.post("/", validateCreationOng, createOng);

export default ongRoute;
