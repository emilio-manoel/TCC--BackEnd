import cors from "cors";

export const corsConfig = cors({
  origin: [
    "https://tcc-sistema-inteligente-de-triagem-three.vercel.app",
    'http://localhost:5173',      
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
});