@echo off
echo ============================================================================
echo PowerGIS Enterprise - GitHub Pages Deployment Utility
echo Target Repository: https://github.com/PaariVT/PowerGIS
echo ============================================================================

set "GIT_DIR=C:\Program Files\Microsoft Visual Studio\2022\Community\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd"
set "NODE_DIR=C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Microsoft\VisualStudio\NodeJs"
set "PATH=%GIT_DIR%;%NODE_DIR%;%PATH%"

cd /d "%~dp0"

echo.
echo [1/3] Building & synchronizing static GitHub Pages bundle...
call npm run build
if errorlevel 1 (
  echo Build failed!
  pause
  exit /b 1
)

echo.
echo [2/3] Staging and committing latest build artifacts...
git add -A
git diff --cached --quiet || git commit -m "chore(deploy): sync production bundle for GitHub Pages"
git branch -M main
git branch -f master main

echo.
echo [3/3] Pushing main and master branches to https://github.com/PaariVT/PowerGIS ...
git push -u origin main master
if errorlevel 1 (
  echo.
  echo Push requires GitHub authentication. Please complete the GitHub sign-in prompt and re-run if needed.
  pause
  exit /b 1
)

echo.
echo ============================================================================
echo Successfully pushed to https://github.com/PaariVT/PowerGIS !
echo Live GitHub Pages URL: https://paarivt.github.io/PowerGIS/
echo ============================================================================
pause
