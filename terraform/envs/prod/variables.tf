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
