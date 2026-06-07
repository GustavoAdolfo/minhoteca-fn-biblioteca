output "ddb_acervo_cache_arn" {
  value       = aws_dynamodb_table.ddb_acervo_cache.arn
  description = "ARN da tabela DynamoDB para cache de acervo"
}

output "ddb_acervo_cache_id" {
  value       = aws_dynamodb_table.ddb_acervo_cache.id
  description = "ID da tabela DynamoDB para cache de acervo"
}

output "ddb_acervo_cache_name" {
  value       = aws_dynamodb_table.ddb_acervo_cache.name
  description = "Nome da tabela DynamoDB para cache de acervo"
}
