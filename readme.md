# 🤝 Sistema Inteligente de Triagem e Match para Doações de ONGs — Back-End

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-Tipagem-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-API-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Banco_de_Dados-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Google_Gemini-Inteligência_Artificial-8E75B2?logo=googlegemini&logoColor=white" alt="Google Gemini" />
</p>

## 📌 Sobre o Projeto

O **Sistema Inteligente de Triagem e Match para Doações de ONGs** é um projeto desenvolvido como parte do meu Trabalho de Conclusão de Curso (TCC), no contexto da graduação em Análise e Desenvolvimento de Sistemas.

A proposta é desenvolver uma plataforma inteligente que facilite a conexão entre pessoas interessadas em realizar doações e Organizações não governamentais (ONGs) que possam atender às suas intenções de doação.

Este repositório contém o **Back-End da aplicação**, responsável pelo processamento das requisições, gerenciamento dos dados, validação das informações fornecidas e execução da lógica necessária para identificar organizações potencialmente compatíveis com as necessidades dos doadores.

A aplicação utiliza inteligência artificial para interpretar as informações fornecidas por meio de uma conversa, identificar a localização e os itens mencionados e gerar recomendações contextualizadas com base nas organizações encontradas.

O objetivo é utilizar a tecnologia para tornar o processo de busca e encaminhamento de doações mais organizado, acessível e eficiente.

---

## 🏗️ Responsabilidades do Back-End

O servidor funciona como a camada responsável pelo processamento e pela aplicação das regras de negócio do sistema.

### 🤖 Triagem Inteligente com IA

A aplicação utiliza a API do **Google Gemini** para interpretar o histórico de conversas do doador e extrair informações relevantes, como:

- Localização do usuário, por CEP ou município e estado;
- Itens que o usuário deseja doar;
- Quantidades informadas, quando disponíveis;
- Informações necessárias para dar continuidade à triagem.

Quando os dados estão incompletos, o processamento retorna uma pergunta para solicitar as informações que faltam.

Quando a localização é identificada e validada, o sistema pode continuar a busca pelas organizações compatíveis.

### 🎯 Correspondência entre Doadores e ONGs

Após identificar as informações relevantes da solicitação, o servidor pesquisa organizações aprovadas e próximas à localização identificada.

A aplicação utiliza informações como áreas de atuação, necessidades cadastradas e dados fornecidos pelo doador para gerar uma resposta contextualizada com apoio do Gemini.

O resultado é apresentado como uma **sugestão de possíveis organizações compatíveis**, sem garantir que uma instituição aceite determinado item. A confirmação das condições de recebimento deve ser feita diretamente com a organização.

### 🏢 Cadastro e Validação de ONGs

O servidor recebe os dados enviados pelo formulário de cadastro e realiza validações antes de persistir as informações.

Entre os procedimentos implementados estão:

- Validação do formato do CNPJ;
- Consulta de informações cadastrais por meio da BrasilAPI;
- Verificação da situação cadastral e da natureza jurídica;
- Validação e localização do endereço informado;
- Verificação de duplicidade de CNPJ;
- Registro das informações e das necessidades de doação;
- Definição do status inicial de aprovação como pendente.

Esse processo ajuda a manter os registros organizados e permite que as novas organizações sejam submetidas à avaliação administrativa.

### 📍 Pesquisa Geográfica

O sistema utiliza coordenadas geográficas para localizar as organizações cadastradas.

A partir da localização do doador, o servidor consulta as ONGs aprovadas em um raio de até **25 quilômetros**, retornando informações que podem ser utilizadas pelo front-end para apresentar os resultados em uma lista e em um mapa.

A localização pode ser obtida por meio da consulta de CEP e de serviços de geocodificação.

### 🔐 Gerenciamento Administrativo

O back-end possui rotas destinadas à administração das organizações cadastradas.

As funcionalidades incluem:

- Autenticação do administrador;
- Consulta de ONGs aguardando aprovação;
- Aprovação, rejeição ou retorno de uma ONG ao status pendente;
- Atualização do status das necessidades associadas;
- Exclusão de organizações rejeitadas e de suas necessidades relacionadas.

As rotas administrativas protegidas utilizam tokens JWT para validar a autenticação das requisições.

---

## 🚀 Tecnologias Utilizadas

### 🟢 Node.js

O Node.js permite executar JavaScript no servidor e fornece o ambiente necessário para processar as requisições, executar as regras de negócio e integrar a aplicação com bancos de dados e serviços externos.

### 🔷 TypeScript

O TypeScript adiciona tipagem estática ao JavaScript, ajudando a identificar inconsistências durante o desenvolvimento e facilitando a organização do código.

No projeto, é utilizado para tipar os dados recebidos nas requisições, as respostas, as entidades e os resultados das operações realizadas pelo servidor.

### ⚡ Express

O Express é o framework responsável pela estrutura da API HTTP.

Ele permite organizar as rotas e os controladores, processar requisições, aplicar middlewares e retornar respostas ao front-end.

A aplicação possui rotas separadas para doadores, ONGs e administradores, facilitando a organização das responsabilidades do servidor.

### 🍃 MongoDB

O MongoDB é o banco de dados utilizado para armazenar as informações das ONGs e suas necessidades de doação.

Por trabalhar com documentos, permite estruturar os registros de acordo com os dados utilizados pelo sistema, incluindo informações cadastrais, áreas de atuação, status de aprovação e localização geográfica.

### 🧩 Mongoose

O Mongoose é utilizado para conectar a aplicação ao MongoDB e definir os modelos de dados.

Ele facilita a criação e a consulta dos registros, a aplicação de validações e o relacionamento entre organizações e suas necessidades cadastradas.

O projeto também utiliza índices geoespaciais para apoiar as consultas de localização.

### 🤖 Google Gemini API

A integração com o Google Gemini é um dos componentes centrais do projeto.

A inteligência artificial é utilizada em duas etapas principais:

- **Extração de informações:** interpretação do histórico da conversa para identificar localização e intenção de doação em um formato estruturado.
- **Geração de recomendações:** análise das informações extraídas e das ONGs encontradas para produzir uma resposta contextualizada ao usuário.

O processamento utiliza instruções e esquemas de resposta estruturados para facilitar a integração entre a inteligência artificial e a lógica do servidor.

### 🔑 JSON Web Token (JWT)

O JWT é utilizado na autenticação administrativa.

Após a validação das credenciais do administrador, o servidor gera um token que pode ser enviado nas requisições protegidas. Um middleware verifica a validade desse token antes de permitir o acesso às rotas administrativas correspondentes.

### 🌐 CORS

O CORS controla quais origens podem realizar requisições à API por meio do navegador.

Essa configuração permite a comunicação entre o front-end publicado separadamente e o servidor, respeitando as origens autorizadas na aplicação.

### 📚 Swagger

O Swagger UI disponibiliza uma documentação interativa da API.

Por meio dela, é possível consultar os endpoints, conhecer os parâmetros esperados, observar os formatos das respostas e testar operações disponibilizadas pelo servidor.

### 🧾 Dotenv

O Dotenv permite carregar variáveis de ambiente a partir de um arquivo `.env`, separando configurações como credenciais, chaves de serviços externos e parâmetros de execução do código-fonte.

### ✅ CPF-CNPJ Validator

Biblioteca utilizada para auxiliar na validação e normalização do CNPJ informado durante o cadastro das organizações.

---

## 🔌 Endpoints Principais

A API está organizada em três grupos principais de rotas.

| Método | Endpoint | Responsabilidade |
|---|---|---|
| `POST` | `/ong` | Valida e cadastra uma ONG. |
| `GET` | `/donor/uf/:uf` | Consulta ONGs aprovadas por estado. |
| `POST` | `/donor/nearby` | Processa a solicitação do doador e busca organizações próximas. |
| `POST` | `/admin/login` | Autentica o administrador e retorna um JWT. |
| `GET` | `/admin/pending` | Lista organizações pendentes de aprovação. |
| `PATCH` | `/admin/:id/status` | Atualiza o status de aprovação de uma ONG. |
| `DELETE` | `/admin/rejected` | Remove ONGs rejeitadas e suas necessidades associadas. |

As rotas administrativas, exceto o login, exigem autenticação por token.

Os detalhes dos parâmetros, corpos das requisições e respostas podem ser consultados na documentação Swagger.

---

## 🧠 Integrações Externas

Além do Google Gemini, o servidor utiliza serviços externos para enriquecer e validar as informações processadas.

### 🇧🇷 BrasilAPI

Utilizada para consultar informações de CEP e CNPJ, auxiliando na validação cadastral das organizações e na identificação de dados de localização.

### 🗺️ OpenStreetMap — Nominatim

Utilizado como serviço de geocodificação para localizar municípios e obter coordenadas geográficas quando necessário.

Essas integrações ajudam o sistema a validar informações fornecidas pelos usuários e a executar consultas geográficas para identificar organizações próximas.

---

## 🔐 Configuração e Variáveis de Ambiente

Para executar o projeto localmente, é necessário configurar as variáveis de ambiente utilizadas pelo servidor.

Crie um arquivo `.env` na raiz do projeto com os parâmetros necessários:

```env
PORT=3000
DEVELOPMENT_HOST=0.0.0.0

MONGODB_URI=sua_uri_do_mongodb
API_GEMINI=sua_chave_da_api_gemini

JWT_SECRET=sua_chave_secreta_jwt
ADMIN_USER=seu_usuario_administrador
ADMIN_PASS=sua_senha_administrativa
```

Substitua os valores de exemplo pelas suas próprias configurações. O arquivo `.env` contém informações sensíveis e não deve ser enviado ao GitHub.

---

## ⚙️ Como Executar Localmente

### Pré-requisitos

- Node.js instalado;
- npm ou outro gerenciador de pacotes compatível;
- Instância do MongoDB acessível;
- Chave de acesso à API do Google Gemini.

### 1. Clone o repositório

```bash
git clone https://github.com/emilio-manoel/TCC--BackEnd.git
```

### 2. Entre na pasta do projeto

```bash
cd TCC--BackEnd
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure as variáveis de ambiente

Crie o arquivo `.env` e preencha as configurações necessárias, conforme explicado anteriormente.

### 5. Inicie o servidor em modo de desenvolvimento

```bash
npm run dev
```

Por padrão, o servidor utiliza a porta `3000`.

### 6. Acesse a documentação da API

Com o servidor em execução, abra:

```text
http://localhost:3000/docs
```

### Compilação para produção

Para gerar a versão compilada do projeto:

```bash
npm run build
```

Depois, execute:

```bash
npm start
```

---

## 🎯 Objetivos Alcançados

O desenvolvimento do back-end deste TCC representa uma etapa importante da minha formação como futuro **Desenvolvedor Full-Stack**.

Ao longo do projeto, foi possível aplicar e aprofundar conhecimentos em:

- Desenvolvimento de APIs REST;
- Organização de rotas, controladores, serviços e middlewares;
- Utilização de TypeScript no lado do servidor;
- Modelagem e persistência de dados com MongoDB e Mongoose;
- Integração de inteligência artificial em aplicações;
- Engenharia de prompts e processamento de respostas estruturadas;
- Validação de dados cadastrais;
- Autenticação e autorização de rotas administrativas;
- Consultas geoespaciais;
- Integração com serviços externos;
- Documentação de endpoints com Swagger;
- Configuração de ambientes de desenvolvimento e produção.

Além dos aspectos técnicos, o projeto exige a tradução de requisitos acadêmicos e sociais em regras de negócio concretas, considerando validações, possíveis falhas de serviços externos e consistência dos dados.

---

## 📈 Importância do Projeto na Minha Formação

O desenvolvimento deste back-end ampliou meus conhecimentos para além da criação de interfaces, permitindo trabalhar com a lógica responsável pelo processamento das informações e pelo funcionamento dos principais recursos da plataforma.

A integração entre API, banco de dados, inteligência artificial, validação cadastral e localização geográfica proporcionou experiência com diferentes componentes de uma aplicação real.

Como projeto de TCC, ele também representa a oportunidade de aplicar conceitos de Engenharia de Software na construção de uma solução voltada a um problema social relevante.

Essa experiência fortalece minha preparação para atuar como **Desenvolvedor Full-Stack**, desenvolvendo aplicações que envolvam tanto a interface com o usuário quanto o processamento, a persistência e a disponibilização dos dados.

---

## 🔗 Links do Projeto

- 💻 **Repositório Back-End:** [GitHub](https://github.com/emilio-manoel/TCC--BackEnd)
- ⚛️ **Repositório Front-End:** [GitHub](https://github.com/emilio-manoel/TCC--Sistema-Inteligente-de-Triagem-e-Match-para-Doacoes-de-ONGs)
- 📚 **Documentação interativa da API:** [Swagger UI](https://tcc-backend-26nv.onrender.com/docs)

---

<p align="center">
  Desenvolvido como parte do Trabalho de Conclusão de Curso em Análise e Desenvolvimento de Sistemas.
</p>