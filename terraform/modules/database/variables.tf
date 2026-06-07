variable "ddb_acervo_cache" {
  type        = string
  default     = "minhoteca-acervo-cache"
  description = "Nome da tabela DynamoDB para cache de acervo"
}

variable "cache_billing_type" {
  type        = string
  default     = "PAY_PER_REQUEST"
  description = "Modo de cobrança para a tabela DynamoDB (PROVISIONED ou PAY_PER_REQUEST)"
}

variable "cache_read_capacity" {
  type        = number
  default     = 5
  description = "Capacidade de leitura provisionada para a tabela DynamoDB (aplicável apenas se billing_mode for PROVISIONED)"
}

variable "cache_write_capacity" {
  type        = number
  default     = 5
  description = "Capacidade de escrita provisionada para a tabela DynamoDB (aplicável apenas se billing_mode for PROVISIONED)"
}

variable "cache_hash_key" {
  type        = string
  default     = "pageId"
  description = "Chave hash para a tabela DynamoDB"
}

variable "cache_hash_type" {
  type        = string
  default     = "S"
  description = "Tipo da chave hash para a tabela DynamoDB"
}

variable "cache_ttl" {
  type        = string
  default     = "43200"
  description = "Tempo de vida para os itens na tabela DynamoDB"
}

variable "cache_ttl_enabled" {
  type        = bool
  default     = true
  description = "Indica se o tempo de vida está habilitado para a tabela DynamoDB"
}

variable "application_tags" {
  type        = map(string)
  default     = {}
  description = "Tags adicionais para os recursos do módulo de banco de dados"
}
