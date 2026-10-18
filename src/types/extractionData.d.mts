export interface ItemDonor {
  descricao: string;
  quantidade?: string | null;
}

export interface ExtractionIncompleto {
  status: "incompleto";
  question: string;
  cep?: string | null;
  cidade?: string | null;
  uf?: string | null;
  povoado?: string | null;
  itens?: ItemDonor[];
}

export interface ExtractionCompleto {
  status: "completo";
  cep?: string | null;
  cidade?: string | null;
  uf?: string | null;
  povoado?: string | null;
  itens: ItemDonor[];
  question?: string | null;
}

export type ExtractionResult = ExtractionIncompleto | ExtractionCompleto;

export interface ChatMessageInput {
  sender: "user" | "bot";
  content: string;
}
