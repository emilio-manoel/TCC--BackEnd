import express from "express";
import { getUf, getNearbyOngs } from "../controllers/donorController.mjs";
import { extrairDadosDoacao } from "../services/LocatorGeminiService.mjs";

const donorRoute = express.Router();

donorRoute.get("/uf/:uf", getUf);
donorRoute.post("/nearby", extrairDadosDoacao, getNearbyOngs);
donorRoute.get("/nearby", getNearbyOngs);

export default donorRoute;
