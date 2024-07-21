#!/bin/bash

# Function to check if Ansible is installed
is_ansible_installed() {
  dpkg -l | awk '/ansible/ {print }' | wc -l
}

# Check if Ansible is installed
if [ "$(is_ansible_installed)" -ge 1 ]; then
  echo "Ansible is already installed."
else
  echo "Ansible is not installed."
  echo "Installing Ansible... please wait..."

  # Add Ansible PPA and install Ansible
  sudo apt-add-repository -y ppa:ansible/ansible
  sudo apt update
  sudo apt install -y ansible

  # Re-check if Ansible is installed after the installation process
  if [ "$(is_ansible_installed)" -ge 1 ]; then
    echo "Ansible has been installed successfully."
  else
    echo "Failed to install Ansible."
  fi
fi
