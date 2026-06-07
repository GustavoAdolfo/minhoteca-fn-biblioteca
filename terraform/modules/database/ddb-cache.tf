resource "aws_dynamodb_table" "ddb_acervo_cache" {
  name         = var.ddb_acervo_cache
  billing_mode = var.cache_billing_type
  # read_capacity  = var.cache_read_capacity
  # write_capacity = var.cache_write_capacity
  hash_key = var.cache_hash_key
  attribute {
    name = var.cache_hash_key
    type = var.cache_hash_type
  }
  ttl {
    attribute_name = var.cache_ttl
    enabled        = var.cache_ttl_enabled
  }
  tags = merge(var.application_tags, { Contexto = "Acervo" })
}

