provider "aws" {
    region = "eu-north-1"
}

resource "aws_vpc" "ihrm_vpc" {
    cidr_block = var.ihrm_vpc_cidr_block
    tags = {
        Name: "${var.ihrm_env_prefix}-ihrm_vpc"
    }
}

module "ihrm_subnet" {
    source = "./modules/subnet"
    # variables can be hardcoded or referenced from the variables.tf file
    ihrm_subnet_cidr_block = var.ihrm_subnet_cidr_block
    ihrm_subnet_avail_zone = var.ihrm_subnet_avail_zone
    ihrm_env_prefix = var.ihrm_env_prefix
    vpc_id = aws_vpc.ihrm_vpc.id
}

module "ihrm_webserver" {
    source = "./modules/webserver"
    # variables can be hardcoded or referenced from the variables.tf file
    ip_addresses_range = var.ip_addresses_range
    image_name = var.image_name
    instance_type = var.instance_type
    subnet_id = module.ihrm_subnet.subnet.id
    ihrm_subnet_avail_zone = var.ihrm_subnet_avail_zone
    ihrm_env_prefix = var.ihrm_env_prefix
    vpc_id = aws_vpc.ihrm_vpc.id
    public_key_location = var.public_key_location
}
