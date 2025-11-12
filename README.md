# 🎬 VoXStream - Doblaje Automático con IA

<div align="center">

![VoXStream](https://img.shields.io/badge/VoXStream-Doblaje%20Automático-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge)
![OpenAI](https://img.shields.io/badge/OpenAI-Whisper-orange?style=for-the-badge)
![Google Cloud](https://img.shields.io/badge/Google%20Cloud-Translate%20%26%20TTS-yellow?style=for-the-badge)

**Aplicación web que dobla videos automáticamente al español usando inteligencia artificial**

[🚀 Instalación](#instalación) • [🔧 Configuración](#configuración) • [📖 Uso](#uso) • [🛠️ Desarrollo](#desarrollo)

</div>

## ✨ Características

- **🎤 Transcripción precisa** con OpenAI Whisper
- **🌐 Traducción inteligente** usando Google Translate API
- **🗣️ Voz natural** con Google Text-to-Speech
- **📁 Archivos grandes** hasta 2GB soportados
- **⚡ Procesamiento asíncrono** con progreso en tiempo real
- **🎨 Interfaz moderna** con drag & drop
- **🔒 Seguro y privado** con limpieza automática
- **📱 Responsive** funciona en móviles y desktop

## 🎯 Flujo de Procesamiento

1. **📤 Subida**: El usuario sube un video o archivo de audio
2. **🎵 Extracción**: FFmpeg extrae el audio del video
3. **🎤 Transcripción**: Whisper convierte el audio a texto
4. **🌐 Traducción**: Google Translate traduce al español
5. **🗣️ Síntesis**: Text-to-Speech genera la nueva voz
6. **🎬 Combinación**: Se crea el video final doblado

## 🚀 Instalación

### Prerrequisitos

- **Node.js** 18+ instalado
- **npm** o **yarn**
- **Cuenta OpenAI** (para Whisper API)
- **Google Cloud** (para Translate y TTS)

### 1. Clonar y configurar

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/VoXStream.git
cd VoXStream

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env
```

### 2. Instalar dependencias del sistema (macOS)

```bash
# Instalar FFmpeg (necesario para procesamiento de video)
brew install ffmpeg

# Verificar instalación
ffmpeg -version
```

### 3. Configurar APIs

#### OpenAI API Key
1. Ve a [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crea una nueva API key
3. Añádela al archivo `.env`:
```env
OPENAI_API_KEY=tu-api-key-aqui
```

#### Google Cloud Setup
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Habilita las APIs:
   - Cloud Translation API
   - Cloud Text-to-Speech API
4. Crea una service account y descarga el JSON
5. Configura las credenciales:
```env
GOOGLE_PROJECT_ID=tu-proyecto-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

## 🔧 Configuración

### Variables de Entorno Principales

```env
# Servidor
PORT=3000
NODE_ENV=development

# APIs
OPENAI_API_KEY=sk-...
GOOGLE_PROJECT_ID=mi-proyecto
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json

# Límites
MAX_FILE_SIZE=2147483648  # 2GB
RATE_LIMIT_MAX_REQUESTS=10

# Limpieza automática
AUTO_CLEANUP_HOURS=1
```

### Configuración de Producción

Para producción, considera configurar:
- Base de datos (MongoDB) para persistencia de trabajos
- Redis para cola de trabajos
- Load balancer para múltiples instancias
- CDN para entrega de archivos

## 📖 Uso

### Iniciar el servidor

```bash
# Desarrollo (con recarga automática)
npm run dev

# Producción
npm start
```

### Acceder a la aplicación

1. Abre tu navegador en `http://localhost:3000`
2. Arrastra un video a la zona de subida
3. Espera el procesamiento (progreso en tiempo real)
4. Descarga tu video doblado

### Formatos soportados

**Videos:** MP4, AVI, MOV, MKV, WebM, WMV, FLV, 3GP  
**Audio:** MP3, WAV, AAC, FLAC, OGG

## 🛠️ Desarrollo

### Estructura del proyecto

```
VoXStream/
├── src/
│   ├── index.js              # Servidor principal
│   └── services/
│       ├── VideoProcessor.js # Procesamiento de video
│       ├── TranscriptionService.js # Transcripción
│       ├── TranslationService.js   # Traducción
│       └── VoiceService.js         # Text-to-Speech
├── public/
│   ├── index.html           # Interfaz web
│   └── app.js              # Cliente JavaScript
├── uploads/                # Archivos subidos
├── output/                # Videos procesados
├── temp/                  # Archivos temporales
└── package.json
```

### Scripts disponibles

```bash
npm run dev     # Servidor de desarrollo
npm start       # Servidor de producción
npm test        # Ejecutar tests (por implementar)
npm run lint    # Linter de código (por implementar)
```

### Agregar nuevas funcionalidades

1. **Nuevos idiomas**: Modifica `TranslationService.js` y `VoiceService.js`
2. **Formatos de video**: Actualiza `VideoProcessor.js`
3. **APIs alternativas**: Implementa en los servicios respectivos
4. **Optimizaciones**: Usa worker threads para paralelización

## 🔍 Monitoreo y Logs

Los logs se muestran en consola con formato:
- ✅ Operaciones exitosas
- ⚠️ Advertencias
- ❌ Errores
- 📊 Información de progreso

### Debugging

```bash
# Logs detallados
NODE_ENV=development npm run dev

# Solo errores
LOG_LEVEL=error npm start
```

## 🚨 Solución de Problemas

### Error: "FFmpeg not found"
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# Windows
# Descargar desde https://ffmpeg.org/download.html
```

### Error: "OpenAI API quota exceeded"
- Verifica tu saldo en OpenAI
- Considera usar un modelo más económico
- Implementa caching para reducir calls

### Error: "Google API authentication failed"
- Verifica que el archivo de credenciales existe
- Confirma que las APIs están habilitadas
- Revisa los permisos de la service account

### Videos muy grandes fallan
- Ajusta `MAX_FILE_SIZE` en el .env
- Incrementa timeout del servidor
- Considera dividir en chunks más pequeños

## 🔐 Seguridad

- ✅ Rate limiting implementado
- ✅ Validación de tipos de archivo
- ✅ Límites de tamaño configurables
- ✅ Limpieza automática de archivos
- ✅ Sanitización de inputs
- ✅ HTTPS recomendado en producción

## 📊 Rendimiento

### Optimizaciones implementadas

- Procesamiento asíncrono
- Chunks para archivos grandes
- Compresión gzip
- Limpieza automática
- Rate limiting inteligente

### Benchmarks típicos

- **Video 100MB**: ~3-5 minutos
- **Video 500MB**: ~8-12 minutos  
- **Video 1GB**: ~15-25 minutos

*Los tiempos varían según la duración del audio y la velocidad de las APIs*

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📝 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

Desarrollado con ❤️ para automatizar el doblaje de videos usando las últimas tecnologías de IA.

---

<div align="center">

**⭐ ¡Dale una estrella si te gustó el proyecto! ⭐**

[🐛 Reportar Bug](../../issues) • [💡 Solicitar Feature](../../issues) • [❓ Preguntas](../../discussions)

</div>
