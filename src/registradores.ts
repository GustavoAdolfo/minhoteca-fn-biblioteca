import { DynamoDBRepository, MongoDBRepository } from '@gustavoadolfo/minhoteca-adapter-layer';
import {
  ListarLivroUseCase,
  ObterLivroUseCase,
  ListarAutorUseCase,
  ObterAutorUseCase,
} from '@gustavoadolfo/minhoteca-casos-de-uso-layer';

const repository =
  process.env.DYNAMODB_REPOSITORY && process.env.DYNAMODB_REPOSITORY === 'true'
    ? new DynamoDBRepository()
    : MongoDBRepository.getInstance();

export const registradores = {
  get: [
    { '^\/v1\/livros$': new ListarLivroUseCase(repository) },
    { '^\/v1\/livro\/[A-Fa-f0-9\-]+$': new ObterLivroUseCase(repository) },
    { '^\/v1\/autores$': new ListarAutorUseCase(repository) },
    { '^\/v1\/autor\/[A-Fa-f0-9\-]+$': new ObterAutorUseCase(repository) },
  ],
};
