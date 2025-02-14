@echo off
setlocal enabledelayedexpansion

echo ==================================================
echo Starting SAM Build...
echo ==================================================

call sam build --template "template.yaml" ^
    --parameter-overrides "ParameterKey=AmplifyStage,ParameterValue=PRODUCTION ParameterKey=Environment,ParameterValue=prod"
if %ERRORLEVEL% neq 0 (
    echo SAM Build failed. Exiting.
    exit /b 1
)
echo SAM Build completed successfully.

echo.
echo ==================================================
echo Deploying with SAM (confirm_changeset = true)...
echo ==================================================

call sam deploy --config-file pipeline/samconfig-pipeline.toml ^
    --parameter-overrides "ParameterKey=AmplifyStage,ParameterValue=PRODUCTION ParameterKey=Environment,ParameterValue=prod" ^
    --capabilities CAPABILITY_NAMED_IAM ^
    --config-env "2" ^
    --role-arn "arn:aws:iam::783764587062:role/aws-sam-cli-managed-prod--CloudFormationExecutionRo-8OFuqwyOFW6X" ^
    --confirm-changeset
if %ERRORLEVEL% neq 0 (
    echo SAM Deploy failed. Exiting.
    exit /b 1
)
echo SAM Deploy completed successfully.

pause
