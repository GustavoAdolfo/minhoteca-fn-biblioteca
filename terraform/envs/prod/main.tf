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
  source           = "../../modules/database"
  application_tags = data.aws_servicecatalogappregistry_application.minhoteca_application.application_tag
}

# module "lambda" {
#   source = "../../modules/lambda"
# }
