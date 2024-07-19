output "ec2_public_ip" {
    value = module.ihrm_webserver.instance.public_ip
}
