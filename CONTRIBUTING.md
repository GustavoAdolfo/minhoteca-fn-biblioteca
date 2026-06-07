# Contribuindo com o Projeto minhoteca-fn-biblioteca

Obrigado por contribuir com o **minhoteca-fn-biblioteca**! Este repositório é uma função Lambda que expõe a API de consulta do acervo da Minhoteca.

## 📋 Código de Conduta

Mantenha um comportamento respeitoso, inclusivo e colaborativo. Assédio, discriminação ou comportamento tóxico não são aceitos.

## 🚀 Como Começar

### 0. Pré-requisitos

- Node.js **24+**
- npm **10+**

### 1. Fork e Clone

```bash
git clone https://github.com/GustavoAdolfo/minhoteca-fn-biblioteca.git
cd minhoteca-fn-biblioteca
git remote add upstream https://github.com/GustavoAdolfo/minhoteca-fn-biblioteca.git
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Husky

Após a instalação, execute:

```bash
npx husky install
```

Isso garante que os hooks definidos em `package.json` fiquem ativos.

## ✅ Estrutura do Projeto

```
CHANGELOG.md
commitlint.config.js
CONTRIBUTING.md
eslint.config.js
jest.config.js
LICENSE
package.json
README.md
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

### O que está neste projeto

- `src/index.ts` — handler AWS Lambda principal
- `src/registradores.ts` — mapeamento de rotas para cases de uso
- `tests/intex.test.ts` — testes de unidade do handler
- `package.json` — scripts e dependências
- `jest.config.js` — configuração do Jest
- `eslint.config.js` — configuração do ESLint

## 🧪 Executando Testes

```bash
npm test
npm run test:coverage
npm run test:watch
```

## 🔎 Lint e Formatação

```bash
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

## 🔨 Compilação

```bash
npm run build
```

## ✅ Como Abrir um PR

1. Crie uma branch com nome claro:

```bash
git checkout -b feature/nova-funcionalidade
```

2. Faça alterações pequenas e focadas.
3. Adicione ou atualize testes conforme necessário.
4. Rode os testes e o lint localmente.
5. Faça commit com mensagem clara.
6. Dê push e abra um Pull Request.

## 📝 Convenção de Commits

Use mensagens descritivas em formato Conventional Commits:

```text
feat: adicionar suporte a queryStringParameters
fix: corrigir retorno 204 no handler
docs: atualizar CONTRIBUTING.md
test: adicionar caso de uso para erro de cache
```

## ⚠️ Regras Importantes

- Mantenha o código em TypeScript
- Use `src/` para lógica de produção
- Use `tests/` para cobertura de unidade
- Não faça mudanças não relacionadas no mesmo PR
- Garanta que `npm test` passe antes de abrir o PR

## 💡 Dicas de Contribuição

- Prefira testes pequenos e determinísticos
- Use nomes descritivos em `describe` e `it`
- Teste branches de erro e caminhos principais
- Quando precisar adicionar nova dependência, verifique se ela é realmente necessária

## 📚 Referências

- `README.md` — visão geral e propósito do projeto
- `CHANGELOG.md` — registre mudanças relevantes
- `package.json` — scripts disponíveis e dependências

## ❓ Tem dúvidas?

Abra uma issue ou deixe um comentário no PR.

---

Obrigado por fazer parte da Minhoteca! 🎉
