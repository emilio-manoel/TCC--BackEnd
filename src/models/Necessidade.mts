import { Schema, model, Document, Types } from "mongoose";

export interface INecessidade extends Document {
  ong: Types.ObjectId;
  item?: string;
  categoria?: string;
  urgencia: "baixa" | "media" | "alta";
  status_aprovacao: "pendente" | "aprovado" | "rejeitado";
}

const necessidadeSchema = new Schema<INecessidade>(
  {
    ong: { 
        type: Schema.Types.ObjectId, 
        ref: "ONG", 
        required: true 
    },
    item: { 
        type: String, 
        required: false
    },
    categoria: { 
        type: String, 
        required: false
    },
    urgencia: {
      type: String,
      enum: ["baixa", "media", "alta"],
      default: "media",
    },
    status_aprovacao: {
      type: String,
      enum: ["pendente", "aprovado", "rejeitado"],
      default: "pendente",
    },
  },
  { timestamps: true }
);

const Necessidade = model<INecessidade>("Necessidade", necessidadeSchema, "necessidades");

export default Necessidade;