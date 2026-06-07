# Changelog

Todos os mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/),
e este projeto segue [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- `src/index.ts`: handler AWS Lambda para requisições API Gateway com cache em DynamoDB.
- `src/registradores.ts`: mapeamento de rotas `GET` para casos de uso via regex.
- `tests/intex.test.ts`: cobertura de unidades para cache, rotas exatas, erro de caso de uso e falta de registrador.
- `CONTRIBUTING.md`: guia de contribuição alinhado com a estrutura atual do projeto.
- `README.md`: documentação atualizada com a estrutura de arquivos e scripts reais.

### Changed

- `package.json`: scripts de lint, formatação, testes e build utilizados pelo projeto.
- `README.md` e `CONTRIBUTING.md` atualizados para refletir o fluxo real de desenvolvimento.

### Fixed

- Ajuste de documentação para remover referências a pastas e arquivos inexistentes.
- Registro de rotas reais no `README.md` e no guia de contribuição.

## [0.1.0] - 2026-06-06

### Added

- Primeira versão pública do `minhoteca-fn-biblioteca`.
- Suporte a buscas por livros e autores via Lambda.
- Integração com `@gustavoadolfo/minhoteca-core-layer`, `minhoteca-adapter-layer` e `minhoteca-casos-de-uso-layer`.
- Estrutura de projeto com `src/`, `tests/`, `package.json`, `jest.config.js` e `eslint.config.js`.
