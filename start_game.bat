@echo off
:: Pixel Character Project Launcher
:: 自動開啟瀏覽器並啟動伺服器

echo ==================================================
echo      VIBE CODING PIXEL CHARACTER PROJECT
echo ==================================================
echo.
echo [1/2] Opening Browser...
start "" "http://localhost:8000"
echo.
echo [2/2] Starting Python HTTP Server on Port 8000...
echo.
echo (Close this window to stop the server)
echo.

python -m http.server 8000
pause
