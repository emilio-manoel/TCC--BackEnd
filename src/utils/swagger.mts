import { JsonObject } from 'swagger-ui-express';

export const swaggerSpec: JsonObject = {
  openapi: '3.0.0',
  info: {
    title: 'Painel Admin & API - Triagem de Doações ONG',
    version: '1.0.0',
    description: 'Documentação interativa para gerenciamento administrativo de ONGs e doações com autenticação JWT.',
  },
  servers: [
    {
      url: 'https://tcc-backend-26nv.onrender.com',
      description: 'Servidor Render (Produção)',
    },
    {
      url: 'http://localhost:3000',
      description: 'Servidor Local (Desenvolvimento)',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Faça login em /admin/login, copie o token retornado e insira no botão "Authorize".',
      },
    },
  },
  paths: {
    // ----------------------------------------------------
    // Autenticação
    // ----------------------------------------------------
    '/admin/login': {
      post: {
        summary: 'Login do Administrador',
        tags: ['Autenticação'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'senha'],
                properties: {
                  email: { type: 'string', example: 'admin@ong.org' },
                  senha: { type: 'string', example: 'admin123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login realizado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Login realizado com sucesso' },
                    token: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
                  },
                },
              },
            },
          },
          401: { description: 'E-mail ou senha incorretos' },
        },
      },
    },

    // ----------------------------------------------------
    // Gerenciamento de ONGs
    // ----------------------------------------------------
    '/admin/pending': {
      get: {
        summary: 'Buscar ONGs com status pendente',
        tags: ['Gerenciamento de ONGs'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Lista de ONGs pendentes e suas necessidades associadas',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ongs: {
                      type: 'array',
                      items: { type: 'object' },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Token não fornecido ou inválido' },
          500: { description: 'Erro interno ao buscar ONGs pendentes' },
        },
      },
    },

    '/admin/{id}/status': {
      patch: {
        summary: 'Atualizar status de aprovação de uma ONG',
        tags: ['Gerenciamento de ONGs'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID da ONG cadastrada no MongoDB',
            schema: { type: 'string' },
            example: '65f1a2b3c4d5e6f7a8b9c0d1',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status_aprovacao'],
                properties: {
                  status_aprovacao: {
                    type: 'string',
                    enum: ['aprovado', 'rejeitado', 'pendente'],
                    example: 'aprovado',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'ONG e necessidades associadas atualizadas',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'ONG e suas necessidades atualizadas para status: aprovado' },
                    ong: { type: 'object' },
                  },
                },
              },
            },
          },
          400: { description: 'Status inválido informado' },
          401: { description: 'Token não fornecido ou inválido' },
          404: { description: 'ONG não encontrada' },
          500: { description: 'Erro interno ao atualizar status da ONG' },
        },
      },
    },

    '/admin/rejected': {
      delete: {
        summary: 'Excluir todas as ONGs rejeitadas e suas necessidades',
        tags: ['Gerenciamento de ONGs'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Confirmação da quantidade de ONGs excluídas',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: '2 ONG(s) rejeitada(s) e suas necessidades foram excluídas com sucesso.' },
                  },
                },
              },
            },
          },
          401: { description: 'Token não fornecido ou inválido' },
          500: { description: 'Erro interno ao excluir ONGs rejeitadas' },
        },
      },
    },
  },
};