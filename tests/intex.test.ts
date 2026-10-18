/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIGatewayEvent, Context } from 'aws-lambda';

const mockGetData = jest.fn();
const mockSaveData = jest.fn();
const mockGetAll = jest.fn();

jest.mock('@gustavoadolfo/minhoteca-adapter-layer', () => ({
  __esModule: true,
  DynamoDBRepository: jest.fn().mockImplementation(() => ({
    getData: mockGetData,
    saveData: mockSaveData,
    getAll: mockGetAll,
  })),
  MongoDBRepository: Object.assign(
    jest.fn().mockImplementation(() => ({ getAll: mockGetAll })),
    { getInstance: jest.fn(() => ({ getAll: mockGetAll })) }
  ),
  ResultType: {},
}));

process.env.DYNAMODB_REPOSITORY = 'true';
process.env.TABELA_LIVROS = 'Livros';
process.env.TB_CACHE = 'test-cache';

let handler: any;
let registradores: any;

const createEvent = (path: string, method: string, query: any = null): APIGatewayEvent =>
  ({
    path,
    httpMethod: method,
    queryStringParameters: query,
    headers: {},
    multiValueHeaders: {},
    body: null,
    isBase64Encoded: false,
    pathParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
  }) as APIGatewayEvent;

describe('BibliotecaHandler (index.ts)', () => {
  const mockContext = {} as Context;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    process.env.DYNAMODB_REPOSITORY = 'true';
    process.env.TABELA_LIVROS = 'Livros';
    process.env.TB_CACHE = 'test-cache';

    handler = require('../src/index').handler;
    registradores = require('../src/registradores').registradores;
  });

  it('deve carregar registradores reais e incluir /v1/livros', () => {
    expect(Array.isArray(registradores.get)).toBe(true);
    expect(
      registradores.get.some(
        (route: Record<string, unknown>) => Object.keys(route)[0] === '^\/v1\/livros$'
      )
    ).toBe(true);
  });

  it('deve retornar dados do cache se existirem (Cache HIT)', async () => {
    const cachedResponse = {
      PageData: [{ id: '1', situacao: 'EMPRESTADO' }],
    };
    mockGetData.mockResolvedValue({
      data: [
        {
          content: JSON.stringify(cachedResponse),
          Expiration: Math.floor(Date.now() / 1000) + 3600,
        },
      ],
    });

    const result = await handler(createEvent('/v1/livros', 'GET'), mockContext);

    expect(result.statusCode).toBe(200);
    expect(result.headers?.['X-Cache']).toBe('HIT');
    expect(JSON.parse(result.body)).toEqual(cachedResponse);
    expect(mockSaveData).not.toHaveBeenCalled();
  });

  it.each([
    ['sem situacao', { PageData: [{ id: '1', status: 'EMPRESTADO' }] }, 3600],
    ['com situacao nula', { PageData: [{ id: '1', situacao: null }] }, 3600],
    ['com situacao vazia', { PageData: [{ id: '1', situacao: '' }] }, 3600],
    ['sem PageData', {}, 3600],
    ['com PageData invalido', { PageData: 'cached-data' }, 3600],
    ['expirado', { PageData: [{ id: '1', situacao: 'DISPONIVEL' }] }, 0],
    ['sem expiracao', { PageData: [{ id: '1', situacao: 'DISPONIVEL' }] }, undefined],
    ['com JSON invalido', 'invalid-json', 3600],
  ])('deve renovar cache %s', async (_description, response, ttl) => {
    mockGetData.mockResolvedValue({
      data: [
        {
          content: typeof response === 'string' ? response : JSON.stringify(response),
          ...(ttl !== undefined && { Expiration: Math.floor(Date.now() / 1000) + ttl }),
        },
      ],
    });
    const freshResponse = { PageData: [{ id: '1', situacao: 'EMPRESTADO' }] };
    const useCase = registradores.get.find(
      (route: Record<string, unknown>) => Object.keys(route)[0] === '^\/v1\/livros$'
    )['^\/v1\/livros$'];
    jest.spyOn(useCase, 'execute').mockResolvedValue(freshResponse);
    mockSaveData.mockResolvedValue({});

    const result = await handler(createEvent('/v1/livros', 'GET'), mockContext);

    expect(result.headers?.['X-Cache']).toBeUndefined();
    expect(JSON.parse(result.body)).toEqual(freshResponse);
    expect(mockSaveData).toHaveBeenCalledWith(
      'test-cache',
      expect.objectContaining({ content: JSON.stringify(freshResponse) })
    );
  });

  it('deve rejeitar cache legado tambem na consulta de um livro', async () => {
    mockGetData.mockResolvedValue({
      data: [
        {
          content: JSON.stringify({ PageData: [{ id: 'abc', status: 'EMPRESTADO' }] }),
          Expiration: Math.floor(Date.now() / 1000) + 3600,
        },
      ],
    });
    const freshResponse = { PageData: [{ id: 'abc', situacao: 'EMPRESTADO' }] };
    const route = registradores.get.find((route: Record<string, unknown>) =>
      Object.keys(route)[0].startsWith('^/v1/livro/')
    );
    const useCase = route[Object.keys(route)[0]];
    jest.spyOn(useCase, 'execute').mockResolvedValue(freshResponse);
    mockSaveData.mockResolvedValue({});

    const result = await handler(createEvent('/v1/livro/abc', 'GET'), mockContext);

    expect(JSON.parse(result.body)).toEqual(freshResponse);
    expect(result.headers?.['X-Cache']).toBeUndefined();
  });

  it('deve usar registrador de path exato quando disponível', async () => {
    mockGetData.mockResolvedValue({ data: [] });
    mockGetAll.mockResolvedValue({
      data: [{ id: 'exato', titulo: 'Livro Exato', isbn: '123456789X' }],
      currentPage: 1,
      totalPages: 1,
      totalDocuments: 1,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 1,
    });
    mockSaveData.mockResolvedValue({});

    const exactUseCase = {
      execute: jest.fn().mockResolvedValue({
        PageData: [{ id: 'exato', titulo: 'Livro Exato', isbn: '123456789X' }],
      }),
    };
    registradores.get.push({ '/v1/teste-exato': exactUseCase });

    const result = await handler(createEvent('/v1/teste-exato', 'GET'), mockContext);

    expect(result.statusCode).toBe(200);
    expect(exactUseCase.execute).toHaveBeenCalled();
    expect(JSON.parse(result.body).PageData[0]).toEqual(
      expect.objectContaining({ id: 'exato', titulo: 'Livro Exato' })
    );
  });

  it('deve retornar 500 se o caso de uso lançar erro', async () => {
    mockGetData.mockResolvedValue({ data: [] });

    const failingUseCase = {
      execute: jest.fn().mockRejectedValue(new Error('Caso de uso falhou')),
    };
    registradores.get.push({ '/v1/teste-erro': failingUseCase });

    const result = await handler(createEvent('/v1/teste-erro', 'GET'), mockContext);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).message).toMatch(
      /^Erro interno ao processar a requisição\. LogId:/
    );
  });

  it('deve retornar 400 se o registrador não tiver caso de uso', async () => {
    mockGetData.mockResolvedValue({ data: [] });
    registradores.get.push({ '/v1/teste-sem-caso': null });

    const result = await handler(createEvent('/v1/teste-sem-caso', 'GET'), mockContext);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).message).toContain('Missing body or use case');
  });

  it('deve continuar sem falhar se o saveData lançar erro', async () => {
    mockGetData.mockResolvedValue({ data: [] });
    mockGetAll.mockResolvedValue({
      data: [{ id: '4', titulo: 'Livro 4', isbn: '123456789X' }],
      currentPage: 1,
      totalPages: 1,
      totalDocuments: 1,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 1,
    });
    mockSaveData.mockRejectedValue(new Error('Save cache erro'));

    const result = await handler(createEvent('/v1/livros', 'GET'), mockContext);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).PageData[0]).toEqual(
      expect.objectContaining({ id: '4', titulo: 'Livro 4' })
    );
    expect(mockSaveData).toHaveBeenCalled();
  });

  it('deve prosseguir com o caso de uso se a busca no cache falhar', async () => {
    mockGetData.mockRejectedValue(new Error('Cache offline'));
    mockGetAll.mockResolvedValue({
      data: [{ id: '3', titulo: 'Livro 3', isbn: '123456789X' }],
      currentPage: 1,
      totalPages: 1,
      totalDocuments: 1,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 1,
    });
    mockSaveData.mockResolvedValue({});

    const result = await handler(createEvent('/v1/livros', 'GET'), mockContext);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.PageData[0]).toEqual(expect.objectContaining({ id: '3', titulo: 'Livro 3' }));
  });

  it('deve executar ListarLivroUseCase e salvar no cache se não houver cache', async () => {
    mockGetData.mockResolvedValue({ data: [] });
    mockGetAll.mockResolvedValue({
      data: [{ id: '1', titulo: 'Livro 1', isbn: '123456789X', situacao: 'EMPRESTADO' }],
      currentPage: 1,
      totalPages: 1,
      totalDocuments: 1,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 1,
    });
    mockSaveData.mockResolvedValue({});

    const result = await handler(createEvent('/v1/livros', 'GET'), mockContext);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.PageData[0]).toEqual(
      expect.objectContaining({ id: '1', titulo: 'Livro 1', situacao: 'EMPRESTADO' })
    );
    expect(mockSaveData).toHaveBeenCalledWith(
      'test-cache',
      expect.objectContaining({ PageId: expect.stringContaining('get-_v1_livros') })
    );
  });

  it('deve repassar queryStringParameters para o caso de uso e retornar a página correta', async () => {
    mockGetData.mockResolvedValue({ data: [] });
    mockGetAll.mockResolvedValue({
      data: [{ id: '2', titulo: 'Livro 2', isbn: '123456789X' }],
      currentPage: 2,
      totalPages: 2,
      totalDocuments: 1,
      hasNextPage: false,
      hasPrevPage: true,
      limit: 1,
    });
    mockSaveData.mockResolvedValue({});

    const result = await handler(
      createEvent('/v1/livros', 'GET', { page: '2', limit: '1' }),
      mockContext
    );

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.Page).toBe(2);
    expect(body.PageData[0].titulo).toBe('Livro 2');
    expect(mockSaveData).toHaveBeenCalledWith(
      'test-cache',
      expect.objectContaining({ PageId: expect.stringContaining('page') })
    );
  });

  it('deve retornar 204 No Content se não houver livros', async () => {
    mockGetData.mockResolvedValue({ data: [] });
    mockGetAll.mockResolvedValue({
      data: [],
      currentPage: 1,
      totalPages: 0,
      totalDocuments: 0,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 0,
    });
    mockSaveData.mockResolvedValue({});

    const result = await handler(createEvent('/v1/livros', 'GET'), mockContext);

    expect(result.statusCode).toBe(204);
  });

  it('deve usar o fallback do cache quando as variáveis de ambiente estiverem ausentes', async () => {
    delete process.env.TB_CACHE;
    delete process.env.TB_CACHE_HASH_KEY;
    mockGetData.mockResolvedValue({ data: [] });
    mockGetAll.mockResolvedValue({
      data: [{ id: 'fallback', titulo: 'Livro Fallback', isbn: '123456789X' }],
      currentPage: 1,
      totalPages: 1,
      totalDocuments: 1,
      hasNextPage: false,
      hasPrevPage: false,
      limit: 1,
    });
    mockSaveData.mockResolvedValue({});

    const result = await handler(createEvent('/v1/livros', 'GET'), mockContext);

    expect(result.statusCode).toBe(200);
    expect(mockSaveData).toHaveBeenCalledWith(
      '',
      expect.objectContaining({ PageId: expect.stringContaining('get-_v1_livros') })
    );
  });

  it('deve usar o repositório MongoDB quando DYNAMODB_REPOSITORY for false', async () => {
    jest.resetModules();
    const mongoGetInstance = jest.fn(() => ({ getAll: mockGetAll }));

    jest.doMock('@gustavoadolfo/minhoteca-adapter-layer', () => ({
      __esModule: true,
      DynamoDBRepository: jest.fn(),
      MongoDBRepository: Object.assign(jest.fn(), { getInstance: mongoGetInstance }),
    }));

    process.env.DYNAMODB_REPOSITORY = 'false';

    const { registradores } = require('../src/registradores');

    expect(mongoGetInstance).toHaveBeenCalled();
    expect(Array.isArray(registradores.get)).toBe(true);
    expect(registradores.get.some((route) => Object.keys(route)[0].includes('/v1/livros'))).toBe(
      true
    );
  });

  it('deve retornar 500 se o caminho não for encontrado nos registradores', async () => {
    mockGetData.mockResolvedValue({ data: [] });

    const result = await handler(createEvent('/v1/rota-inexistente', 'GET'), mockContext);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).message).toContain('Erro interno');
  });
});
