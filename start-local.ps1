# VoXStream - 100% Local
# Script para iniciar todos los servicios

Write-Host "🎬 VoXStream - Iniciando servicios locales..." -ForegroundColor Cyan

# Verificar FFmpeg
Write-Host "`n📦 Verificando FFmpeg..." -ForegroundColor Yellow
try {
    ffmpeg -version 2>&1 | Out-Null
    Write-Host "✅ FFmpeg instalado" -ForegroundColor Green
} catch {
    Write-Host "❌ FFmpeg no encontrado" -ForegroundColor Red
    Write-Host "💡 Ejecuta en PowerShell como Administrador: choco install ffmpeg -y" -ForegroundColor Yellow
}

# Verificar Python
Write-Host "`n🐍 Verificando Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python no encontrado" -ForegroundColor Red
    Write-Host "💡 Instala Python desde: https://python.org/downloads" -ForegroundColor Yellow
    exit 1
}

# Verificar Ollama
Write-Host "`n🤖 Verificando Ollama..." -ForegroundColor Yellow
try {
    $ollamaCheck = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -ErrorAction Stop
    Write-Host "✅ Ollama corriendo" -ForegroundColor Green
} catch {
    Write-Host "❌ Ollama no está corriendo" -ForegroundColor Red
    Write-Host "💡 Instala Ollama desde: https://ollama.com/download/windows" -ForegroundColor Yellow
    Write-Host "💡 Luego ejecuta: ollama run llama3" -ForegroundColor Yellow
}

# Verificar dependencias Python
Write-Host "`n📚 Verificando dependencias Python..." -ForegroundColor Yellow
$requirementsPath = "python-services\requirements.txt"
if (Test-Path $requirementsPath) {
    Write-Host "Instalando dependencias Python (esto puede tardar varios minutos la primera vez)..." -ForegroundColor Cyan
    pip install -r $requirementsPath --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencias Python instaladas" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Algunas dependencias pueden no haberse instalado correctamente" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️ Archivo requirements.txt no encontrado" -ForegroundColor Yellow
}

# Crear directorios necesarios
Write-Host "`n📁 Creando directorios..." -ForegroundColor Yellow
@('uploads', 'output', 'temp') | ForEach-Object {
    if (!(Test-Path $_)) {
        New-Item -ItemType Directory -Path $_ | Out-Null
        Write-Host "✅ Creado: $_" -ForegroundColor Green
    }
}

# Iniciar servicios Python en segundo plano
Write-Host "`n🚀 Iniciando servicios Python..." -ForegroundColor Cyan

Write-Host "  🎤 Iniciando Whisper Service (puerto 5001)..." -ForegroundColor Yellow
Start-Process python -ArgumentList "python-services\whisper_service.py" -WindowStyle Minimized

Write-Host "  🗣️  Iniciando TTS Service (puerto 5002)..." -ForegroundColor Yellow
Start-Process python -ArgumentList "python-services\tts_service.py" -WindowStyle Minimized

# Esperar a que los servicios se inicien
Write-Host "`n⏳ Esperando a que los servicios se inicien (30 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Iniciar servidor Node.js
Write-Host "`n🌐 Iniciando servidor VoXStream..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✨ VoXStream está ejecutándose en: http://localhost:3000" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "`n💡 Presiona Ctrl+C para detener todos los servicios`n" -ForegroundColor Yellow

npm start
