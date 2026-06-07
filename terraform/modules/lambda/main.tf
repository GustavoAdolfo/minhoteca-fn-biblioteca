resource "aws_lambda_function" "acervoFunction" {
  function_name                  = "minhoteca-acervo"
  description                    = "Função de consulta do acervo da Biblioteca"
  role                           = aws_iam_role.role_acervoFunction.arn
  handler                        = "index.handler"
  runtime                        = var.node_runtime
  architectures                  = var.compatible_architectures
  timeout                        = var.lambda_geral_timeout
  memory_size                    = var.lambda_geral_memory
  reserved_concurrent_executions = var.lambda_geral_reserved_concurrent_executions
  publish                        = false
  kms_key_arn                    = aws_kms_key.kms_lambdas.arn
  filename                       = data.archive_file.acervoFunction_file.output_path
  source_code_hash               = data.archive_file.acervoFunction_file.output_base64sha256
  layers = [
    var.coreLayer_arn,
    var.adapterLayer_arn,
    var.casosDeUsoLayer_arn
  ]
  dead_letter_config {
    target_arn = aws_sqs_queue.acervoFunctionDL.arn
  }
  environment {
    variables = {
      VERSION             = data.external.acervoFunction_version.result.version
      DYNAMODB_REPOSITORY = tostring(var.dynamodb_repository)
      TB_CACHE            = var.cache_table_name
      TB_LIVROS           = var.livros_table_name
      TB_AUTOES           = var.autores_table_name
      TB_PAISES           = var.paises_table_name
      TB_EDITORAS         = var.editoras_table_name
      DEBUG               = var.debug
      ENVIRONMENT         = var.environment
      # Requerido quando DYNAMODB_REPOSITORY for "false".
      MONGODB_USERNAME = var.mongodb_username
      MONGODB_PASSWORD = var.mongodb_password
      MONGODB_DATABASE = var.mongodb_database
      MONGODB_CLUSTER  = var.mongodb_cluster
      MONGODB_APPNAME  = var.mongodb_appname
    }
  }
  tracing_config {
    #tfsec:ignore:aws-lambda-enable-tracing
    mode = "PassThrough"
  }
  tags = merge(var.application_tags, { Contexto = "Acervo" })
}

resource "aws_sqs_queue" "acervoFunctionDL" {
  name = "minhoteca-acervo-dl"
  tags = merge(var.application_tags, { Contexto = "Acervo" })
}


data "external" "acervoFunction_version" {
  program = ["node", "${path.module}/../../version.mjs"]
}

resource "null_resource" "acervoFunction_build" {
  triggers = {
    src_hash = sha256(join("", [for f in sort(fileset("${path.module}/../../src", "**/*")) : filesha256("${path.module}/../../minhoteca-functions/acervoes-function/${f}")]))
  }
  provisioner "local-exec" {
    command = "cd ${path.module}/../.. && npm install && npm run build"
  }
}

data "archive_file" "acervoFunction_file" {
  depends_on  = [null_resource.acervoFunction_build]
  type        = "zip"
  source_dir  = "${path.module}/../../dist/"
  output_path = "${path.module}/acervoesFunction.zip"
}

