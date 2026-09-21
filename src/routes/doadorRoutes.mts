import express from "express";
import { getUf, getNearbyOngs } from "../controllers/doadorController.mjs";
import { extrairDadosDoacao } from "../services/LocatorGeminiService.mjs";

const doadorRoute = express.Router();

doadorRoute.get("/uf/:uf", getUf);
doadorRoute.post("/nearby", extrairDadosDoacao, getNearbyOngs);
doadorRoute.get("/nearby", getNearbyOngs);

export default doadorRoute;
