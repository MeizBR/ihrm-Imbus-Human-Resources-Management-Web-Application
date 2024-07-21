#!/bin/bash

container_name=$1

check_installation() {
    tool_to_check=$1
    dpkg -l | awk "/$tool_to_check/ {print}" | wc -l
}

echo "Transferring scripts files to Jenkins agent ..."
docker cp ./install_terraform_on_ubuntu.sh $container_name:/home
docker cp ./install_ansible_on_ubuntu.sh $container_name:/home

echo "Give the scripts files permissions"
docker exec $container_name chmod +x /home/install_terraform_on_ubuntu.sh /home/install_ansible_on_ubuntu.sh

echo "Installing Terraform"
docker exec $container_name /home/install_terraform_on_ubuntu.sh

echo "Installing Ansible"
docker exec $container_name /home/install_ansible_on_ubuntu.sh

# Re-check if Terraform is installed after the installation process
if [ "$(docker exec $container_name bash -c "$(declare -f check_installation); check_installation terraform")" -ge 1 ]; then
  echo "Terraform has been installed successfully."
else
  echo "Failed to install Terraform."
fi

# Re-check if Ansible is installed after the installation process
if [ "$(docker exec $container_name bash -c "$(declare -f check_installation); check_installation ansible")" -ge 1 ]; then
  echo "Ansible has been installed successfully."
else
  echo "Failed to install Ansible."
fi
