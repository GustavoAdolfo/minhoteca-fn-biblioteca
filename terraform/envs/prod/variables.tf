variable "appregistry_id" {
  type        = string
  description = "ID da aplicação no Service Catalog App Registry"
}

variable "mongodb_username" {
  type      = string
  sensitive = true
}
variable "mongodb_password" {
  type      = string
  sensitive = true
}
variable "mongodb_database" {
  type = string
}
variable "mongodb_cluster" {
  type = string
}
variable "mongodb_appname" {
  type = string
}
variable "environment" {
  type    = string
  default = "cloud"
}

variable "tb_livros" {
  type    = string
  default = "livros"
}
variable "tb_autores" {
  type    = string
  default = "autores"
}
variable "tb_emprestimos" {
  type    = string
  default = "emprestimos"
}
variable "tb_usuarios" {
  type    = string
  default = "usuarios"
}
