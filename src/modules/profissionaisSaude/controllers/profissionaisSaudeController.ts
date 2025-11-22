import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProfissionaisSaudeController {
  
  async handleCreate(request: Request, response: Response) {
    try {
      const { nome, crm } = request.body;

      if (!nome) {
        return response.status(400).json({ error: 'Nome é obrigatório' });
      }

      const profissional = await prisma.profissionalSaude.create({
        data: { nome, crm }
      });

      return response.status(201).json(profissional);
    } catch (error: any) {
      console.error('Erro ao criar profissional:', error);
      
      if (error.code === 'P2002') {
        return response.status(400).json({ 
          error: 'Profissional com este nome ou CRM já existe' 
        });
      }
      
      return response.status(500).json({ error: 'Erro ao criar profissional' });
    }
  }

  async handleList(request: Request, response: Response) {
    try {
      const profissionais = await prisma.profissionalSaude.findMany({
        orderBy: { nome: 'asc' }
      });
      return response.json(profissionais);
    } catch (error) {
      console.error('Erro ao listar profissionais:', error);
      return response.status(500).json({ error: 'Erro ao listar profissionais' });
    }
  }

  async handleUpdate(request: Request, response: Response) {
    try {
      const { id } = request.params;
      const { nome, crm } = request.body;

      if (!nome) {
        return response.status(400).json({ error: 'Nome é obrigatório' });
      }

      const profissional = await prisma.profissionalSaude.update({
        where: { id },
        data: { nome, crm }
      });

      return response.json(profissional);
    } catch (error: any) {
      console.error('Erro ao atualizar profissional:', error);
      
      if (error.code === 'P2025') {
        return response.status(404).json({ error: 'Profissional não encontrado' });
      }
      
      if (error.code === 'P2002') {
        return response.status(400).json({ 
          error: 'Profissional com este nome ou CRM já existe' 
        });
      }
      
      return response.status(500).json({ error: 'Erro ao atualizar profissional' });
    }
  }

  async handleDelete(request: Request, response: Response) {
    try {
      const { id } = request.params;

      await prisma.profissionalSaude.delete({
        where: { id }
      });

      return response.status(204).send();
    } catch (error: any) {
      console.error('Erro ao deletar profissional:', error);
      
      if (error.code === 'P2025') {
        return response.status(404).json({ error: 'Profissional não encontrado' });
      }
      
      return response.status(500).json({ error: 'Erro ao deletar profissional' });
    }
  }

  // Método adicional para busca
  async handleSearch(request: Request, response: Response) {
    try {
      const { termo } = request.query;
      
      if (!termo || typeof termo !== 'string') {
        return response.status(400).json({ error: 'Termo de busca é obrigatório' });
      }

      const profissionais = await prisma.profissionalSaude.findMany({
        where: {
          OR: [
            { nome: { contains: termo, mode: 'insensitive' } },
            { crm: { contains: termo, mode: 'insensitive' } }
          ]
        },
        take: 10
      });

      return response.json(profissionais);
    } catch (error) {
      console.error('Erro na busca de profissionais:', error);
      return response.status(500).json({ error: 'Erro na busca de profissionais' });
    }
  }
}