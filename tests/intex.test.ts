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
  MongoDBRepository: {
    getInstance: jest.fn(() => ({ getAll: mockGetAll })),
  },
  ResultType: {},
}));

process.env.DYNAMODB_REPOSITORY = 'true';
process.env.TABELA_LIVROS = 'Livros';
process.env.TB_BIBLIOTECA_CACHE = 'test-cache';

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
    mockGetData.mockResolvedValue({
      data: [{ content: JSON.stringify({ PageData: 'cached-data' }) }],
    });

    const result = await handler(createEvent('/v1/livros', 'GET'), mockContext);

    expect(result.statusCode).toBe(200);
    expect(result.headers?.['X-Cache']).toBe('HIT');
    expect(JSON.parse(result.body)).toEqual({ PageData: 'cached-data' });
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
      data: [{ id: '1', titulo: 'Livro 1', isbn: '123456789X' }],
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
    expect(body.PageData[0]).toEqual(expect.objectContaining({ id: '1', titulo: 'Livro 1' }));
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

  it('deve retornar 500 se o caminho não for encontrado nos registradores', async () => {
    mockGetData.mockResolvedValue({ data: [] });

    const result = await handler(createEvent('/v1/rota-inexistente', 'GET'), mockContext);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).message).toContain('Erro interno');
  });
});
