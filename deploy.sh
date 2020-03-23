#!/bin/bash

BUCKET_NAME=${BUCKET_NAME}

yarn webpack
aws s3 cp dist/main.js s3://${BUCKET_NAME}/main.js --acl=public-read
aws s3 cp dist/index.html s3://${BUCKET_NAME}/index.html --acl=public-read