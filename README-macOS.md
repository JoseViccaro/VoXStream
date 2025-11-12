# VoXStream - Instalación en macOS

## 🍎 Guía rápida para MacBook Air

### 1. Instalar Homebrew (si no lo tienes)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Instalar dependencias del sistema
```bash
brew install ffmpeg ollama node python@3.11
```

### 3. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/VoXStream.git
cd VoXStream
```

### 4. Configurar Python
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install flask faster-whisper edge-tts requests
```

### 5. Instalar dependencias Node.js
```bash
npm install
```

### 6. Iniciar Ollama y descargar modelo
```bash
# En una terminal separada:
ollama serve

# En otra terminal:
ollama pull llama3.2:1b
```

### 7. Dar permisos de ejecución al script
```bash
chmod +x start-local.sh
```

### 8. Iniciar la aplicación
```bash
./start-local.sh
```

## 🚀 Inicio rápido (después de la primera instalación)

```bash
./start-local.sh
```

Abre http://localhost:3000 en tu navegador.

## ⚙️ Iniciar servicios manualmente

### Servicio Whisper:
```bash
source .venv/bin/activate
python3 python-services/whisper_service.py
```

### Servicio TTS:
```bash
source .venv/bin/activate
python3 python-services/tts_service_edge.py
```

### Ollama:
```bash
ollama serve
```

### Servidor Node.js:
```bash
npm start
```

## 🔧 Optimizaciones para Apple Silicon

Si tienes M1/M2, faster-whisper puede usar aceleración CoreML:

```bash
pip install coremltools
```

## 📊 Rendimiento esperado en MacBook Air 16GB

- **Transcripción (Whisper):** ~10-20s por minuto de audio (2-3x más rápido que en PC)
- **Traducción (Ollama):** Similar a PC
- **TTS (edge-tts):** Similar a PC
- **Procesamiento video (FFmpeg):** 1.5x más rápido con VideoToolbox

## 🐛 Solución de problemas

### Whisper no inicia:
```bash
pip install --upgrade faster-whisper
```

### Ollama no responde:
```bash
killall ollama
ollama serve
```

### Puertos ocupados:
```bash
lsof -ti:3000 | xargs kill
lsof -ti:5001 | xargs kill
lsof -ti:5002 | xargs kill
```

## 📝 Diferencias con Windows

| Componente | Windows | macOS |
|------------|---------|-------|
| Script inicio | `start-local.ps1` | `start-local.sh` |
| Activar venv | `.venv\Scripts\activate` | `source .venv/bin/activate` |
| FFmpeg | Chocolatey | Homebrew |
| Ollama | Instalador .exe | Homebrew |
| Rutas | `\` (backslash) | `/` (forward slash) |
| Processes | PowerShell commands | `ps`, `kill`, `lsof` |

## 🎯 Ventajas en MacBook Air M1/M2

✅ **Neural Engine:** Aceleración hardware para Whisper  
✅ **16GB RAM:** Sin problemas de memoria  
✅ **Memoria unificada:** Transferencias ultra-rápidas  
✅ **Eficiencia:** Bajo consumo, sin ventilador ruidoso  
✅ **Instalación simple:** Homebrew y entorno Unix nativo
