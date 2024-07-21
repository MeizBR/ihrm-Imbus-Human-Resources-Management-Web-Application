#!/bin/bash

# Read the VM user and the private key location
VM_USER=$1

# Get the EC2 public IP address from Terraform output
EC2_IP=$(terraform output -raw ec2_public_ip)

# Define the inventory content
INVENTORY_CONTENT="[ec2]
$EC2_IP ansible_user=$VM_USER"

# Create the inventory file
echo "$INVENTORY_CONTENT" > ../terraform_ansible/hosts.ini

# Display the inventory file content
cat ../terraform_ansible/hosts.ini