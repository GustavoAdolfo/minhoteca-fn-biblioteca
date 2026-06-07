resource "aws_iam_role" "role_acervoFunction" {
  name               = "minhoteca-acervoFunction"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
  tags               = merge(var.application_tags, { Contexto = "Acervo" })
}

resource "aws_iam_policy" "invoke_acervoFunction" {
  name        = "minhoteca-acervoFunction-invoke-policy"
  description = "IAM policy lambda acervoFunction invoke"
  policy      = data.aws_iam_policy_document.lambda_invoke.json
  tags        = merge(var.application_tags, { Contexto = "Acervo" })
}

resource "aws_iam_role_policy_attachment" "acervoFunction_role_invoke" {
  role       = aws_iam_role.role_acervoFunction.name
  policy_arn = aws_iam_policy.invoke_acervoFunction.arn
}

##### DynamoDB

resource "aws_iam_policy" "dynamodb_acervoFunction" {
  name        = "minhoteca-lambda-acervoFunction-dynamodb"
  path        = "/"
  description = "IAM policy para lambda acervoFunction DynamoDB"
  policy      = data.aws_iam_policy_document.lambda_dynamodb.json
  tags        = merge(var.application_tags, { Contexto = "Acervo" })
}

resource "aws_iam_role_policy_attachment" "acervoFunction_role_dynamodb" {
  role       = aws_iam_role.role_acervoFunction.name
  policy_arn = aws_iam_policy.dynamodb_acervoFunction.arn
}

### Logging

resource "aws_iam_policy" "log_acervoFunction" {
  name        = "minhoteca-lambda-acervoFunction-logging"
  path        = "/"
  description = "IAM policy para lambda acervoFunction logging"
  policy      = data.aws_iam_policy_document.lambda_logging.json
  tags        = merge(var.application_tags, { Contexto = "Acervo" })
}

resource "aws_iam_role_policy_attachment" "acervoFunction_role_logs" {
  role       = aws_iam_role.role_acervoFunction.name
  policy_arn = aws_iam_policy.log_acervoFunction.arn
}

resource "aws_cloudwatch_log_group" "log_acervoFunction" {
  name              = "/aws/lambda/minhoteca-acervoFunction"
  retention_in_days = var.lambda_geral_log_retention
  tags              = merge(var.application_tags, { Contexto = "Acervo" })
}

### mensageria

resource "aws_iam_policy" "lbd_mensageria_policy_acervoFunction" {
  name        = "minhoteca-acervo-mensageria-policy"
  description = "IAM policy mensageria lambda Library Service"
  policy      = data.aws_iam_policy_document.lambda_sqs.json
  tags        = merge(var.application_tags, { Contexto = "Acervo" })
}

resource "aws_iam_role_policy_attachment" "lbd_mensageria_role_acervoFunction" {
  role       = aws_iam_role.role_acervoFunction.name
  policy_arn = aws_iam_policy.lbd_mensageria_policy_acervoFunction.arn
}
