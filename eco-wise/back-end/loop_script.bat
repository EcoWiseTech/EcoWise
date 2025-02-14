@echo off

echo Looking for folders ending with "Function"...
echo ================================================

:: Loop through all subdirectories whose name ends with "Function"
for /d %%F in (*Function) do (
    echo Found folder: %%F
    pushd "%%F"
    echo Installing NPM packages in %%F...
    npm install
    popd
    echo.
)

echo Done!
pause
