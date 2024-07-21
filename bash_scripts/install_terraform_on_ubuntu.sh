#!/bin/bash

# Function to install required packages
install_required_packages() {
    sudo apt update
    sudo apt install -y curl wget jq gnupg software-properties-common
}

# Function to check if Terraform is installed
is_terraform_installed() {
  dpkg -l | awk '/terraform/ {print }' | wc -l
}

# Install required packages
install_required_packages

# Check if Terraform is installed
if [ "$(is_terraform_installed)" -ge 1 ]; then
  echo "Terraform is already installed."
else
  echo "Terraform is not installed."
  echo "Installing Terraform... please wait..."

  # Add HashiCorp GPG key and repository
  wget -O- https://apt.releases.hashicorp.com/gpg | gpg --dearmor | sudo tee /usr/share/keyrings/hashicorp-archive-keyring.gpg > /dev/null
  echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list

  # Update and install Terraform
  sudo apt update
  sudo apt-get install -y terraform

  # Re-check if Terraform is installed after the installation process
  if [ "$(is_terraform_installed)" -ge 1 ]; then
    echo "Terraform has been installed successfully."
  else
    echo "Failed to install Terraform."
  fi
fi
