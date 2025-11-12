# ⚡ INICIO RÁPIDO - VoXStream 100% Local

## 🎯 Instalación en 5 Pasos

### 1️⃣ Instalar FFmpeg
**PowerShell como Administrador:**
```powershell
choco install ffmpeg -y
```

### 2️⃣ Instalar Ollama
1. Descargar: https://ollama.com/download/windows
2. Instalar y luego ejecutar:
```powershell
ollama run llama3
```
(Espera la descarga, luego escribe `/bye`)

### 3️⃣ Instalar Dependencias Python
```powershell
pip install -r python-services/requirements.txt
```
⏳ Primera vez: ~10-15 minutos

### 4️⃣ Crear Directorios
```powershell
New-Item -ItemType Directory -Force uploads, output, temp
```

### 5️⃣ ¡Ejecutar!
```powershell
.\start-local.ps1
```

Abre: **http://localhost:3000**

---

## 📦 ¿Qué acabas de instalar?

- **FFmpeg** → Procesa video/audio
- **Ollama + Llama3** → Traduce texto (~4GB)
- **Faster-Whisper** → Transcribe audio
- **Coqui TTS** → Genera voz natural

## 💾 Espacio en Disco

- Modelos de IA: ~7GB
- Dependencias Python: ~3GB
- **Total:** ~10GB

## 🚀 Rendimiento

- CPU: Video 10 min → ~20-40 min procesamiento
- GPU: Video 10 min → ~2-5 min procesamiento

## ❓ Problemas

Ver guía completa: `INSTALACION-LOCAL.md`

## 🎉 ¡Todo Gratis y Privado!

- ✅ Sin APIs de pago
- ✅ Sin límites de uso
- ✅ Funciona offline
- ✅ Tus videos nunca salen de tu PC
