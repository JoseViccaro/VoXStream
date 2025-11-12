# 🚀 VoXStream - Instalación 100% Local

Este documento te guía para instalar VoXStream completamente local, sin necesidad de APIs de pago.

## 📋 Requisitos del Sistema

- Windows 10/11
- 8GB RAM mínimo (16GB recomendado)
- 10GB espacio libre en disco
- GPU (opcional, mejora la velocidad)

## 🔧 Instalación Paso a Paso

### 1. Instalar Node.js
✅ **Ya instalado** (detectaste v22.16.0)

### 2. Instalar FFmpeg

**Abrir PowerShell como Administrador** y ejecutar:
```powershell
choco install ffmpeg -y
```

Luego cierra y vuelve a abrir PowerShell.

### 3. Instalar Python
✅ **Ya instalado** (detectaste v3.13.3)

### 4. Instalar Ollama

1. Descarga Ollama desde: https://ollama.com/download/windows
2. Ejecuta el instalador
3. Abre una terminal nueva y ejecuta:
```powershell
ollama run llama3
```
Espera a que descargue el modelo (unos 4GB), luego escribe `/bye` para salir.

### 5. Instalar Dependencias Python

```powershell
cd python-services
pip install -r requirements.txt
```

**Nota:** La primera instalación puede tardar 10-15 minutos y descargará ~3GB.

### 6. Crear Directorios

```powershell
New-Item -ItemType Directory -Force uploads, output, temp
```

## ▶️ Ejecutar VoXStream

Una vez instalado todo, ejecuta:

```powershell
.\start-local.ps1
```

Este script:
- ✅ Verifica que todo esté instalado
- 🚀 Inicia el servicio Whisper (transcripción)
- 🗣️  Inicia el servicio TTS (voz)
- 🌐 Inicia el servidor web

Abre tu navegador en: **http://localhost:3000**

## 🎯 Arquitectura Local

```
┌─────────────────────────────────────────────┐
│  VIDEO DE ENTRADA                           │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  FFmpeg (extrae audio)                      │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Whisper Local (transcribe)                 │
│  Python Service → Puerto 5001               │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Ollama (traduce)                           │
│  Llama3 → Puerto 11434                      │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Coqui TTS (genera voz)                     │
│  Python Service → Puerto 5002               │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  FFmpeg (combina audio + video)             │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  VIDEO DOBLADO                              │
└─────────────────────────────────────────────┘
```

## ⚙️ Configuración Avanzada

### Cambiar el modelo de Ollama

Modelos disponibles:
- `llama3` (4GB) - Recomendado, buena calidad
- `mistral` (4GB) - Alternativa rápida
- `llama2` (3.8GB) - Más ligero

Para cambiar, edita `.env`:
```env
OLLAMA_MODEL=mistral
```

### Cambiar el modelo de Whisper

En `python-services/whisper_service.py`, cambia `MODEL_SIZE`:
- `tiny` - Muy rápido, menor calidad
- `base` - Balanceado (recomendado)
- `small` - Mejor calidad
- `medium` - Alta calidad
- `large-v3` - Máxima calidad (requiere GPU)

### Mejorar Rendimiento

Si tienes GPU NVIDIA:
1. Instala CUDA: https://developer.nvidia.com/cuda-downloads
2. Edita `python-services/whisper_service.py`:
   ```python
   DEVICE = 'cuda'  # Cambiar de 'cpu' a 'cuda'
   ```

## 🐛 Solución de Problemas

### Error: "Servicio Whisper no disponible"
- Verifica que Python está ejecutando `whisper_service.py`
- Revisa que el puerto 5001 no esté en uso

### Error: "Servicio Ollama no disponible"
- Ejecuta `ollama serve` en una terminal
- Verifica que descargaste un modelo: `ollama list`

### Error: FFmpeg no encontrado
- Reinicia la terminal después de instalar FFmpeg
- Verifica con: `ffmpeg -version`

### Los servicios Python no inician
- Verifica dependencias: `pip list | Select-String -Pattern "faster-whisper|TTS|flask"`
- Reinstala: `pip install --upgrade -r python-services/requirements.txt`

## 💡 Ventajas de la Versión Local

- ✅ **100% Gratuito** - Sin límites de uso
- ✅ **Privacidad Total** - Tus videos no salen de tu PC
- ✅ **Sin Internet** - Funciona offline
- ✅ **Sin Límites** - Procesa videos ilimitados
- ✅ **Personalizable** - Modifica modelos y configuración

## 📊 Rendimiento Esperado

Con hardware moderno:
- **Transcripción:** ~1-2x tiempo real (video de 10 min → 5-20 min)
- **Traducción:** ~2-5 segundos por frase
- **Síntesis de voz:** ~1-3x tiempo real
- **Total:** Video de 10 min → 15-40 min procesamiento

Con GPU:
- **Transcripción:** ~10-20x tiempo real
- **Total:** Video de 10 min → 2-5 min procesamiento

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs de los servicios Python
2. Verifica que todos los puertos estén libres (3000, 5001, 5002, 11434)
3. Asegúrate de tener suficiente RAM libre

---

**¡Disfruta de VoXStream 100% local y gratuito! 🎉**
