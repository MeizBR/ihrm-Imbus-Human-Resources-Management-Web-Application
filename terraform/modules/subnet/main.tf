resource "aws_subnet" "ihrm_subnet" {
    vpc_id = var.vpc_id
    cidr_block = var.ihrm_subnet_cidr_block
    availability_zone = var.ihrm_subnet_avail_zone
    tags = {
        Name: "${var.ihrm_env_prefix}-ihrm_subnet"
    }
}

# virtual router inside vpc
resource "aws_route_table" "ihrm_route_table" {
    vpc_id = var.vpc_id

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
    vpc_id = var.vpc_id

    tags = {
        Name: "${var.ihrm_env_prefix}-ihrm_igw"
    }
}

resource "aws_route_table_association" "ihrm_rtb_association_subnet" {
    subnet_id = aws_subnet.ihrm_subnet.id
    route_table_id = aws_route_table.ihrm_route_table.id
}