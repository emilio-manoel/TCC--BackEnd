import Ong from '../models/ONG.mjs';
import Necessidade from '../models/Necessidade.mjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export const getPendingOngs = async ( _req:Request, res: Response) => {
  try {
    const ongs = await Ong.find({ status_aprovacao: 'pendente' }).populate('necessidades');
    res.status(200).json({ ongs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar ONGs pendentes';
    res.status(500).json({ message });
  }
};

export const updateOngStatus = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status_aprovacao } = req.body;

    if (!['aprovado', 'rejeitado', 'pendente'].includes(status_aprovacao)) {
      res.status(400).json({ message: 'Status inválido' });
      return;
    }

    const ong = await Ong.findByIdAndUpdate(id, { status_aprovacao },  { returnDocument: 'after' }).populate('necessidades');
    
    if (!ong) {
      res.status(404).json({ message: 'ONG não encontrada' });
      return;
    }

    // Atualiza o status das necessidades associadas
    await Necessidade.updateMany({ ong: ong._id }, { status_aprovacao });

    res.status(200).json({ message: `ONG e suas necessidades atualizadas para status: ${status_aprovacao}`, ong });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar status da ONG';
    res.status(500).json({ message });
  }
};

export const deleteRejectedOngs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rejectedOngs = await Ong.find({ status_aprovacao: 'rejeitado' });
    const ongsIds = rejectedOngs.map(ong => ong._id);

    if (ongsIds.length === 0) {
      res.status(200).json({ message: 'Nenhuma ONG rejeitada encontrada para excluir.' });
      return;
    }

    // Apaga as necessidades associadas às ONGs rejeitadas
    await Necessidade.deleteMany({ ong: { $in: ongsIds } });
    
    // Apaga as ONGs
    const result = await Ong.deleteMany({ status_aprovacao: 'rejeitado' });

    res.status(200).json({ 
      message: `${result.deletedCount} ONG(s) rejeitada(s) e suas necessidades foram excluídas com sucesso.` 
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao excluir ONGs rejeitadas';
    res.status(500).json({ message });
  }
};


const JWT_SECRET = process.env.JWT_SECRET || 'chave_fallback_secreta';

export async function loginAdmin(req: Request, res: Response) {
  const { email, senha } = req.body;

  // Validação simples (pode comparar com o banco ou com o .env)
  const adminEmail = process.env.ADMIN_USER 
  const adminSenha = process.env.ADMIN_PASS 

  if (email !== adminEmail || senha !== adminSenha) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos' });
  }

  // Gera o token válido por 1 dia (24h)
  const token = jwt.sign(
    { email, role: 'admin' }, 
    JWT_SECRET, 
    { expiresIn: '1d' }
  );

  return res.json({
    message: 'Login realizado com sucesso',
    token,
  });
}