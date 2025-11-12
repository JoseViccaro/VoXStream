# 🚀 Comandos Git para migrar a macOS

## Desde tu PC Windows:

```powershell
# 1. Asegurarte de estar en el directorio correcto
cd "c:\Users\Jose Viccaro\Desktop\VoXStream-main\VoXStream-main"

# 2. Verificar estado
git status

# 3. Añadir todos los archivos nuevos
git add .

# 4. Hacer commit con todos los cambios
git commit -m "feat: Add macOS support with segment-based sync and edge-tts voices

- Implemented segment-based audio synchronization using Whisper timestamps
- Upgraded from pyttsx3 to edge-tts (Microsoft neural voices)
- Added es-ES-ElviraNeural professional voice-over with +15% speed
- Created start-local.sh for macOS compatibility
- Added README-macOS.md with installation guide
- Added CROSS-PLATFORM.md with compatibility notes
- Fixed audio duration mismatch (segments positioned at exact timestamps)
"

# 5. Subir a GitHub
git push origin main

# 6. Verificar en GitHub que todo se subió correctamente
# Abre tu navegador y ve a: https://github.com/tu-usuario/VoXStream
```

## En tu MacBook Air:

```bash
# 1. Abrir Terminal

# 2. Ir a la carpeta donde quieras el proyecto (ej: Desktop o Documents)
cd ~/Desktop

# 3. Clonar el repositorio
git clone https://github.com/tu-usuario/VoXStream.git
cd VoXStream

# 4. Verificar que todos los archivos están
ls -la
# Deberías ver: start-local.sh, README-macOS.md, src/, python-services/, etc.

# 5. Dar permisos de ejecución al script
chmod +x start-local.sh

# 6. Seguir las instrucciones del README-macOS.md
cat README-macOS.md
```

## 📋 Archivos que se subirán a GitHub:

✅ **Código (funciona en ambos sistemas):**
- `src/index.js`
- `src/services/TranscriptionService.js`
- `src/services/TranslationService.js`
- `src/services/VideoProcessor.js`
- `src/services/VoiceService.js`
- `src/services/SyncService.js` (nuevo, sincronización por segmentos)
- `python-services/whisper_service.py`
- `python-services/tts_service_edge.py` (nuevo, edge-tts)
- `public/index.html`
- `public/app.js`

✅ **Configuración:**
- `package.json`
- `package-lock.json`
- `.gitignore`

✅ **Scripts de inicio:**
- `start-local.ps1` (Windows)
- `start-local.sh` (macOS - NUEVO)

✅ **Documentación:**
- `README.md`
- `README-macOS.md` (NUEVO)
- `CROSS-PLATFORM.md` (NUEVO)
- `CONFIGURACION-RAPIDA.md`
- `APIS-GRATUITAS.md`

❌ **NO se subirán (están en .gitignore):**
- `.venv/` (entorno virtual Python - se crea en cada máquina)
- `node_modules/` (dependencias Node - se instalan con npm install)
- `uploads/*.mp4` (videos de prueba)
- `output/*.mp4` (videos procesados)
- `temp/*.wav` (archivos temporales)

## 🔍 Verificar antes de hacer git push:

```powershell
# Ver qué archivos se van a subir
git status

# Ver los cambios en archivos específicos
git diff src/services/SyncService.js
git diff python-services/tts_service_edge.py

# Asegurarte de que .gitignore funciona (estos NO deben aparecer)
git status | Select-String "node_modules"  # No debe aparecer
git status | Select-String ".venv"         # No debe aparecer
git status | Select-String ".mp4"          # No debe aparecer
```

## ⚠️ IMPORTANTE antes de subir:

1. **Verificar que NO subes credenciales:**
   - No hay archivos `.env` con API keys
   - No hay tokens de GitHub en el código

2. **Verificar que NO subes archivos grandes:**
   - Videos (.mp4, .avi, .mov) ya están en .gitignore
   - Modelos de Whisper (se descargan automáticamente)

3. **Mantener la estructura:**
   ```
   VoXStream/
   ├── src/
   ├── python-services/
   ├── public/
   ├── uploads/ (carpeta vacía con .gitkeep)
   ├── output/ (carpeta vacía con .gitkeep)
   ├── temp/ (carpeta vacía con .gitkeep)
   ├── start-local.ps1
   ├── start-local.sh (NUEVO)
   ├── package.json
   └── README-macOS.md (NUEVO)
   ```

## 🎯 Resumen del proceso completo:

1. **Windows:** `git push` → Subir código
2. **MacBook:** `git clone` → Descargar código
3. **MacBook:** `brew install` → Instalar dependencias
4. **MacBook:** `chmod +x start-local.sh` → Dar permisos
5. **MacBook:** `./start-local.sh` → ¡Funciona!

## 💡 Tip: Si ya tienes un repositorio local sin remote:

```powershell
# Crear repositorio en GitHub primero (desde la web)
# Luego conectarlo:
git remote add origin https://github.com/tu-usuario/VoXStream.git
git branch -M main
git push -u origin main
```
