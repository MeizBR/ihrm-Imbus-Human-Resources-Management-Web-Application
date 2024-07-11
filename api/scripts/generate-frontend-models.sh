#!/bin/bash

# fetch swagger-codegen-cli-3.0.9.jar if not present
if [ ! -f swagger-codegen-cli-3.0.9.jar ]; then
	wget https://repo1.maven.org/maven2/io/swagger/codegen/v3/swagger-codegen-cli/3.0.9/swagger-codegen-cli-3.0.9.jar -O swagger-codegen-cli-3.0.9.jar
fi

function modelGenerator() {
  API_YAML=../openapi.yaml
  FRONTEND_TARGET_DIR=../../frontend/src/app/generated

  rm -rf $FRONTEND_TARGET_DIR

  java	-Dmodels -DsupportingFiles=models.ts \
    -jar swagger-codegen-cli-3.0.9.jar generate \
    -l typescript-angular \
    -i $API_YAML \
    -o $FRONTEND_TARGET_DIR \
    --model-package generated

  rm -rf $FRONTEND_TARGET_DIR/.swagger-codegen-ignore
  rm -rf $FRONTEND_TARGET_DIR/.swagger-codegen
  rm -rf $FRONTEND_TARGET_DIR/api

  mv $FRONTEND_TARGET_DIR/model/* $FRONTEND_TARGET_DIR
  rm -rf $FRONTEND_TARGET_DIR/model
}

modelGenerator
