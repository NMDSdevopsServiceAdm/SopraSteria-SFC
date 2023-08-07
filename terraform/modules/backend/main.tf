resource "aws_ecr_repository" "sfc_backend_ecr_repository" {
  name = "ecr-sfc-backend-${var.environment}"
}

resource "aws_db_instance" "sfc_rds_db" {
  identifier          = "sfc-db-${var.environment}"
  instance_class      = "db.t3.micro"
  allocated_storage   = 20
  engine              = "postgres"
  engine_version      = "14.7"
  db_name             = "sfctest"
  username            = "administrator" # TODO: We may want this as a random string
  password            = random_password.sfc_rds_password.result
  skip_final_snapshot = true
}

resource "random_password" "sfc_rds_password" {
  length           = 20
  special          = true
  override_special = "/@\"'"
}

resource "aws_ssm_parameter" "database_password" {
  name        = "/${var.environment}/database/password"
  description = "The password for the database"
  type        = "SecureString"
  value       = aws_db_instance.sfc_rds_db.password
}

resource "aws_ssm_parameter" "database_port" {
  name        = "/${var.environment}/database/port"
  description = "The port for the database"
  type        = "String"
  value       = aws_db_instance.sfc_rds_db.port
}

resource "aws_ssm_parameter" "database_username" {
  name        = "/${var.environment}/database/user"
  description = "The username for the database"
  type        = "String"
  value       = aws_db_instance.sfc_rds_db.username
}

resource "aws_ssm_parameter" "database_name" {
  name        = "/${var.environment}/database/name"
  description = "The name of the database"
  type        = "String"
  value       = aws_db_instance.sfc_rds_db.db_name
}
resource "aws_ssm_parameter" "database_host" {
  name        = "/${var.environment}/database/host"
  description = "The database host connection string"
  type        = "String"
  value       = aws_db_instance.sfc_rds_db.address
}

resource "aws_elasticache_cluster" "sfc_redis" {
  cluster_id           = "sfc-redis-${var.environment}"
  engine               = "redis"
  node_type            = "cache.t4g.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
}

resource "aws_ssm_parameter" "redis_endpoint" {
  name        = "/${var.environment}/redis/endpoint"
  description = "The endpoint for Elasticache"
  type        = "String"
  value       = "redis://THISNEEDSUPDATING:6379" #TODO: Find a way to populate this from Teraform
}

resource "aws_iam_role" "app_runner_instance_role" {
  name = "SFCAppRunnerInstanceRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "tasks.apprunner.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "app_runner_instance_role_policy_attachment" {
  role       = aws_iam_role.app_runner_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess"
}

resource "aws_iam_role" "app_runner_erc_access_role" {
  name = "SFCAppRunnerECRAccessRole"

  assume_role_policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Effect" : "Allow",
        "Principal" : {
          "Service" : "build.apprunner.amazonaws.com"
        },
        "Action" : "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "app_runner_erc_access_role_policy_attachment" {
  role       = aws_iam_role.app_runner_erc_access_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

# resource "aws_apprunner_service" "sfc_app_runner" {
#   service_name = "sfc-app-runner-${var.environment}"



#   instance_configuration {
#     cpu               = var.app_runner_cpu
#     memory            = var.app_runner_memory
#     instance_role_arn = aws_iam_role.app_runner_instance_role.arn
#   }
#   source_configuration {
#     authentication_configuration {
#       access_role_arn = aws_iam_role.app_runner_erc_access_role.arn
#     }
#     image_repository {
#       image_identifier      = "${aws_ecr_repository.sfc_backend_ecr_repository.repository_url}:latest"
#       image_repository_type = "ECR"
#       image_configuration {
#         port = 3000
#         runtime_environment_secrets = {
#           DB_PASS        = aws_ssm_parameter.database_password.arn
#           DB_PORT        = aws_ssm_parameter.database_port.arn
#           DB_USER        = aws_ssm_parameter.database_username.arn
#           DB_NAME        = aws_ssm_parameter.database_name.arn
#           DB_HOST        = aws_ssm_parameter.database_host.arn
#           REDIS_ENDPOINT = aws_ssm_parameter.redis_endpoint.arn
#         }
#       }
#     }
#     auto_deployments_enabled = false
#   }
# }
