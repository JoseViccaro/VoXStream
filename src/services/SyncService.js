const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

class SyncService {
  constructor() {
    this.ttsUrl = process.env.TTS_SERVICE_URL || 'http://localhost:5002';
  }

  /**
   * Genera audio sincronizado segmento por segmento usando timestamps de Whisper
   * Cada segmento de traducción se posiciona exactamente donde estaba el original
   */
  async generateSyncedAudio(segments, translatedText, jobId, totalDuration, language = 'es') {
    try {
      console.log(`🔄 Sincronizando audio por segmentos (${segments.length} segmentos, duración: ${totalDuration.toFixed(2)}s)`);
      
      const tempDir = path.join(__dirname, '../../temp');
      await fs.ensureDir(tempDir);

      // Dividir el texto traducido en partes proporcionales a los segmentos originales
      const translatedSegments = this.distributeTranslationToSegments(segments, translatedText);
      
      console.log(`📋 ${translatedSegments.length} segmentos únicos para generar`);
      
      // Generar audio para cada segmento
      const audioSegments = [];
      for (let i = 0; i < translatedSegments.length; i++) {
        const segment = translatedSegments[i];
        console.log(`🎤 Segmento ${i + 1}/${translatedSegments.length} [${segment.start.toFixed(1)}s-${segment.end.toFixed(1)}s]: "${segment.text.substring(0, 40)}..."`);
        
        const segmentPath = path.join(tempDir, `segment_${jobId}_${i}.wav`);
        
        // Calcular duración objetivo para este segmento
        const segmentDuration = segment.end - segment.start;
        
        try {
          await this.generateSegmentAudio(segment.text, segmentPath, language, segmentDuration);
          
          audioSegments.push({
            path: segmentPath,
            startTime: segment.start,
            endTime: segment.end,
            duration: segmentDuration
          });
        } catch (error) {
          console.error(`⚠️ Error en segmento ${i + 1}:`, error.message);
          // Continuar con el siguiente segmento
        }
      }
      
      if (audioSegments.length === 0) {
        throw new Error('No se pudo generar ningún segmento de audio');
      }
      
      console.log(`✅ ${audioSegments.length} segmentos generados, combinando con timestamps...`);
      
      // Combinar todos los segmentos con sus timestamps
      const outputPath = path.join(tempDir, `voice_${jobId}.wav`);
      await this.combineSegmentsWithTimestamps(audioSegments, outputPath, totalDuration);
      
      // Limpiar archivos temporales de segmentos
      for (const segment of audioSegments) {
        await fs.remove(segment.path).catch(() => {});
      }
      
      console.log(`✅ Audio sincronizado completo: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('❌ Error generando audio sincronizado:', error);
      throw error;
    }
  }

  /**
   * Distribuye el texto traducido entre los segmentos originales
   */
  distributeTranslationToSegments(originalSegments, translatedText) {
    // Dividir traducción en oraciones
    const sentences = translatedText.match(/[^.!?]+[.!?]+/g) || [translatedText];
    
    const result = [];
    const segmentsPerSentence = Math.ceil(originalSegments.length / sentences.length);
    
    let sentenceIndex = 0;
    for (let i = 0; i < originalSegments.length; i++) {
      const segment = originalSegments[i];
      
      // Asignar oración correspondiente
      const currentSentence = sentences[Math.min(sentenceIndex, sentences.length - 1)];
      
      result.push({
        text: currentSentence.trim(),
        start: segment.start,
        end: segment.end,
        originalText: segment.text
      });
      
      // Avanzar a la siguiente oración cada N segmentos
      if ((i + 1) % segmentsPerSentence === 0 && sentenceIndex < sentences.length - 1) {
        sentenceIndex++;
      }
    }
    
    // Eliminar duplicados consecutivos y combinar sus tiempos
    const deduplicated = [];
    for (let i = 0; i < result.length; i++) {
      if (i === 0 || result[i].text !== result[i - 1].text) {
        deduplicated.push(result[i]);
      } else {
        // Extender el tiempo del segmento anterior
        deduplicated[deduplicated.length - 1].end = result[i].end;
      }
    }
    
    return deduplicated;
  }

  /**
   * Genera audio para un segmento específico
   */
  async generateSegmentAudio(text, outputPath, language, targetDuration) {
    try {
      const response = await axios.post(`${this.ttsUrl}/synthesize-to-file`, {
        text: text,
        output_path: outputPath,
        language: language,
        target_duration: targetDuration
      }, {
        timeout: 60000
      });

      // Esperar a que el archivo esté disponible
      let retries = 0;
      while (!await fs.pathExists(outputPath) && retries < 30) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }

      if (!await fs.pathExists(outputPath)) {
        throw new Error('Archivo de audio no generado');
      }

      return response.data;
    } catch (error) {
      throw new Error(`Error generando audio: ${error.message}`);
    }
  }

  /**
   * Combina segmentos de audio posicionándolos en sus timestamps correctos
   */
  async combineSegmentsWithTimestamps(audioSegments, outputPath, totalDuration) {
    return new Promise((resolve, reject) => {
      try {
        // Crear filtro complejo de FFmpeg para posicionar cada segmento
        const inputs = [];
        const filterParts = [];
        
        // Añadir cada segmento como input
        for (let i = 0; i < audioSegments.length; i++) {
          inputs.push('-i', audioSegments[i].path);
          
          // Crear delay para posicionar el segmento en su timestamp
          const delayMs = Math.floor(audioSegments[i].startTime * 1000);
          filterParts.push(`[${i}:a]adelay=${delayMs}|${delayMs}[a${i}]`);
        }
        
        // Mezclar todos los segmentos
        const mixInputs = audioSegments.map((_, i) => `[a${i}]`).join('');
        const filterComplex = filterParts.join(';') + `;${mixInputs}amix=inputs=${audioSegments.length}:duration=longest[out]`;
        
        const args = [
          ...inputs,
          '-filter_complex', filterComplex,
          '-map', '[out]',
          '-t', totalDuration.toString(),
          '-ar', '44100',
          '-ac', '2',
          '-y',
          outputPath
        ];
        
        console.log('🔧 Combinando segmentos con FFmpeg...');
        
        const ffmpegProcess = spawn('ffmpeg', args);
        let errorOutput = '';
        
        ffmpegProcess.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });
        
        ffmpegProcess.on('close', (code) => {
          if (code === 0) {
            console.log('✅ Segmentos combinados correctamente');
            resolve(outputPath);
          } else {
            console.error('❌ Error en FFmpeg:', errorOutput.substring(0, 500));
            reject(new Error(`FFmpeg falló con código ${code}`));
          }
        });
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtiene la duración de un archivo de audio
   */
  async getAudioDuration(audioPath) {
    return new Promise((resolve, reject) => {
      const args = [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        audioPath
      ];
      
      const ffprobeProcess = spawn('ffprobe', args);
      let output = '';
      
      ffprobeProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      ffprobeProcess.on('close', (code) => {
        if (code === 0) {
          const duration = parseFloat(output.trim());
          resolve(duration);
        } else {
          reject(new Error('No se pudo obtener la duración'));
        }
      });
    });
  }
}

module.exports = SyncService;
