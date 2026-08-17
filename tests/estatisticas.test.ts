import { Estatisticas } from '../src/relatorios';

describe('Estatisticas', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.restoreAllMocks();
    process.env = { ...originalEnv };
    delete process.env.TB_LIVROS;
    delete process.env.TB_AUTORES;
    delete process.env.TB_EMPRESTIMOS;
    delete process.env.TB_USUARIOS;
  });

  afterAll(() => {
    process.env = { ...originalEnv };
  });

  it('deve usar os nomes padrão das tabelas quando as variáveis de ambiente não existem', () => {
    const repository = {
      getCountFromTable: jest.fn(),
      getAll: jest.fn(),
    };

    const estatisticas = new Estatisticas(repository as any);

    expect(estatisticas.tbLivros).toBe('Livros');
    expect(estatisticas.tbAutores).toBe('Autores');
    expect(estatisticas.tbEmprestimos).toBe('Emprestimos');
    expect(estatisticas.tbUsuarios).toBe('Usuarios');
  });

  it('deve calcular o resumo geral de estatísticas com os dados do repositório', async () => {
    process.env.TB_LIVROS = 'TabelaLivros';
    process.env.TB_AUTORES = 'TabelaAutores';
    process.env.TB_EMPRESTIMOS = 'TabelaEmprestimos';
    process.env.TB_USUARIOS = 'TabelaUsuarios';

    const repository = {
      getCountFromTable: jest
        .fn()
        .mockResolvedValueOnce({ data: { count: 12 } })
        .mockResolvedValueOnce({ data: { count: 4 } })
        .mockResolvedValueOnce({ data: { count: 7 } })
        .mockResolvedValueOnce({ data: { count: 7 } }),
      getAll: jest
        .fn()
        .mockResolvedValueOnce({
          data: [
            { livroId: 'livro-1' },
            { livroId: 'livro-2' },
            { livroId: 'livro-1' },
            { livroId: undefined },
            { livroId: 'livro-3' },
          ],
        })
        .mockResolvedValueOnce({
          data: [{ extravio: 'S' }, { extravio: 'N' }, { extravio: 'S' }],
          totalDocuments: 2,
        }),
    };

    const estatisticas = new Estatisticas(repository as any);
    const result = await estatisticas.execute();

    expect(repository.getCountFromTable).toHaveBeenCalledWith('TabelaLivros');
    expect(repository.getCountFromTable).toHaveBeenCalledWith('TabelaAutores');
    expect(repository.getCountFromTable).toHaveBeenCalledWith('TabelaEmprestimos');
    expect(repository.getCountFromTable).toHaveBeenCalledWith('TabelaUsuarios');
    expect(repository.getAll).toHaveBeenCalledWith('TabelaEmprestimos', {});
    expect(repository.getAll).toHaveBeenCalledWith('TabelaLivros', {
      filterKey: 'extravio',
      filterValue: 'S',
    });
    expect(result.PageData).toEqual({
      totalLivros: 12,
      totalAutores: 4,
      totalLivrosEmprestados: 3,
      totalLeitores: 7,
      totalEmprestimos: 7,
      perdasLivros: 2,
    });
  });

  it('deve retornar -1 quando os contadores não vierem preenchidos', async () => {
    const repository = {
      getCountFromTable: jest.fn().mockResolvedValue({ data: [] }),
      getAll: jest.fn().mockResolvedValue({ data: [] }),
    };

    const estatisticas = new Estatisticas(repository as any);

    await expect(estatisticas.obterTotalLivros()).resolves.toBe(-1);
    await expect(estatisticas.obterTotalAutores()).resolves.toBe(-1);
    await expect(estatisticas.obterTotalLeitores()).resolves.toBe(-1);
    await expect(estatisticas.obterTotalEmprestimos()).resolves.toBe(-1);
    await expect(estatisticas.obterPerdasLivros()).resolves.toBe(-1);
  });

  it('deve contar livros distintos em empréstimo e ignorar itens sem livroId', async () => {
    const repository = {
      getCountFromTable: jest.fn(),
      getAll: jest.fn().mockResolvedValue({
        data: [
          { livroId: 'livro-1' },
          { livroId: 'livro-2' },
          { livroId: 'livro-1' },
          { semLivroId: 'livro-9' },
          { livroId: '' },
        ],
      }),
    };

    const estatisticas = new Estatisticas(repository as any);

    await expect(estatisticas.obterTotalLivrosEmprestados()).resolves.toBe(2);
  });
});
