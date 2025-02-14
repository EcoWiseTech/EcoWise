@echo off
setlocal enabledelayedexpansion

echo ==================================================
echo Starting SAM Build...
echo ==================================================

call sam build --template "template.yaml" --parameter-overrides "ParameterKey=AmplifyStage,ParameterValue=PRODUCTION ParameterKey=Environment,ParameterValue=prod"
if %ERRORLEVEL% neq 0 (
    echo SAM Build failed. Exiting.
    exit /b 1
)
echo SAM Build completed successfully.

echo.
echo ==================================================
echo Creating Change Set with SAM Deploy (--no-execute-changeset)...
echo ==================================================

:: Capture the output of `sam deploy` into a temporary file
call sam deploy --config-file pipeline/samconfig-pipeline.toml --parameter-overrides "ParameterKey=AmplifyStage,ParameterValue=PRODUCTION ParameterKey=Environment,ParameterValue=prod" --capabilities CAPABILITY_NAMED_IAM --config-env "2" --role-arn "arn:aws:iam::783764587062:role/aws-sam-cli-managed-prod--CloudFormationExecutionRo-8OFuqwyOFW6X" --no-execute-changeset > temp_output.txt 2>&1

if %ERRORLEVEL% neq 0 (
    echo SAM Deploy (change set creation) failed. Exiting.
    exit /b 1
)

:: Extract the Change Set ARN from the output
for /f "tokens=6 delims= " %%A in ('findstr /C:"Changeset created successfully." temp_output.txt') do set CHANGESET_ARN=%%A

:: Cleanup temporary file
del temp_output.txt

if "%CHANGESET_ARN%"=="" (
    echo Failed to extract Change Set ARN. Exiting.
    exit /b 1
)

:: Print the Change Set ARN
echo.
echo ==================================================
echo Change Set Created Successfully!
echo Change Set ARN: %CHANGESET_ARN%
echo ==================================================

:: Ask the user if they want to execute the change set
set /p EXECUTE="Do you want to execute the change set now? (Y/N): "
if /I "%EXECUTE%"=="Y" (
    echo Executing Change Set...
    aws cloudformation execute-change-set --stack-name sam-prod --change-set-name %CHANGESET_ARN%
    if %ERRORLEVEL% neq 0 (
        echo Change set execution failed.
        exit /b 1
    )
    echo Change set executed successfully!
) else (
    echo Change set was not executed. You can apply it later using:
    echo aws cloudformation execute-change-set --stack-name sam-prod --change-set-name %CHANGESET_ARN%
)

pause
