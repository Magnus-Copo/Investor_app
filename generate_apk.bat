@echo off
echo ===================================================
echo   InvestFlow - Automatic APK Generator
echo ===================================================
echo.
echo [1/3] Cleaning previous builds...
cd android
call gradlew.bat clean

echo.
echo [2/3] Building Release APK...
echo       This may take 5-10 minutes. Please wait...
call gradlew.bat assembleRelease

echo.
echo [3/3] Build Complete!
echo.
if exist "app\build\outputs\apk\release\app-release.apk" (
    echo [SUCCESS] APK generated successfully!
    echo Location: android\app\build\outputs\apk\release\app-release.apk
    
    echo.
    echo Copying to Downloads...
    copy "app\build\outputs\apk\release\app-release.apk" "%USERPROFILE%\Downloads\InvestFlow_Release.apk"
    echo Copied to: %USERPROFILE%\Downloads\InvestFlow_Release.apk
) else (
    echo [ERROR] APK file not found. Build may have failed.
    echo Check the output above for errors.
)

pause
