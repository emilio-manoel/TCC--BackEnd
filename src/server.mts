import express from "express";
import { corsConfig } from "./config/cors.mjs";
import "./config/database.mjs";
import ongRoute from "./routes/ongRoutes.mjs";
import adminRoute from "./routes/adminRoutes.mjs";
import doadorRoute from "./routes/doadorRoutes.mjs";

const app = express();

app.use(corsConfig);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/ong", ongRoute);
app.use("/admin", adminRoute);
app.use("/doador", doadorRoute);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));


export default app;