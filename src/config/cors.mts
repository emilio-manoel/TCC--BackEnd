import cors from "cors";

export const corsConfig = cors({
  origin: [
    "*",
  ],
  optionsSuccessStatus: 200,
});