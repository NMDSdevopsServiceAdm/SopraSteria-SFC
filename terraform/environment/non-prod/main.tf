provider "aws" {
  region = "eu-west-1"
}

module "frontend" {
  source = "../../modules/frontend"

  environment = var.environment
}

module "backend" {
  source = "../../modules/backend"

  environment = var.environment
}

# # TODO: We need to enable this to save state soon
# # terraform {
# #   backend "s3" {
# #     key = "medium-terraform/prod/terraform.tfstate"
# #     # ...
# #   }
# # }

