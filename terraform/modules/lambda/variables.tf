variable "node_runtime" {
  type    = string
  default = "nodejs22.x"
}

variable "compatible_architectures" {
  type    = list(string)
  default = ["x86_64"]
}

variable "lambda_geral_timeout" {
  type    = number
  default = 600
}

variable "lambda_geral_memory" {
  type    = number
  default = 256
}

variable "lambda_geral_reserved_concurrent_executions" {
  type    = number
  default = 5
}

variable "lambda_geral_log_retention" {
  type    = number
  default = 7
}

variable "coreLayer_arn" {
  type = string
}

variable "adapterLayer_arn" {
  type = string
}

variable "casosDeUsoLayer_arn" {
  type = string
}

variable "dynamodb_repository" {
  type    = bool
  default = false
}

variable "livros_table_name" {
  type    = string
  default = "Livros"
}

variable "autores_table_name" {
  type    = string
  default = "Autores"
}

variable "editoras_table_name" {
  type    = string
  default = "Editoras"
}

variable "paises_table_name" {
  type    = string
  default = "Paises"
}

variable "cache_table_name" {
  type = string
}

variable "cache_hash_key_attribute_name" {
  type = string
}

variable "debug" {
  type    = bool
  default = true
}

variable "mongodb_username" {
  type      = string
  default   = ""
  sensitive = true
}

variable "mongodb_password" {
  type      = string
  default   = ""
  sensitive = true
}

variable "mongodb_database" {
  type    = string
  default = ""
}

variable "mongodb_cluster" {
  type    = string
  default = ""
}

variable "mongodb_appname" {
  type    = string
  default = "minhoteca-admin"
}

variable "application_tags" {
  type        = map(string)
  default     = {}
  description = "Tags adicionais para os recursos do módulo de lambda"
}

variable "region_name" {
  type    = string
  default = "us-east-1"
}

variable "account_id" {
  type = string
}

variable "environment" {
  type = string
}
