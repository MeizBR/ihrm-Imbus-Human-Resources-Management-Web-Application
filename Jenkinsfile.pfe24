echo " CI/CD iHRM PROJECT Pipeline starting... "

pipeline {
    agent any

    // Define the environment variables
    environment {
        TARGET = 'build'
        HOST_UID = '1001'
        HOST_GID = '1001'
        DOCKER_HUB_PWD = credentials('dockerhub')
        IHRM_BACKEND_IMAGE_NAME = 'maiezbrm/ihrm_backend:Jenkins-CICD'
        IHRM_FRONTEND_IMAGE_NAME = 'maiezbrm/ihrm_frontend:Jenkins-CICD'
    }

    stages {
        // // Print env variables
        // stage('Print env variables') {
        //     steps {
        //         echo "Target : ${TARGET}"
        //         echo "Host user id: ${HOST_UID}"
        //         echo "Host group id: ${HOST_GID}"
        //     }
        // }

        // // Checkout the Git repository
        // stage('Checkout') {
        //     steps {
        //         checkout scm
        //     }
        // }

        // // Export environment variables and prepare containers
        // stage('prepare containers') {
        //     steps {
        //         script {
        //             sh """
        //                 export TARGET=${env.TARGET}
        //                 export HOST_UID=${env.HOST_UID}
        //                 export HOST_GID=${env.HOST_GID}
        //                 docker-compose up -d --build
        //             """
        //         }
        //     }
        // }

        // // Angular Tests
        // stage('Frontend Format code') {
        //     steps {
        //         sh 'docker compose exec frontend npm run format'
        //     }
        // }

        // stage('Frontend Lint Tests') {
        //     steps {
        //         sh 'docker compose exec frontend npm run test-lint'
        //     }
        // }

        // stage('Frontend Format Tests') {
        //     steps {
        //         sh 'docker compose exec frontend npm run test-format'
        //     }
        // }

        // stage('Frontend Headless Unit Tests and generate test results') {
        //     steps {
        //         sh 'docker compose exec frontend npm run test-headless'
        //         sh 'docker cp frontend:/app/allure-results .'
        //     }
        //     post {
        //         always {
        //             script {
        //                 allure([
        //                         includeProperties: false,
        //                         jdk: '',
        //                         properties: [],
        //                         reportBuildPolicy: 'ALWAYS',
        //                         results: [[path: 'allure-results']]
        //                     ])
        //             }
        //         }
        //     }
        // }

        // stage('Frontend End-to-End Tests') {
        //     steps {
        //         sh 'docker compose exec frontend npm run e2e'
        //     }
        // }

        // // Scala Tests
        // stage('Backend tests') {
        //     steps {
        //         sh 'docker compose exec backend sbt test'
        //     }
        // }

        // // Tag images
        // stage('Tag images') {
        //     steps {
        //         sh 'docker tag ihrmpipeline-backend $IHRM_BACKEND_IMAGE_NAME'
        //         sh 'docker tag ihrmpipeline-frontend $IHRM_FRONTEND_IMAGE_NAME'
        //     }
        // }

        // // Push images to DockerHub
        // stage('Push images to DockerHub') {
        //     steps {
        //         withCredentials([string(credentialsId: 'dockerhub', variable: 'DOCKER_HUB_PWD')]) {
        //             sh 'docker login -u maiezbrm -p $DOCKER_HUB_PWD'
        //             sh 'docker push $IHRM_BACKEND_IMAGE_NAME'
        //             sh 'docker push $IHRM_FRONTEND_IMAGE_NAME'
        //         }
        //     }
        // }

        // // Deploy the webapp with Ansible on a dedicated vm provisionned with Vagrant
        // stage('Deploy the app using Vagrant and Ansible') {
        //     steps {
        //         dir('vagrant and ansible') {
        //             sh "vagrant up"
        //         }
        //     }
        // }

        // Deploy the app on EC2 instance using Terraform and Ansible
        stage('Provision server') {
            environment {
                AWS_ACCESS_KEY_ID = credentials('jenkins_aws_access_key_id')
                AWS_SECRET_ACCESS_KEY = credentials('jenkins_aws_secret_access_key')
                TF_VAR_env_prefix = 'test'
            }
            steps {
                script {
                    dir('terraform') {
                        sh "terraform init"
                        sh "terraform apply --auto-approve"
                        EC2_PUBLIC_IP = sh(
                            script: "terraform output ec2_public_ip",
                            returnStdout: true
                        ).trim()
                        sh "chmod +x ec2_ip.sh && ./ec2_ip.sh"
                    }
                }
            }
        }

        stage('Deploy the app') {
            steps {
                script {
                    sleep(time: 90, unit:"SECONDS")

                    echo "Deploying the app Docker containers to EC2 instance on AWS ..."

                    dir('terraform_ansible') {
                        sh "ansible-playbook -i hosts.ini playbook.yml"
                    }
                }
            }
        }

        // // Clean the workspace
        // stage('Clean up') {
        //     steps {
        //         sh 'docker compose down'
        //     }
        // }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
