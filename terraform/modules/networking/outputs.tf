output "private_subnets" {
  value = aws_subnet.private_subnets[*].id
}

output "security_group_id" {
  value = [aws_security_group.security_group.id]
}
