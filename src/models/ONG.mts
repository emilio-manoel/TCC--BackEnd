import { Schema, model, Document } from "mongoose";
import { INecessidade } from "./Necessidade.mjs";

export interface IONG extends Document {
  cnpj: string;
  razao_social: string;
  natureza_juridica: string;
  situacao_cadastral: string;
  endereco_completo: string;
  municipio: string;
  descricao:string;
  uf: string;
  areas_atuacao: string[];
  subareas_atuacao?: string[];
  numero_contato?: string[];
  redes_sociais?: string[];
  status_aprovacao: 'pendente' | 'aprovado' | 'rejeitado';
  localizacao: {
    type: "Point";
    coordinates: [number, number];
  };
  localizacao_original: {
    type: "Point";
    coordinates: [number, number];
  };
  virtualNecessidade?:INecessidade[]
}

const ongSchema = new Schema<IONG>({
  cnpj: { 
    type: String, 
    required: true,
    unique:true
},
  razao_social: { 
    type: String, 
    required: true 
},
  natureza_juridica: { 
    type: String, 
    required: true 
},
  situacao_cadastral: { 
    type: String, 
    required: true,
    default: "ativa"
},
  endereco_completo: { 
    type: String, 
    required: true 
},
  descricao: { 
    type: String,
},
  municipio: { 
    type: String, 
    required: true 
},
  uf: { 
    type: String, 
    required: true 
},
  areas_atuacao: { 
    type: [String], 
    default: [] 
},
  subareas_atuacao: { 
    type: [String], 
    default: [] 
},
  numero_contato: { 
    type: [String], 
    default: [] 
},
  redes_sociais: { 
    type: [String], 
    default: [] 
},
  status_aprovacao: {
    type: String,
    enum: ['pendente', 'aprovado', 'rejeitado'],
    default: 'pendente'
  },
  localizacao: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

ongSchema.index({ localizacao: "2dsphere" });

ongSchema.virtual('virtualNecessidade', {
  ref: 'Necessidade',
  localField: '_id',
  foreignField: 'ong'
});

ongSchema.set('toJSON', { virtuals: true });
ongSchema.set('toObject', { virtuals: true });


const Ong = model<IONG>("ONG", ongSchema, "collectionONG");

export default Ong;
