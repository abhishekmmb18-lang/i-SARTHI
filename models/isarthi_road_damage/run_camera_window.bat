@echo off
title I-SARTHI Road Damage Detection - Live Webcam
echo ============================================================
echo      Starting I-SARTHI Road Damage Detection Window
echo ============================================================
cd /d "%~dp0"
python test_model.py --source webcam
pause
