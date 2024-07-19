resource "aws_security_group" "ihrm_sg" {
    name = "ihrm_sg"
    vpc_id = var.vpc_id

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
        values = [var.image_name]
    }
    filter {
        name = "virtualization-type"
        values = ["hvm"]
    }
}

resource "aws_instance" "ihrm_server" {
    ami = data.aws_ami.latest_amazon_linux_image.id
    instance_type = var.instance_type

    subnet_id = var.subnet_id
    vpc_security_group_ids = [aws_security_group.ihrm_sg.id]
    availability_zone = var.ihrm_subnet_avail_zone

    associate_public_ip_address = true
    key_name = "aws-aws"

    tags = {
        Name: "${var.ihrm_env_prefix}-ihrm_server"
    }
}