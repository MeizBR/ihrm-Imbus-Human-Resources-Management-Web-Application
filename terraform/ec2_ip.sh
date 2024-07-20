#!/bin/bash

# Read the VM user and the private key location
VM_USER=$1
PRIVATE_KEY_LOCATION=$2

# Get the EC2 public IP address from Terraform output
EC2_IP=$(terraform output -raw ec2_public_ip)

# Define the inventory content
INVENTORY_CONTENT="[ec2]
$EC2_IP ansible_user=$VM_USER ansible_ssh_private_key_file=$PRIVATE_KEY_LOCATION"

# Create the inventory file
echo "$INVENTORY_CONTENT" > ../terraform_ansible/hosts.ini

# Display the inventory file content
cat ../terraform_ansible/hosts.ini