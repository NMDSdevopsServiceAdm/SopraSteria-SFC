variable "environment" {
  description = "Name of environment we're deploying to"
  type        = string
}

variable "app_runner_cpu" {
  description = "The CPU size you wish to use on AWS App Runner"
  type        = number
}

variable "app_runner_memory" {
  description = "The memory size you wish to use on AWS App Runner"
  type        = number
}

variable "private_subnet_ids" {
  description = "The ID's of the private subnet used by the App Runner VPC connector"
}

variable "security_group_ids" {
  description = "The ID's of the security groups used by the App Runner VPC connector"
}
