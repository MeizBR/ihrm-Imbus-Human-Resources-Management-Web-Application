provider "aws" {
    region = "eu-north-1"
}

variable ihrm_vpc_cidr_block {}
variable ihrm_subnet_cidr_block {}
variable ihrm_subnet_avail_zone {}
variable ihrm_env_prefix {}
variable ip_addresses_range {}
variable instance_type {}
variable public_key_location {}

resource "aws_vpc" "ihrm_vpc" {
    cidr_block = var.ihrm_vpc_cidr_block
    tags = {
        Name: "${var.ihrm_env_prefix}-ihrm_vpc"
    }
}

resource "aws_subnet" "ihrm_subnet" {
    vpc_id = aws_vpc.ihrm_vpc.id
    cidr_block = var.ihrm_subnet_cidr_block
    availability_zone = var.ihrm_subnet_avail_zone
    tags = {
        Name: "${var.ihrm_env_prefix}-ihrm_subnet"
    }
}

# virtual router inside vpc
resource "aws_route_table" "ihrm_route_table" {
    vpc_id = aws_vpc.ihrm_vpc.id

    route {
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.ihrm_igw.id
    }

    tags = {
        Name: "${var.ihrm_env_prefix}-ihrm_rtb"
    }
}

# virtual modem inside vpc to connect our vpc to the internet
resource "aws_internet_gateway" "ihrm_igw" {
    vpc_id = aws_vpc.ihrm_vpc.id

    tags = {
        Name: "${var.ihrm_env_prefix}-ihrm_igw"
    }
}

resource "aws_route_table_association" "ihrm_rtb_association_subnet" {
    subnet_id = aws_subnet.ihrm_subnet.id
    route_table_id = aws_route_table.ihrm_route_table.id
}

resource "aws_security_group" "ihrm_sg" {
    name = "ihrm_sg"
    vpc_id = aws_vpc.ihrm_vpc.id

    ingress {
        from_port = 22
        to_port = 22
        protocol = "tcp"
        cidr_blocks = var.ip_addresses_range
    }

    ingress {
        from_port = 80
        to_port = 80
        protocol = "tcp"
        cidr_blocks = var.ip_addresses_range
    }

    egress {
        from_port = 0
        to_port = 0
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
        prefix_list_ids = []
    }

    tags = {
        Name: "${var.ihrm_env_prefix}-ihrm_sg"
    }
}

data "aws_ami" "latest_amazon_linux_image" {
    most_recent = true
    owners = ["amazon"]
    filter {
        name = "name"
        values = ["al2023-ami-*-x86_64"]
    }
    filter {
        name = "virtualization-type"
        values = ["hvm"]
    }
}

resource "aws_key_pair" "ssh_key" {
    key_name = "server_key"
    public_key = ${file(var.public_key_location)}
}

resource "aws_instance" "ihrm_server" {
    ami = data.aws_ami.latest_amazon_linux_image.id
    instance_type = var.instance_type

    subnet_id = aws_subnet.ihrm_subnet.id
    vpc_security_group_ids = [aws_security_group.ihrm_sg.id]
    availability_zone = var.ihrm_subnet_avail_zone

    associate_public_ip_address = true
    key_name = "aws-aws"

    tags = {
        Name: "${var.ihrm_env_prefix}-ihrm_server"
    }
}
