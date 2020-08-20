## Finalidade do template

A ideia é ter um template com uma estrutura pré configurada, com Controller, Services e se necessário Repositories

O banco de dados pre-definido é postgres, caso não seja o banco a ser utilizado ou não queira utilizar UUID, "REMOVER A PRIMEIRA MIGRATIONS" **`_ActivateFunctionUUID.ts`**.

## Conjunto de ferramentas

- **`Fastfy`** (https://github.com/fastify/fastify)

- **`typeORM`** (https://typeorm.io/#/)

## Iniciar o backend

- yarn ou npm install

- yarn ou npm dev:server

## Build

- yarn build
  Obs: **`A copia do arqruivo .env e sua configuração em relação ao typeorm está manual`**

## Futuras implementações e melhorias

- implementar a biblioteca Plop.js (https://plopjs.com/) para automatizar a criação de arquivos;

- implementar uma biblioteca de tests;
