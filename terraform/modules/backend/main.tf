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
  db_subnet_group_name = aws_db_subnet_group.sfc_rds_db_subnet_group.name
}

resource "aws_db_subnet_group" "sfc_rds_db_subnet_group" {
  name       = "sfc-vpc"
  subnet_ids = var.private_subnet_ids
}

resource "random_password" "sfc_rds_password" {
  length           = 20
  special          = false
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

resource "aws_elasticache_subnet_group" "sfc_redis_elasticache_subnet_group" {
  name       = "sfc-vpc"
  subnet_ids = var.private_subnet_ids
}

resource "aws_elasticache_replication_group" "sfc_redis_replication_group" {
  replication_group_id        = "sfc-redis"
  description                 = "sfc-redis"
  node_type                   = "cache.t4g.micro"
  num_cache_clusters          = 1
  parameter_group_name        = "default.redis7"
  port                        = 6379
  subnet_group_name  = aws_elasticache_subnet_group.sfc_redis_elasticache_subnet_group.name

  lifecycle {
    ignore_changes = [num_cache_clusters]
  }
}

resource "aws_elasticache_cluster" "sfc_redis_replica" {
  count = 1
  cluster_id           = "sfc-redis-${var.environment}-${count.index}"
  replication_group_id = aws_elasticache_replication_group.sfc_redis_replication_group.id
}

resource "aws_ssm_parameter" "redis_endpoint" {
  name        = "/${var.environment}/redis/endpoint"
  description = "The endpoint for Elasticache"
  type        = "String"
  value       = "redis://${aws_elasticache_replication_group.sfc_redis_replication_group.primary_endpoint_address}:6379"
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

 resource "aws_apprunner_service" "sfc_app_runner" {
  service_name = "sfc-app-runner-${var.environment}"



  instance_configuration {
    cpu               = var.app_runner_cpu
    memory            = var.app_runner_memory
    instance_role_arn = aws_iam_role.app_runner_instance_role.arn
  }

    network_configuration {
    egress_configuration {
      egress_type       = "VPC"
      vpc_connector_arn = aws_apprunner_vpc_connector.sfc_app_runner_vpc_connector.arn
    }
  }
  source_configuration {
    authentication_configuration {
      access_role_arn = aws_iam_role.app_runner_erc_access_role.arn
    }
    image_repository {
      image_identifier      = "${aws_ecr_repository.sfc_backend_ecr_repository.repository_url}:latest"
      image_repository_type = "ECR"
      image_configuration {
        port = 3000
        runtime_environment_secrets = {
          DB_PASS        = aws_ssm_parameter.database_password.arn
          DB_PORT        = aws_ssm_parameter.database_port.arn
          DB_USER        = aws_ssm_parameter.database_username.arn
          DB_NAME        = aws_ssm_parameter.database_name.arn
          DB_HOST        = aws_ssm_parameter.database_host.arn
          REDIS_ENDPOINT = aws_ssm_parameter.redis_endpoint.arn
        }
      }
    }
    auto_deployments_enabled = false
  }
}

resource "aws_apprunner_vpc_connector" "sfc_app_runner_vpc_connector" {
  vpc_connector_name = "sfc-app-runner-vpc-connector"
  subnets            = var.private_subnet_ids
  security_groups    = var.security_group_ids
}
