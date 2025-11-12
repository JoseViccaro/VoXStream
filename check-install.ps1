# Script de verificación de instalación VoXStream Local

Write-Host "`n🔍 Verificando instalación de VoXStream Local...`n" -ForegroundColor Cyan

$allOk = $true

# Verificar Node.js
Write-Host "📦 Node.js..." -NoNewline
try {
    $nodeVersion = node --version 2>&1
    Write-Host " ✅ $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host " ❌ NO INSTALADO" -ForegroundColor Red
    Write-Host "   💡 Descarga desde: https://nodejs.org" -ForegroundColor Yellow
    $allOk = $false
}

# Verificar Python
Write-Host "🐍 Python..." -NoNewline
try {
    $pythonVersion = python --version 2>&1
    Write-Host " ✅ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host " ❌ NO INSTALADO" -ForegroundColor Red
    Write-Host "   💡 Descarga desde: https://python.org/downloads" -ForegroundColor Yellow
    $allOk = $false
}

# Verificar FFmpeg
Write-Host "🎬 FFmpeg..." -NoNewline
try {
    $ffmpegVersion = ffmpeg -version 2>&1 | Select-Object -First 1
    Write-Host " ✅ Instalado" -ForegroundColor Green
} catch {
    Write-Host " ❌ NO INSTALADO" -ForegroundColor Red
    Write-Host "   💡 Ejecuta como Admin: choco install ffmpeg -y" -ForegroundColor Yellow
    $allOk = $false
}

# Verificar Ollama
Write-Host "🤖 Ollama..." -NoNewline
try {
    $response = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -TimeoutSec 2 -ErrorAction Stop
    $modelCount = $response.models.Count
    if ($modelCount -gt 0) {
        Write-Host " ✅ Corriendo ($modelCount modelos)" -ForegroundColor Green
        $response.models | ForEach-Object {
            Write-Host "      → $($_.name)" -ForegroundColor Gray
        }
    } else {
        Write-Host " ⚠️ Corriendo pero sin modelos" -ForegroundColor Yellow
        Write-Host "   💡 Ejecuta: ollama run llama3" -ForegroundColor Yellow
    }
} catch {
    Write-Host " ❌ NO DISPONIBLE" -ForegroundColor Red
    Write-Host "   💡 Descarga desde: https://ollama.com/download/windows" -ForegroundColor Yellow
    Write-Host "   💡 Luego ejecuta: ollama run llama3" -ForegroundColor Yellow
    $allOk = $false
}

# Verificar dependencias Python
Write-Host "`n📚 Dependencias Python:" -ForegroundColor Cyan

$pythonPackages = @{
    "flask" = "Servidor web para servicios"
    "faster-whisper" = "Transcripción de audio"
    "TTS" = "Síntesis de voz"
}

foreach ($package in $pythonPackages.Keys) {
    Write-Host "   $package..." -NoNewline
    try {
        $installed = pip show $package 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅" -ForegroundColor Green
        } else {
            Write-Host " ❌ NO INSTALADO" -ForegroundColor Red
            $allOk = $false
        }
    } catch {
        Write-Host " ❌ ERROR" -ForegroundColor Red
        $allOk = $false
    }
}

if (-not $allOk) {
    Write-Host "`n💡 Para instalar dependencias Python:" -ForegroundColor Yellow
    Write-Host "   pip install -r python-services\requirements.txt" -ForegroundColor White
}

# Verificar dependencias Node.js
Write-Host "`n📦 Dependencias Node.js..." -NoNewline
if (Test-Path "node_modules") {
    Write-Host " ✅ Instaladas" -ForegroundColor Green
} else {
    Write-Host " ❌ NO INSTALADAS" -ForegroundColor Red
    Write-Host "   💡 Ejecuta: npm install" -ForegroundColor Yellow
    $allOk = $false
}

# Verificar directorios
Write-Host "`n📁 Directorios necesarios:" -ForegroundColor Cyan
$dirs = @('uploads', 'output', 'temp')
foreach ($dir in $dirs) {
    Write-Host "   $dir..." -NoNewline
    if (Test-Path $dir) {
        Write-Host " ✅" -ForegroundColor Green
    } else {
        Write-Host " ❌ NO EXISTE" -ForegroundColor Red
        Write-Host "   💡 Ejecuta: New-Item -ItemType Directory $dir" -ForegroundColor Yellow
        $allOk = $false
    }
}

# Verificar archivo .env
Write-Host "`n⚙️ Configuración..." -NoNewline
if (Test-Path ".env") {
    Write-Host " ✅ .env existe" -ForegroundColor Green
} else {
    Write-Host " ⚠️ .env no encontrado" -ForegroundColor Yellow
    Write-Host "   💡 Copia de .env.example si existe" -ForegroundColor Yellow
}

# Resumen final
Write-Host "`n" + ("═" * 50) -ForegroundColor Cyan
if ($allOk) {
    Write-Host "✅ ¡TODO LISTO! Puedes ejecutar VoXStream" -ForegroundColor Green
    Write-Host "`nEjecuta: .\start-local.ps1" -ForegroundColor White
} else {
    Write-Host "⚠️ Faltan algunos componentes" -ForegroundColor Yellow
    Write-Host "`nRevisa los mensajes de arriba y completa la instalación." -ForegroundColor White
    Write-Host "Guía completa: INSTALACION-LOCAL.md" -ForegroundColor Gray
}
Write-Host ("═" * 50) -ForegroundColor Cyan
Write-Host ""
