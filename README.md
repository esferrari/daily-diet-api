# API Dieta Diária.

### API para controle dieta diária.

### Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina as seguintes ferramentas:
[Git](https://git-scm.com), [NodeJS](https://nodejs.org/en)). 
Além disto é bom ter um editor para trabalhar com o código como [VSCode](https://code.visualstudio.com/)

### 🎲 Rodando o Projeto

```bash
# Clone este repositório.
$ git clone <https://github.com/esferrari/daily-diet-api.git>

# Acesse a pasta do projeto no terminal/cmd.
$ cd daily-diet-api

# Instale as dependências.
$ npm install

# Executar migrations
$ npx prisma migrate dev

# Execute a aplicação em modo de desenvolvimento
$ npm run dev

# O servidor inciará na porta:3333 - acesse <http://localhost:3333/>

# Após o inicio do servidor acesse a documentação - <http://localhost:3333/docs>
```

### 🛠 Tecnologias

As seguintes ferramentas foram usadas na construção do projeto:

- [NodeJS](https://nodejs.org/en)
- [TypeScript](https://www.typescriptlang.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Fastify](https://www.fastify.io/)
- [Zod](https://zod.dev/)
- [Docker](https://www.docker.com/)
- [Vitest](https://vitest.dev/)
