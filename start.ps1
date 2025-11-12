# VoXStream - Inicio rapido
Write-Host "Iniciando VoXStream Local..." -ForegroundColor Cyan

# Verificar Python
Write-Host "`nVerificando Python..." -ForegroundColor Yellow
python --version

# Verificar Ollama
Write-Host "`nVerificando Ollama..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -ErrorAction Stop | Out-Null
    Write-Host "Ollama OK" -ForegroundColor Green
} catch {
    Write-Host "Iniciando Ollama..." -ForegroundColor Yellow
    Start-Process -FilePath "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 3
}

# Crear directorios
@('uploads', 'output', 'temp') | ForEach-Object {
    if (!(Test-Path $_)) {
        New-Item -ItemType Directory -Path $_ | Out-Null
    }
}

# Iniciar servicios Python
Write-Host "`nIniciando servicios Python..." -ForegroundColor Cyan
Write-Host "  Whisper Service (puerto 5001)..." -ForegroundColor Yellow
Start-Process -FilePath "C:/Users/Jose Viccaro/Desktop/VoXStream-main/.venv/Scripts/python.exe" -ArgumentList "python-services\whisper_service.py" -WindowStyle Minimized

Write-Host "  TTS Service (puerto 5002)..." -ForegroundColor Yellow
Start-Process -FilePath "C:/Users/Jose Viccaro/Desktop/VoXStream-main/.venv/Scripts/python.exe" -ArgumentList "python-services\tts_service.py" -WindowStyle Minimized

Write-Host "`nEsperando 30 segundos a que los servicios se inicien..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Iniciar servidor Node.js
Write-Host "`nIniciando servidor VoXStream..." -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "VoXStream ejecutandose en: http://localhost:3000" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "`nPresiona Ctrl+C para detener`n" -ForegroundColor Yellow

npm start
