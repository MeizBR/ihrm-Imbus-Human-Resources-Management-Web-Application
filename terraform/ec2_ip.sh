#!/bin/bash

# Get the EC2 public IP address from Terraform output
EC2_IP=$(terraform output -raw ec2_public_ip)

# Define the inventory content
INVENTORY_CONTENT="[ec2]
$EC2_IP ansible_user=ec2-user ansible_ssh_private_key_file=/home/.ssh/aws-aws.pem"

# Create the inventory file
echo "$INVENTORY_CONTENT" > ../terraform_ansible/hosts.ini

# Display the inventory file content
cat ../terraform_ansible/hosts.ini