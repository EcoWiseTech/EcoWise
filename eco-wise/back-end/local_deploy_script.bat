@echo off
setlocal enabledelayedexpansion

echo ==================================================
echo Starting SAM Build...
echo ==================================================

call sam build --template "template.yaml" --cached --parallel
if %ERRORLEVEL% neq 0 (
    echo SAM Build failed. Exiting.
    exit /b 1
)
echo SAM Build completed successfully.

echo ==================================================
echo Deploying with SAM (confirm_changeset = true)...
echo ==================================================

call sam deploy --stack-name sam-prod --parameter-overrides "ParameterKey=AmplifyStage,ParameterValue=PRODUCTION ParameterKey=Environment,ParameterValue=prod" --capabilities CAPABILITY_NAMED_IAM  --role-arn "arn:aws:iam::783764587062:role/aws-sam-cli-managed-prod--CloudFormationExecutionRo-8OFuqwyOFW6X" --confirm-changeset --s3-bucket aws-sam-cli-managed-prod-pipeline--artifactsbucket-1dvm5syvhw4t --s3-prefix sam-prod --tags "Environment=prod"
if %ERRORLEVEL% neq 0 (
    echo SAM Deploy failed. Exiting.
    exit /b 1
)
echo SAM Deploy completed successfully.

pause
