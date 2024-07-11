#!/bin/bash

# get actual swagger-coden-cli.jar
if [ ! -f swagger-codegen-cli-3.0.9.jar ]; then
	wget https://repo1.maven.org/maven2/io/swagger/codegen/v3/swagger-codegen-cli/3.0.9/swagger-codegen-cli-3.0.9.jar -O swagger-codegen-cli-3.0.9.jar
fi

# $1: Service Name
ARG1=$1

# $1: MicroService Name
# $2: Model Names
function modelGenerator () {
	if [[ $ARG1 = "" || $ARG1 = $1 ]]; then
		yaml_file=../openapi.yaml
		destination=../../backend/src/main/scala/api/generated/$1
		package=api.generated.$1

		rm -f -r $destination/*
		java \
		-Dmodels=$2 \
		-cp templatev3_2.12-1.1.jar:swagger-codegen-cli-3.0.9.jar \
		io.swagger.codegen.v3.cli.SwaggerCodegen generate \
		-l testbenchScala \
		-i $yaml_file \
		-o $destination \
		--api-package $package
	fi
}

modelGenerator sessions PostUserSession,PostAdminSession,UserSession
modelGenerator workspaces PostWorkspace,Workspace,PatchWorkspace
modelGenerator users PostUser,User,PatchUser,UserCreatedMessage,Password,PatchUserBySuperAdmin
modelGenerator customers PostCustomer,Customer,PatchCustomer
modelGenerator projects PostProject,Project,PatchProject,ProjectRoles,PostActivity,Activity,PatchActivity
modelGenerator cards PostCard,PatchCard,Card
modelGenerator leaves PostLeave,PatchLeave,PatchOwnLeave,Leave,SummaryLeave,PutLeave
modelGenerator calendars Calendar,PostCalendar,PatchCalendar
modelGenerator events Event,PostEvent,PatchEvent

