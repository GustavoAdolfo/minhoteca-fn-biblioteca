import type { RepositoryInterface, ResultType } from '@gustavoadolfo/minhoteca-adapter-layer';
import {
  UseCaseInterface,
  LogService,
  PageDataType,
  Emprestimo,
} from '@gustavoadolfo/minhoteca-core-layer';

export class Estatisticas implements UseCaseInterface {
  private logService: LogService;
  tbLivros: string;
  tbAutores: string;
  tbEmprestimos: string;
  tbUsuarios: string;

  constructor(private repository: RepositoryInterface) {
    this.repository = repository;
    this.logService = new LogService('Estatisticas');
    this.tbLivros = process.env.TB_LIVROS ?? 'Livros';
    this.tbAutores = process.env.TB_AUTORES ?? 'Autores';
    this.tbEmprestimos = process.env.TB_EMPRESTIMOS ?? 'Emprestimos';
    this.tbUsuarios = process.env.TB_USUARIOS ?? 'Usuarios';
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async execute(): Promise<PageDataType> {
    const totalLivros = await this.obterTotalLivros();
    const totalAutores = await this.obterTotalAutores();
    const totalLivrosEmprestados = await this.obterTotalLivrosEmprestados();
    const totalLeitores = await this.obterTotalLeitores();
    const totalEmprestimos = await this.obterTotalEmprestimos();
    const perdasLivros = await this.obterPerdasLivros();

    const result: PageDataType = {
      Items: 1,
      TotalItems: 1,
      TotalPage: 1,
      Page: 1,
      Code: 200,
      PageData: {
        totalLivros: totalLivros,
        totalAutores: totalAutores,
        totalLivrosEmprestados: totalLivrosEmprestados,
        totalLeitores: totalLeitores,
        totalEmprestimos: totalEmprestimos,
        perdasLivros: perdasLivros,
      },
    };
    return result;
  }

  async obterTotalLivros(): Promise<number> {
    const result: ResultType = await this.repository.getCountFromTable(this.tbLivros);
    const totalLivros = result?.data?.count ?? -1;
    return totalLivros;
  }

  async obterTotalAutores(): Promise<number> {
    const result: ResultType = await this.repository.getCountFromTable(this.tbAutores);
    const totalAutores = result?.data?.count ?? -1;
    return totalAutores;
  }

  async obterTotalLivrosEmprestados(): Promise<number> {
    const result: ResultType = await this.repository.getAll(this.tbEmprestimos, {});
    const emprestimos = (result?.data ?? []) as Emprestimo[];
    const totalLivrosEmprestados = emprestimos.reduce(
      (acc: Set<string>, emprestimo: Emprestimo) => {
        if (emprestimo.livroId) {
          acc.add(emprestimo.livroId);
        }
        return acc;
      },
      new Set<string>()
    ).size; // retorna a quantidade de livros distintos
    return totalLivrosEmprestados;
  }

  async obterTotalLeitores(): Promise<number> {
    const result: ResultType = await this.repository.getCountFromTable(this.tbUsuarios);
    const totalLeitores = result?.data?.count ?? -1;
    return totalLeitores;
  }

  async obterTotalEmprestimos(): Promise<number> {
    const result: ResultType = await this.repository.getCountFromTable(this.tbEmprestimos);
    const totalEmprestimos = result?.data?.count ?? -1;
    return totalEmprestimos;
  }

  async obterPerdasLivros(): Promise<number> {
    const result: ResultType = await this.repository.getAll(this.tbLivros, {
      filterKey: 'extravio',
      filterValue: 'S',
    });
    const perdasLivros = result?.totalDocuments ?? -1;
    return perdasLivros;
  }
}
