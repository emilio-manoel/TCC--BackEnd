import Ong from "../models/ONG.mjs";
import Necessidade from "../models/Necessidade.mjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const getPendingOngs = async (_req: Request, res: Response) => {
  try {
    const ongs = await Ong.find({ status_aprovacao: "pendente" }).populate(
      "virtualNecessidade",
    );
    res.status(200).json({ ongs });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao buscar ONGs pendentes";
    res.status(500).json({ message });
  }
};

// ---------------------------------------------------

type StatusAprovacao = "pendente" | "aprovado" | "rejeitado";
interface UpdateStatusRequestBody {
  status_aprovacao: StatusAprovacao;
}

export const updateOngStatus = async (
  req: Request<{ id: string }, {}, UpdateStatusRequestBody>,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status_aprovacao } = req.body;

    const STATUS_VALIDOS = ["aprovado", "rejeitado", "pendente"] as const;
    if (!STATUS_VALIDOS.includes(status_aprovacao as StatusAprovacao)) {
      res.status(400).json({ message: "Status inválido" });
      return;
    }

    const ong = await Ong.findByIdAndUpdate(
      id,
      { $set: { status_aprovacao } },
      { returnDocument: "after", runValidators: true },
    ).populate("virtualNecessidade");

    if (!ong) {
      res.status(404).json({ message: "ONG não encontrada" });
      return;
    }

    await Necessidade.updateMany(
      { ong: ong._id },
      { $set: { status_aprovacao } },
    );

    res.status(200).json({
      message: `ONG e suas necessidades atualizadas para status: ${status_aprovacao}`,
      ong,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao atualizar status da ONG";
    res.status(500).json({ message });
  }
};

// ---------------------------------------------------

export const deleteRejectedOngs = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
     const ongsIds = await Ong.distinct("_id", { status_aprovacao: "rejeitado" });

    if (ongsIds.length === 0) {
      res
        .status(200)
        .json({ message: "Nenhuma ONG rejeitada encontrada para excluir." });
      return;
    }

    const resultNecessidade =  await Necessidade.deleteMany({ ong: { $in: ongsIds } });
    
    const result = await Ong.deleteMany({ _id: { $in: ongsIds } });


    res.status(200).json({
      message: `${result.deletedCount} ONG(s) rejeitada(s) e ${resultNecessidade.deletedCount} necessidades foram excluídas com sucesso.`,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao excluir ONGs rejeitadas";
    res.status(500).json({ message });
  }
};

// -----------------------------------------------

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET não definida no ambiente");
  return secret;
}

export async function loginAdmin(req: Request<{}, {},{email:string, senha:string}>, res: Response) {
  const { email, senha } = req.body;

  const adminEmail = process.env.ADMIN_USER;
  const adminSenha = process.env.ADMIN_PASS;

  if (email !== adminEmail || senha !== adminSenha) {
    return res.status(401).json({ error: "E-mail ou senha incorretos" });
  }

  const token = jwt.sign({ email, role: "admin" }, getJwtSecret(), {
    expiresIn: "1d",
  });

  return res.json({
    message: "Login realizado com sucesso",
    token,
  });
}
