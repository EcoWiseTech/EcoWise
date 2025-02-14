@echo off
echo ==================================================
echo Starting SAM Build...
echo ==================================================

sam build --template "template.yaml" --parameter-overrides "ParameterKey=AmplifyStage,ParameterValue=PRODUCTION ParameterKey=Environment,ParameterValue=prod"
if errorlevel 1 (
    echo SAM Build failed. Exiting.
    exit /b 1
)
echo SAM Build completed successfully.

echo.
echo ==================================================
echo Starting SAM Deploy...
echo ==================================================

sam deploy --config-file pipeline/samconfig-pipeline.toml --parameter-overrides "ParameterKey=AmplifyStage,ParameterValue=PRODUCTION ParameterKey=Environment,ParameterValue=prod" --capabilities CAPABILITY_NAMED_IAM --config-env "2" --role-arn "arn:aws:iam::783764587062:role/aws-sam-cli-managed-prod--CloudFormationExecutionRo-8OFuqwyOFW6X"
if errorlevel 1 (
    echo SAM Deploy failed. Exiting.
    exit /b 1
)
echo SAM Deploy completed successfully.

pause
