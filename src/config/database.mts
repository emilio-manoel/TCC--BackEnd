import mongoose from "mongoose";

const dbUri = process.env.MONGODB_URI || "";

if (!dbUri) {
  console.error(
    "Erro: A variável de ambiente MONGODB_URI não foi encontrada no arquivo .env",
  );
} else {
  mongoose
    .connect(dbUri, {
      autoIndex: true, // Garante que o Mongoose crie os índices definidos nos Schemas
    })
    .then(() => {
     console.log("e conectado no mongoDB")
    })
    .catch((err) => {
      console.log("Erro de conexão: ", err);
    });
}
