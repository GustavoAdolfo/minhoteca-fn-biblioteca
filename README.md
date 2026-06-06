![GitHub](https://img.shields.io/github/license/GustavoAdolfo/minhoteca-fn-biblioteca)
![npm](https://img.shields.io/npm/v/@Gustavoadolfo/minhoteca-fn-biblioteca)
![CI](https://github.com/GustavoAdolfo/minhoteca-fn-biblioteca/actions/workflows/ci.yml/badge.svg)

# minhoteca-fn-biblioteca

Função AWS Lambda responsável por expor a API de consulta do acervo da Minhoteca.

## Visão geral

Este repositório contém a função Lambda que processa requisições HTTP, utiliza um cache em DynamoDB e redireciona rotas para casos de uso reais da aplicação.

### Principais arquivos

- `src/index.ts` — handler principal da Lambda
- `src/registradores.ts` — mapeamento de rotas para `UseCase` via regex
- `tests/intex.test.ts` — testes unitários do handler
- `package.json` — scripts, dependências e configuração do projeto
- `jest.config.js` — configuração do Jest
- `eslint.config.js` — configuração do ESLint

## Estrutura do projeto

```
CHANGELOG.md
CONTRIBUTING.md
LICENSE
README.md
commitlint.config.js
eslint.config.js
jest.config.js
package.json
tsconfig.json
version.mjs
coverage/
src/
  index.ts
  registradores.ts
tests/
  intex.test.ts
terraform/
```

## Scripts úteis

```bash
npm install
npm test
npm run test:coverage
npm run test:watch
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run build
```

## Como executar

1. Instale as dependências:

```bash
npm install
```

2. Execute os testes:

```bash
npm test
```

3. Verifique a cobertura:

```bash
npm run test:coverage
```

4. Verifique o lint:

```bash
npm run lint
```

## Sobre o handler

O `src/index.ts` realiza as seguintes etapas:

1. Recebe `APIGatewayEvent`
2. Gera uma chave de cache a partir de `path`, método HTTP e `queryStringParameters`
3. Tenta recuperar resposta do cache DynamoDB
4. Se houver cache, retorna `200` com `X-Cache: HIT`
5. Se não houver cache, procura o registrador correto em `src/registradores.ts`
6. Executa o `UseCase` correspondente
7. Salva o resultado em cache e retorna `200`
8. Trata erros de execução do caso de uso e retorna `500` com `LogId`

## Dependências principais

- `@gustavoadolfo/minhoteca-core-layer`
- `@gustavoadolfo/minhoteca-adapter-layer`
- `@gustavoadolfo/minhoteca-casos-de-uso-layer`
- `aws-lambda`
- `typescript`
- `jest`
- `eslint`
- `prettier`

## Contribuição

Veja `CONTRIBUTING.md` para orientações sobre:

- como configurar o ambiente
- convenção de commits
- execução de testes
- fluxo de PR

## Licença

Este projeto está licenciado sob a licença **MIT**. Veja [LICENSE](./LICENSE) para mais detalhes.
