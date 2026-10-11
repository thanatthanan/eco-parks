@echo off
title National Park Dashboard Server
chcp 65001 > nul
echo ===================================================
echo   🌲 National Park Dashboard Sync Server
echo   กำลังเปิดหน้าแดชบอร์ดที่ http://localhost:3000...
echo ===================================================
echo.
start http://localhost:3000/TRAVEL_DASHBOARD.html
node server.js
pause
