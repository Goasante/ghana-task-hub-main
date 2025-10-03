@echo off
echo Starting Ghana Task Hub Frontend Server...
cd dist
python -m http.server 3000
pause

