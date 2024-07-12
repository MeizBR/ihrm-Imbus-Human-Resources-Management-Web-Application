output "aws_ami_id" {
    value = module.ihrm_webserver.instance.ami
}

output "ec2_public_ip" {
    value = module.ihrm_webserver.instance.public_ip
}
