const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

// Importar servicios personalizados
const VideoProcessor = require('./services/VideoProcessor');
const TranscriptionService = require('./services/TranscriptionService');
const TranslationService = require('./services/TranslationService');
const VoiceService = require('./services/VoiceService');
const SyncService = require('./services/SyncService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  maxHttpBufferSize: 1e8 // 100MB para archivos grandes
});

const PORT = process.env.PORT || 3000;

// Crear directorios necesarios
const uploadsDir = path.join(__dirname, '../uploads');
const outputDir = path.join(__dirname, '../output');
const tempDir = path.join(__dirname, '../temp');

fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(outputDir);
fs.ensureDirSync(tempDir);

// Middleware de seguridad y optimización
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rate limiting para prevenir abuso
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 uploads por IP cada 15 minutos
  message: 'Demasiadas subidas desde esta IP, intenta de nuevo en 15 minutos.'
});

app.use('/api/upload', limiter);

// Configuración de Multer para archivos grandes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 1024 * 2, // 2GB máximo
  },
  fileFilter: (req, file, cb) => {
    // Verificar tipos de archivo permitidos
    const allowedTypes = /\.(mp4|avi|mkv|mov|wmv|flv|webm|m4v|3gp|mp3|wav|aac|flac|ogg)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no soportado'), false);
    }
  }
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));
app.use('/output', express.static(outputDir));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'VoXStream funcionando correctamente',
    services: {
      whisper: 'http://localhost:5001',
      tts: 'http://localhost:5002',
      ollama: 'http://localhost:11434'
    }
  });
});

// API para subir archivos (acepta 'video' o 'videoFile')
app.post('/api/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo' });
    }

    const jobId = uuidv4();
    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const targetLanguage = req.body.targetLanguage || 'es';

    console.log(`📁 Archivo recibido: ${originalName} (${Math.round(req.file.size / 1024 / 1024)}MB)`);
    console.log(`🌐 Idioma de destino: ${targetLanguage}`);

    // Enviar respuesta inmediata con ID del trabajo
    res.json({
      success: true,
      jobId: jobId,
      message: 'Archivo recibido, iniciando procesamiento...',
      originalName: originalName,
      fileSize: req.file.size
    });

    // Iniciar procesamiento asíncrono
    processVideo(jobId, filePath, originalName, targetLanguage, io);

  } catch (error) {
    console.error('❌ Error al subir archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// API para obtener estado del trabajo
app.get('/api/status/:jobId', (req, res) => {
  const jobId = req.params.jobId;
  // Aquí implementaremos el sistema de estado de trabajos
  res.json({ jobId, status: 'processing', progress: 0 });
});

// API para descargar resultado
app.get('/api/download/:jobId', (req, res) => {
  const jobId = req.params.jobId;
  const outputPath = path.join(outputDir, `${jobId}-doblado.mp4`);
  
  if (fs.existsSync(outputPath)) {
    res.download(outputPath);
  } else {
    res.status(404).json({ error: 'Archivo no encontrado' });
  }
});

// Función principal de procesamiento de video
async function processVideo(jobId, filePath, originalName, targetLanguage, io) {
  try {
    console.log(`🎬 Iniciando procesamiento del trabajo ${jobId}`);
    
    // Notificar inicio a todos los clientes conectados
    io.emit('progress', {
      jobId,
      step: 'start',
      progress: 5,
      message: 'Iniciando procesamiento del video...'
    });

    // Crear instancias de servicios
    const videoProcessor = new VideoProcessor();
    const transcriptionService = new TranscriptionService();
    const translationService = new TranslationService();
    const voiceService = new VoiceService();
    const syncService = new SyncService();

    // Paso 1: Extraer audio
    io.emit('progress', {
      jobId,
      step: 'extract_audio',
      progress: 15,
      message: 'Extrayendo audio del video...'
    });

    const audioPath = await videoProcessor.extractAudio(filePath, jobId);
    console.log(`🎵 Audio extraído: ${audioPath}`);

    // Obtener duración del video original
    let videoDuration = 300; // Default: 5 minutos
    try {
      const videoInfo = await videoProcessor.getVideoInfo(filePath);
      if (videoInfo && videoInfo.duration) {
        videoDuration = parseFloat(videoInfo.duration);
        console.log(`⏱️ Duración del video: ${videoDuration.toFixed(2)}s`);
      } else {
        console.warn('⚠️ No se pudo obtener duración exacta, usando valor por defecto');
      }
    } catch (error) {
      console.warn('⚠️ Error obteniendo duración del video:', error.message);
    }

    // Paso 2: Transcribir audio
    io.emit('progress', {
      jobId,
      step: 'transcribe',
      progress: 30,
      message: 'Transcribiendo audio a texto...'
    });

    const transcription = await transcriptionService.transcribe(audioPath);
    console.log(`📝 Texto transcrito: ${transcription.text.substring(0, 100)}...`);
    console.log(`📊 Segmentos de transcripción: ${transcription.segments ? transcription.segments.length : 0}`);

    // Paso 3: Traducir texto
    io.emit('progress', {
      jobId,
      step: 'translate',
      progress: 50,
      message: `Traduciendo texto a ${targetLanguage}...`
    });

    let translation;
    try {
      // Añadir timeout para la traducción (10 minutos máximo)
      const translationPromise = translationService.translate(transcription, targetLanguage);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Traducción timeout después de 10 minutos')), 600000)
      );
      
      translation = await Promise.race([translationPromise, timeoutPromise]);
      console.log(`🌐 Texto traducido: ${translation.translatedText.substring(0, 100)}...`);
    } catch (error) {
      console.error('❌ Error en traducción:', error.message);
      // Si la traducción falla, usar el texto original
      console.warn('⚠️ Usando texto original sin traducción');
      translation = {
        originalText: transcription.text,
        translatedText: transcription.text,
        targetLanguage: targetLanguage,
        sourceLanguage: transcription.language
      };
    }

    // Paso 4: Generar voz sincronizada en el idioma traducido
    io.emit('progress', {
      jobId,
      step: 'generate_voice',
      progress: 70,
      message: `Generando nueva voz sincronizada en ${targetLanguage}...`
    });

    let newAudioPath;
    // Si tenemos segmentos de Whisper, usar sincronización
    if (transcription.segments && transcription.segments.length > 0) {
      console.log('🔄 Usando sincronización de audio con timestamps...');
      newAudioPath = await syncService.generateSyncedAudio(
        transcription.segments,
        translation.translatedText,
        jobId,
        videoDuration,
        targetLanguage
      );
    } else {
      // Fallback: generar audio sin sincronización
      console.log('⚠️ Sin segmentos, generando audio sin sincronización...');
      const voiceResult = await voiceService.textToSpeech(translation, jobId, { language: targetLanguage });
      newAudioPath = voiceResult.audioPath;
    }
    
    console.log(`🗣️ Voz generada: ${newAudioPath}`);

    // Paso 5: Combinar nuevo audio con video
    io.emit('progress', {
      jobId,
      step: 'combine',
      progress: 90,
      message: 'Combinando nuevo audio con video...'
    });

    const finalVideoPath = await videoProcessor.combineAudioVideo(filePath, newAudioPath, jobId);
    console.log(`🎬 Video final: ${finalVideoPath}`);

    // Finalizado
    io.emit('complete', {
      jobId,
      progress: 100,
      message: '¡Video doblado completado exitosamente!',
      downloadUrl: `/api/download/${jobId}`
    });

    // Limpiar archivos temporales
    setTimeout(() => {
      fs.remove(filePath).catch(console.error);
      fs.remove(audioPath).catch(console.error);
      fs.remove(newAudioPath).catch(console.error);
    }, 3600000); // Limpiar después de 1 hora

  } catch (error) {
    console.error(`❌ Error procesando video ${jobId}:`, error);
    
    io.emit('error', {
      jobId,
      message: error.message || 'Error desconocido durante el procesamiento'
    });
  }
}

// Manejo de conexiones Socket.IO
io.on('connection', (socket) => {
  console.log(`🔗 Cliente conectado: ${socket.id}`);
  
  socket.on('join-job', (jobId) => {
    socket.join(`job_${jobId}`);
    console.log(`📝 Cliente ${socket.id} siguiendo trabajo ${jobId}`);
  });
  
  socket.on('disconnect', () => {
    console.log(`🔌 Cliente desconectado: ${socket.id}`);
  });
});

// Manejo de errores
app.use((error, req, res, next) => {
  console.error('❌ Error del servidor:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

server.listen(PORT, () => {
  console.log(`🎬 VoXStream - Servidor de doblaje automático ejecutándose en puerto ${PORT}`);
  console.log(`🌐 Abre http://localhost:${PORT} en tu navegador`);
  console.log(`📁 Directorio de uploads: ${uploadsDir}`);
  console.log(`📤 Directorio de salida: ${outputDir}`);
});