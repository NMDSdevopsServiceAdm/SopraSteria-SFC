resource "aws_vpc" "sfc_vpc" {
  cidr_block       = "${var.vpc_cidr}"
  instance_tenancy = "default"

  tags = {
    Name = "sfc-vpc"
  }
}

resource "aws_subnet" "public_subnets" {
  count = 3
  vpc_id                  = "${aws_vpc.sfc_vpc.id}"
  cidr_block             = var.public_subnet[count.index]
  availability_zone = var.availability_zone[count.index]
  map_public_ip_on_launch = true
tags = {
  Name = "public-${var.availability_zone[count.index]}"
}
}

resource "aws_route_table" "rt" {
  vpc_id = aws_vpc.sfc_vpc.id
route {
      cidr_block = "0.0.0.0/0"
      gateway_id = aws_internet_gateway.internet_gateway.id
  }
tags = {
      Name = "public-route-table"
  }
}
resource "aws_route_table_association" "rt_associate_public" {
  count = 3
  subnet_id = aws_subnet.public_subnets[count.index].id
  route_table_id = aws_route_table.rt.id
}

resource "aws_subnet" "private_subnets" {
  count = 3
  vpc_id                  = "${aws_vpc.sfc_vpc.id}"
  cidr_block             = var.private_subnet[count.index]
  availability_zone = var.availability_zone[count.index]
tags = {
  Name = "private-${var.availability_zone[count.index]}"
}
}

resource "aws_route_table" "rt_private" {
  vpc_id = aws_vpc.sfc_vpc.id
route {
      cidr_block = "0.0.0.0/0"
      nat_gateway_id = aws_nat_gateway.nat_gateway.id
  }
tags = {
      Name = "private-route-table"
  }
}
resource "aws_route_table_association" "rt_associate_private" {
  count = 3
  subnet_id = aws_subnet.private_subnets[count.index].id
  route_table_id = aws_route_table.rt_private.id
}
