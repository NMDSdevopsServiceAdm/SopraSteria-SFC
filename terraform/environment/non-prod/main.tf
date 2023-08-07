provider "aws" {
  region = "eu-west-1"
}
terraform {
  backend "s3" {
    bucket = "terraform-state-sfc"
    key    = "state/terraform.tfstate"
    region = "eu-west-1"
  }
}
module "frontend" {
  source = "../../modules/frontend"

  environment = var.environment
}

module "backend" {
  source = "../../modules/backend"

  environment = var.environment
  app_runner_cpu = var.app_runner_cpu
  app_runner_memory = var.app_runner_memory

}

module "pipeline" {
  source = "../../modules/pipeline"

  environment = var.environment
}


