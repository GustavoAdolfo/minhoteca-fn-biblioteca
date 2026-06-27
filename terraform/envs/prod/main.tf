terraform {
  required_version = "~> 1"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5"
    }
  }
}

provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      Terraform = true
      Projeto   = "Minhoteca"
    }
  }
}

module "database" {
  source               = "../../modules/database"
  application_tags     = data.aws_servicecatalogappregistry_application.minhoteca_application.application_tag
  ddb_acervo_cache     = "minhoteca-acervo-cache"
  cache_billing_type   = "PAY_PER_REQUEST"
  cache_read_capacity  = 5
  cache_write_capacity = 5
  cache_hash_key       = "PageId"
  cache_hash_type      = "S"
  cache_ttl            = "43200"
  cache_ttl_enabled    = true
}

module "lambda" {
  source                        = "../../modules/lambda"
  account_id                    = local.account_id
  region_name                   = local.region
  application_tags              = data.aws_servicecatalogappregistry_application.minhoteca_application.application_tag
  cache_table_name              = module.database.ddb_acervo_cache_name
  cache_hash_key_attribute_name = module.database.cache_hash_key_attribute_name
  mongodb_username              = var.mongodb_username
  mongodb_password              = var.mongodb_password
  mongodb_database              = var.mongodb_database
  mongodb_cluster               = var.mongodb_cluster
  mongodb_appname               = var.mongodb_appname
  adapterLayer_arn              = local.adapterLayer_arn
  coreLayer_arn                 = local.coreLayer_arn
  casosDeUsoLayer_arn           = local.casosDeUsoLayer_arn
  environment                   = var.environment
}
