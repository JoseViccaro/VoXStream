# Cross-Platform Compatibility Notes

## 📋 Código compatible (sin cambios necesarios)

✅ **JavaScript/Node.js:**
- `src/index.js` - Funciona igual en ambos sistemas
- `src/services/*.js` - Compatible sin modificaciones
- `package.json` - Sin cambios necesarios

✅ **Python:**
- `python-services/*.py` - Compatible sin modificaciones
- Las rutas se manejan automáticamente con `os.path`

✅ **FFmpeg:**
- Los comandos son idénticos en ambos sistemas
- Solo cambia la instalación (Chocolatey vs Homebrew)

## 🔄 Diferencias entre Windows y macOS

### Scripts de inicio:
- **Windows:** `start-local.ps1` (PowerShell)
- **macOS:** `start-local.sh` (Bash)

### Activación de entorno virtual:
- **Windows:** `.venv\Scripts\activate`
- **macOS:** `source .venv/bin/activate`

### Gestión de procesos:
```powershell
# Windows (PowerShell)
Get-Process node | Stop-Process -Force
netstat -ano | Select-String "3000"
```

```bash
# macOS (Bash)
ps aux | grep node
kill $(lsof -ti:3000)
```

### Instalación de dependencias:
```powershell
# Windows
choco install ffmpeg ollama nodejs
```

```bash
# macOS
brew install ffmpeg ollama node
```

## 🚀 Inicio en cada plataforma

### Windows:
```powershell
.\start-local.ps1
```

### macOS:
```bash
chmod +x start-local.sh  # Solo la primera vez
./start-local.sh
```

## 📦 Preparar para subir a GitHub

### 1. Verificar que estos archivos estén incluidos:
- ✅ `start-local.ps1` (Windows)
- ✅ `start-local.sh` (macOS) - ¡NUEVO!
- ✅ `README.md` (general)
- ✅ `README-macOS.md` (específico macOS) - ¡NUEVO!
- ✅ `.gitignore`
- ✅ Todo el código en `src/` y `python-services/`

### 2. Archivos que NO se suben (ya en .gitignore):
- ❌ `.venv/` (entorno virtual)
- ❌ `node_modules/`
- ❌ `uploads/*.mp4`
- ❌ `output/*.mp4`
- ❌ `temp/*.wav`

### 3. Comandos para subir:
```bash
git add .
git commit -m "Add macOS support with start-local.sh and README-macOS.md"
git push origin main
```

## 🍎 Primera instalación en MacBook Air

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/VoXStream.git
cd VoXStream

# 2. Instalar Homebrew (si no lo tienes)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 3. Instalar dependencias del sistema
brew install ffmpeg ollama node

# 4. Dar permisos al script
chmod +x start-local.sh

# 5. Iniciar (el script configura Python automáticamente)
./start-local.sh
```

## ⚡ Optimizaciones específicas para Apple Silicon (M1/M2)

El código actual ya funcionará bien, pero para máximo rendimiento:

### Whisper con aceleración CoreML (opcional):
```bash
pip install coremltools ane-transformers
```

### FFmpeg con VideoToolbox (ya incluido en Homebrew):
```bash
# Verificar soporte VideoToolbox
ffmpeg -hwaccels
# Debería mostrar: videotoolbox
```

## 🔍 Verificación post-instalación

### En ambos sistemas, estos comandos deben funcionar:
```bash
# Verificar servicios
curl http://localhost:5001/health  # Whisper
curl http://localhost:5002/health  # TTS
curl http://localhost:3000         # Node.js

# Verificar Ollama
ollama list  # Debe mostrar llama3.2:1b
```

## 🎯 Rendimiento esperado

| Componente | Windows (i3-10100, 8GB) | macOS (M1/M2, 16GB) |
|------------|-------------------------|---------------------|
| Whisper | ~40s/min | ~15s/min ⚡ |
| Ollama | ~5s/frase | ~5s/frase |
| edge-tts | ~2s/frase | ~2s/frase |
| FFmpeg | Bueno | Excelente ⚡ |
| Memoria | Límite | Holgado ⚡ |

## 📝 Notas importantes

1. **Los servicios Python** (`whisper_service.py`, `tts_service_edge.py`) son 100% compatibles sin cambios.

2. **El código JavaScript** (`src/`) funciona idéntico en ambos sistemas.

3. **Las rutas de archivos** se manejan correctamente gracias a `path.join()` en Node.js y `os.path` en Python.

4. **FFmpeg** usa los mismos comandos, solo cambia cómo se instala.

5. **edge-tts** funciona igual en ambos sistemas (Microsoft TTS en la nube).

6. **Ollama** debe instalarse y el modelo `llama3.2:1b` descargarse en cada máquina.

## ✅ Checklist antes de migrar

- [ ] Subir código a GitHub desde Windows
- [ ] Incluir `start-local.sh` para macOS
- [ ] Incluir `README-macOS.md`
- [ ] Verificar `.gitignore` (no subir .venv, node_modules, videos)
- [ ] En MacBook: Instalar Homebrew
- [ ] En MacBook: Instalar FFmpeg, Ollama, Node
- [ ] En MacBook: Configurar Python y pip
- [ ] En MacBook: Dar permisos a start-local.sh
- [ ] En MacBook: Ejecutar `./start-local.sh`
- [ ] Verificar que los 3 servicios respondan (puertos 3000, 5001, 5002)
