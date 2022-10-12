pipeline {
      agent any

     stages {
         stage('Checkout'){
           steps{
             cleanWs()
             deleteDir()
             checkout scm
           }
         }

        stage ('Main Stage') {
            steps {
                script {

                    if (env.BRANCH_NAME == "develop") {

                        stage('Build  image develop') {
                                imageNodeFrontend = docker.build("elmas19/backend:2.0.1-rc2", "--no-cache  .");
                        }

                        stage('Push Image develop in DockerHub'){
                            withDockerRegistry([ credentialsId: "docker-hub", url: "" ]) {
                                sh 'docker push elmas19/backend:2.0.1-rc2'
                           }
                        }

                        stage ('run backend test'){
                            junit skipPublishingChecks: true, allowEmptyResults: false, testResults: 'test-backend-results.xml'
                            echo 'end test & coverage'
                        }

                        stage ('Deploying in develop'){
                            echo 'deploy in develop'
                            sh 'docker-compose  -f docker-compose.yml -f docker-compose-develop.yml --env-file .env.develop up -d   --build  --always-recreate-deps  mysql-develop redis develop-app '
                        }
                    }

                    else if (env.BRANCH_NAME == 'master') {

                         stage("Pull & Merge Request"){
                            sh 'git config user.name "AnsouSy"'
                            sh 'git config user.email "gogs@gmail.com"'
                            sshagent(['jenkins']) {
                                sh 'git pull origin master'
                                sh 'git merge origin/preprod'
                                sh 'git push origin HEAD:master'
                            }
                         }

                         stage ('run backend test'){
                            junit skipPublishingChecks: true, allowEmptyResults: false, testResults: 'test-backend-results.xml'
                            echo 'end test & coverage'
                         }

                        stage ('deploying in production') {
                            sh 'docker-compose -f docker-compose-prod.yml --env-file .env.prod up -d  --build --always-recreate-deps mysql  prod-app'
                        }
                    }
                    else if(env.BRANCH_NAME == 'preprod'){

                       stage("Pull & Merge Request"){
                            sh 'git config user.name "AnsouSy"'
                            sh 'git config user.email "gogs@gmail.com"'
                            sshagent(['jenkins']) {
                                sh 'git pull origin preprod'
                                sh 'git merge origin/develop'
                                sh 'git push origin HEAD:preprod'
                            }
                       }
                        stage ('run backend test'){
                          junit skipPublishingChecks: true, allowEmptyResults: false, testResults: 'test-backend-results.xml'
                          echo 'end test & coverage'
                        }

                        stage ('deploying in pre-production') {
                          sh 'docker-compose -f docker-compose-preprod.yml --env-file .env.preprod up -d --build --always-recreate-deps mysql-preprod  preprod-app'
                        }
                    }
                }
            }
        }
    }
}

