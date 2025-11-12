# 🎬 VoXStream - 100% Local

## ¡Conversión Completa a Solución Local!

Este proyecto ha sido **completamente adaptado** para funcionar **100% localmente** sin necesidad de APIs de pago externas.

## 🆕 ¿Qué ha Cambiado?

### ❌ Antes (APIs de Pago)
- OpenAI Whisper API → 💰 $0.006/minuto
- Google Translate API → 💰 $20/1M caracteres  
- Google Text-to-Speech → 💰 $16/1M caracteres

### ✅ Ahora (100% Gratis y Local)
- **Faster-Whisper** → Transcripción local
- **Ollama + Llama3** → Traducción local
- **Coqui TTS** → Síntesis de voz local

## 🚀 Inicio Rápido

Ver guía completa: **[INICIO-RAPIDO-LOCAL.md](INICIO-RAPIDO-LOCAL.md)**

### Resumen de 5 pasos:

1. **Instalar FFmpeg** (como administrador)
   ```powershell
   choco install ffmpeg -y
   ```

2. **Instalar Ollama** desde https://ollama.com/download/windows
   ```powershell
   ollama run llama3
   ```

3. **Instalar dependencias Python**
   ```powershell
   pip install -r python-services/requirements.txt
   ```

4. **Crear directorios**
   ```powershell
   New-Item -ItemType Directory -Force uploads, output, temp
   ```

5. **¡Ejecutar!**
   ```powershell
   .\start-local.ps1
   ```

Abre: http://localhost:3000

## 🏗️ Arquitectura

```
┌──────────────────────────────────────────────┐
│          VoXStream Frontend (Node.js)        │
│              Puerto 3000                     │
└──────────────────┬───────────────────────────┘
                   │
     ┌─────────────┼─────────────┐
     │             │             │
     ▼             ▼             ▼
┌─────────┐  ┌─────────┐  ┌─────────┐
│ Whisper │  │ Ollama  │  │ Coqui   │
│ Service │  │ Llama3  │  │   TTS   │
│  :5001  │  │ :11434  │  │  :5002  │
└─────────┘  └─────────┘  └─────────┘
    ↓             ↓             ↓
Transcribe → Traduce  →  Genera Voz
```

## 📋 Archivos del Proyecto

```
VoXStream-main/
├── python-services/          # 🆕 Servicios Python locales
│   ├── whisper_service.py    # Transcripción con Whisper
│   ├── tts_service.py        # Síntesis de voz con Coqui
│   └── requirements.txt      # Dependencias Python
│
├── src/
│   └── services/
│       ├── TranscriptionService.js  # ✏️ Modificado para Whisper local
│       ├── TranslationService.js    # ✏️ Modificado para Ollama
│       └── VoiceService.js          # ✏️ Modificado para Coqui TTS
│
├── start-local.ps1           # 🆕 Script de inicio automático
├── INSTALACION-LOCAL.md      # 🆕 Guía detallada de instalación
├── INICIO-RAPIDO-LOCAL.md    # 🆕 Guía rápida
├── .env                      # ✏️ Configuración actualizada
└── README-LOCAL.md           # 🆕 Este archivo
```

## 💪 Ventajas

- ✅ **100% Gratuito** - Sin costos recurrentes
- ✅ **Privacidad Total** - Tus datos nunca salen de tu PC
- ✅ **Sin Límites** - Procesa videos ilimitados
- ✅ **Offline** - Funciona sin conexión a internet
- ✅ **Personalizable** - Modifica modelos y configuración
- ✅ **Open Source** - Código completamente abierto

## ⚙️ Requisitos del Sistema

- **OS:** Windows 10/11
- **RAM:** 8GB mínimo (16GB recomendado)
- **Disco:** 10GB libres
- **GPU:** Opcional (acelera 10-20x el procesamiento)

## 📊 Rendimiento

### Con CPU:
- Video de 10 min → ~20-40 min procesamiento
- Transcripción: ~1-2x tiempo real
- Traducción: ~2-5 segundos/frase
- Síntesis voz: ~1-3x tiempo real

### Con GPU NVIDIA:
- Video de 10 min → ~2-5 min procesamiento
- Transcripción: ~10-20x tiempo real
- Todo lo demás similar a CPU

## 🔧 Configuración Avanzada

### Cambiar Modelo de Traducción

Edita `.env`:
```env
OLLAMA_MODEL=mistral  # Alternativas: llama2, mistral, etc.
```

Modelos disponibles:
- `llama3` - Recomendado, 4GB
- `mistral` - Alternativa rápida, 4GB
- `llama2` - Más ligero, 3.8GB

### Cambiar Modelo de Whisper

Edita `python-services/whisper_service.py`:
```python
MODEL_SIZE = 'small'  # tiny, base, small, medium, large-v3
```

### Usar GPU

Si tienes NVIDIA GPU, edita `python-services/whisper_service.py`:
```python
DEVICE = 'cuda'  # Cambiar de 'cpu' a 'cuda'
```

Requiere CUDA: https://developer.nvidia.com/cuda-downloads

## 🐛 Solución de Problemas

Ver guía completa: **[INSTALACION-LOCAL.md](INSTALACION-LOCAL.md)**

### Problemas Comunes:

**"Servicio Whisper no disponible"**
- Verifica: `python python-services/whisper_service.py`

**"Servicio Ollama no disponible"**  
- Ejecuta: `ollama serve`
- Verifica modelos: `ollama list`

**FFmpeg no encontrado**
- Reinicia terminal después de instalar
- Verifica: `ffmpeg -version`

## 📚 Documentación

- **[INICIO-RAPIDO-LOCAL.md](INICIO-RAPIDO-LOCAL.md)** - Inicio rápido en 5 pasos
- **[INSTALACION-LOCAL.md](INSTALACION-LOCAL.md)** - Guía detallada completa
- **[CONFIGURACION-RAPIDA.md](CONFIGURACION-RAPIDA.md)** - Configuración original (APIs)

## 🎯 Casos de Uso

- 🎬 Doblar videos de YouTube
- 📺 Traducir series y películas
- 🎓 Crear contenido educativo multilingüe
- 🎙️ Podcasts internacionales
- 📹 Localizar contenido corporativo

## 🌟 Tecnologías

- **Frontend:** Express.js, Socket.IO
- **Transcripción:** Faster-Whisper (OpenAI Whisper optimizado)
- **Traducción:** Ollama (Llama3, Mistral)
- **Voz:** Coqui TTS
- **Video:** FFmpeg
- **Backend:** Node.js + Python

## 📝 Licencia

MIT License - Úsalo como quieras, es 100% gratis y open source.

## 🙏 Créditos

Basado en el proyecto original VoXStream, adaptado para funcionar completamente local.

Tecnologías utilizadas:
- [Faster-Whisper](https://github.com/guillaumekln/faster-whisper)
- [Ollama](https://ollama.com)
- [Coqui TTS](https://github.com/coqui-ai/TTS)
- [FFmpeg](https://ffmpeg.org)

---

**¿Preguntas? Abre un Issue en GitHub**

**¡Disfruta de tu sistema de doblaje automático 100% local! 🎉**
