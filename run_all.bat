@echo off
echo Cleaning up hung processes...
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM git.exe /T 2>nul

echo Copying Mercur packages...
xcopy /E /I /Y c:\chrissoft\temp_clones\mercur\packages\core c:\chrissoft\packages\mercur\core
xcopy /E /I /Y c:\chrissoft\temp_clones\mercur\packages\types c:\chrissoft\packages\mercur\types

echo Initializing Git repository...
git init
git remote add origin https://github.com/Joshuamathewj2/Chrissoft
git add .
git commit -m "Initial commit of B2B Procurement monorepo platform"
git branch -M main
git push -u origin main

echo All done!
pause
