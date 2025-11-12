const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

class VoiceService {
  constructor() {
    // Usar servicio TTS local
    this.ttsUrl = process.env.TTS_SERVICE_URL || 'http://localhost:5002';
  }

  async textToSpeech(text, jobId, options = {}) {
    try {
      console.log('🗣️ Iniciando generación de voz con TTS local...');
      
      // Extraer texto si es un objeto de traducción
      let textToSpeak = text;
      if (typeof text === 'object' && text.translatedText) {
        textToSpeak = text.translatedText;
      } else if (typeof text === 'object' && text.text) {
        textToSpeak = text.text;
      }
      
      console.log(`📝 Texto a convertir: "${textToSpeak.substring(0, 100)}..."`);

      // Validar entrada
      if (!textToSpeak || textToSpeak.trim().length === 0) {
        throw new Error('Texto vacío para generar voz');
      }

      // Verificar que el servicio TTS está disponible
      try {
        await axios.get(`${this.ttsUrl}/health`);
      } catch (error) {
        throw new Error('Servicio TTS local no disponible. Asegúrate de ejecutar: python python-services/tts_service.py');
      }

      const outputPath = path.join(__dirname, '../../temp', `voice_${jobId}.wav`);
      
      // Asegurar que el directorio temp existe
      await fs.ensureDir(path.dirname(outputPath));

      const language = options.language || 'es';

      // Llamar al servicio TTS local
      console.log('📡 Enviando al servicio TTS local...');
      const response = await axios.post(`${this.ttsUrl}/synthesize-to-file`, {
        text: textToSpeak,
        output_path: outputPath,
        language: language
      });

      const result = response.data;
      
      // Verificar que el archivo se generó correctamente
      if (await fs.pathExists(outputPath)) {
        const stats = await fs.stat(outputPath);
        console.log(`🎵 Audio generado: ${Math.round(stats.size / 1024)}KB`);
        
        return {
          audioPath: outputPath,
          duration: await this.getAudioDuration(outputPath),
          fileSize: stats.size,
          format: 'wav',
          sampleRate: options.sampleRate || 22050,
          quality: 'alta'
        };
      } else {
        throw new Error('No se pudo generar el archivo de audio');
      }

    } catch (error) {
      console.error('❌ Error generando voz:', error);
      throw new Error(`Error de text-to-speech: ${error.message}`);
    }
  }

  async getAudioDuration(audioPath) {
    // Para obtener la duración real, necesitaríamos FFprobe
    // Por ahora, estimación basada en tamaño
    try {
      const stats = await fs.stat(audioPath);
      // Estimación aproximada: 22050 Hz * 2 bytes * 1 canal
      const estimatedDuration = stats.size / (22050 * 2);
      return Math.round(estimatedDuration * 10) / 10;
    } catch (error) {
      return 0;
    }
  }

  getLanguageCode(language) {
    const langMap = {
      'es': 'es',
      'es-es': 'es',
      'es-mx': 'es',
      'es-ar': 'es',
      'en': 'en',
      'en-us': 'en',
      'en-gb': 'en',
      'fr': 'fr',
      'de': 'de',
      'it': 'it',
      'pt': 'pt'
    };
    
    return langMap[language.toLowerCase()] || 'es';
  }

  // Método de compatibilidad
  async generateDemoAudio(text, outputPath) {
    console.log('⚠️ Generando audio de demo...');
    // Crear un archivo de audio vacío/mínimo
    await fs.writeFile(outputPath, Buffer.from('DEMO'));
  }
}

module.exports = VoiceService;
