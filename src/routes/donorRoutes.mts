import express from "express";
import { getUf, getNearbyOngs } from "../controllers/donorController.mjs";
import { extractDonorData } from "../services/extractDonorData.mjs";

const donorRoute = express.Router();

donorRoute.get("/uf/:uf", getUf);
donorRoute.post("/nearby", extractDonorData, getNearbyOngs);

export default donorRoute;
