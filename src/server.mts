import "dotenv/config";
import express from "express";
import { corsConfig } from "./config/cors.mjs";
import "./config/database.mjs";
import ongRoute from "./routes/ongRoutes.mjs";
import adminRoute from "./routes/adminRoutes.mjs";
import donorRoute from "./routes/donorRoutes.mjs";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./utils/swagger.mjs";

const app = express();

app.use(corsConfig);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/ong", ongRoute);
app.use("/admin", adminRoute);
app.use("/donor", donorRoute);

const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
  console.log(`Documentação Swagger em http://${HOST}:${PORT}/docs`);
});

export default app;
