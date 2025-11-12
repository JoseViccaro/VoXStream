const { spawn, exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

class VideoProcessor {
  constructor() {
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;
    
    try {
      // Verificar que FFmpeg esté instalado usando child_process
      await new Promise((resolve, reject) => {
        exec('ffmpeg -version', (error, stdout, stderr) => {
          if (error) {
            reject(new Error('FFmpeg no está disponible. Asegúrate de que esté instalado.'));
          } else {
            resolve(stdout);
          }
        });
      });

      this.isInitialized = true;
      console.log('✅ FFmpeg inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando FFmpeg:', error);
      throw new Error('No se pudo inicializar FFmpeg: ' + error.message);
    }
  }

  async extractAudio(videoPath, jobId) {
    try {
      await this.init();

      const outputFileName = `audio_${jobId}.wav`;
      const outputPath = path.join(__dirname, '../../temp', outputFileName);

      console.log('🎵 Extrayendo audio del video...');

      return new Promise((resolve, reject) => {
        const ffmpegArgs = [
          '-i', videoPath,
          '-vn',                    // Sin video
          '-acodec', 'pcm_s16le',  // Codec sin comprimir
          '-ar', '16000',          // 16kHz optimizado para speech-to-text
          '-ac', '1',              // Mono
          '-f', 'wav',             // Formato WAV
          outputPath
        ];

        console.log('🔧 Comando FFmpeg:', 'ffmpeg', ffmpegArgs.join(' '));

        const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

        ffmpegProcess.stderr.on('data', (data) => {
          const output = data.toString();
          if (output.includes('time=')) {
            console.log('⏳ Procesando...');
          }
        });

        ffmpegProcess.on('close', (code) => {
          if (code === 0) {
            console.log(`✅ Audio extraído: ${outputPath}`);
            resolve(outputPath);
          } else {
            reject(new Error(`FFmpeg falló con código ${code}`));
          }
        });

        ffmpegProcess.on('error', (err) => {
          console.error('❌ Error FFmpeg:', err);
          reject(new Error(`Error extrayendo audio: ${err.message}`));
        });
      });

    } catch (error) {
      console.error('❌ Error extrayendo audio:', error);
      throw new Error(`Error extrayendo audio: ${error.message}`);
    }
  }

  async combineAudioVideo(videoPath, audioPath, jobId) {
    try {
      await this.init();

      // Validar que las rutas son strings
      if (typeof videoPath !== 'string') {
        throw new Error(`Ruta de video inválida. Recibido: ${typeof videoPath}, esperado: string`);
      }
      if (typeof audioPath !== 'string') {
        throw new Error(`Ruta de audio inválida. Recibido: ${typeof audioPath}, esperado: string`);
      }

      // Verificar que los archivos de entrada existen
      if (!fs.existsSync(videoPath)) {
        throw new Error(`Archivo de video no encontrado: ${videoPath}`);
      }
      if (!fs.existsSync(audioPath)) {
        throw new Error(`Archivo de audio no encontrado: ${audioPath}`);
      }

      const finalOutputPath = path.join(__dirname, '../../output', `${jobId}-doblado.mp4`);

      // Crear directorio de salida si no existe
      await fs.ensureDir(path.dirname(finalOutputPath));

      console.log('🎬 Combinando audio y video...');
      console.log('📹 Video entrada:', videoPath);
      console.log('🎵 Audio entrada:', audioPath);
      console.log('🎯 Salida:', finalOutputPath);

      return new Promise((resolve, reject) => {
      // Usar el audio traducido sin intentar rellenarlo ni cortar el video
      // El video continuará sin audio después de que termine el audio traducido
      const ffmpegArgs = [
        '-i', videoPath,
        '-i', audioPath,
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-ar', '44100',
        '-map', '0:v',
        '-map', '1:a',
        '-y',
        finalOutputPath
      ];

        console.log('🔧 Comando FFmpeg:', 'ffmpeg', ffmpegArgs.join(' '));

        const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);
        let ffmpegOutput = '';
        let ffmpegError = '';

        ffmpegProcess.stdout.on('data', (data) => {
          ffmpegOutput += data.toString();
        });

        ffmpegProcess.stderr.on('data', (data) => {
          const output = data.toString();
          ffmpegError += output;
          
          if (output.includes('time=')) {
            console.log('⏳ Combinando...');
          }
          if (output.includes('error') || output.includes('Error')) {
            console.error('⚠️ FFmpeg error output:', output);
          }
        });

        ffmpegProcess.on('close', (code) => {
          if (code === 0) {
            console.log(`✅ Video final creado: ${finalOutputPath}`);
            resolve(finalOutputPath);
          } else {
            console.error('❌ FFmpeg falló. Salida completa:');
            console.error('stdout:', ffmpegOutput);
            console.error('stderr:', ffmpegError);
            console.error('Archivos de entrada:');
            console.error('- Video:', videoPath, 'existe:', fs.existsSync(videoPath));
            console.error('- Audio:', audioPath, 'existe:', fs.existsSync(audioPath));
            
            // Intentar método de fallback más simple
            console.log('🔄 Intentando método de combinación alternativo...');
            this.combineAudioVideoSimple(videoPath, audioPath, finalOutputPath)
              .then(resolve)
              .catch(reject);
          }
        });

        ffmpegProcess.on('error', (err) => {
          console.error('❌ Error ejecutando FFmpeg:', err);
          reject(new Error(`Error ejecutando FFmpeg: ${err.message}. Asegúrate de que FFmpeg esté instalado.`));
        });
      });

    } catch (error) {
      console.error('❌ Error combinando audio y video:', error);
      throw new Error(`Error combinando archivos: ${error.message}`);
    }
  }

  async getVideoInfo(videoPath) {
    try {
      await this.init();
      
      return new Promise((resolve, reject) => {
        const ffprobeArgs = [
          '-v', 'quiet',
          '-print_format', 'json',
          '-show_format',
          '-show_streams',
          videoPath
        ];

        const ffprobeProcess = spawn('ffprobe', ffprobeArgs);
        let outputData = '';

        ffprobeProcess.stdout.on('data', (data) => {
          outputData += data.toString();
        });

        ffprobeProcess.on('close', (code) => {
          if (code === 0) {
            try {
              const metadata = JSON.parse(outputData);
              const video = metadata.streams.find(stream => stream.codec_type === 'video');
              const audio = metadata.streams.find(stream => stream.codec_type === 'audio');
              
              resolve({
                duration: metadata.format.duration,
                size: metadata.format.size,
                bitrate: metadata.format.bit_rate,
                video: video ? {
                  codec: video.codec_name,
                  width: video.width,
                  height: video.height,
                  fps: video.r_frame_rate ? eval(video.r_frame_rate) : 30
                } : null,
                audio: audio ? {
                  codec: audio.codec_name,
                  channels: audio.channels,
                  sampleRate: audio.sample_rate
                } : null
              });
            } catch (parseError) {
              reject(new Error(`Error parsing ffprobe output: ${parseError.message}`));
            }
          } else {
            reject(new Error(`FFprobe falló con código ${code}`));
          }
        });

        ffprobeProcess.on('error', (err) => {
          reject(new Error(`Error ejecutando ffprobe: ${err.message}`));
        });
      });
    } catch (error) {
      console.error('❌ Error obteniendo info del video:', error);
      throw error;
    }
  }

  async optimizeForStreaming(inputPath, outputPath) {
    try {
      await this.init();

      console.log('🚀 Optimizando video para streaming web...');

      return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .videoCodec('libx264')
          .audioCodec('aac')
          .videoBitrate('1000k')
          .audioBitrate('128k')
          .outputOptions([
            '-preset fast',           // Velocidad de encoding
            '-crf 23',               // Calidad (0-51, menor = mejor)
            '-movflags +faststart'   // Optimización para streaming web
          ])
          .on('start', (commandLine) => {
            console.log('🔧 Comando FFmpeg:', commandLine);
          })
          .on('progress', (progress) => {
            if (progress.percent) {
              console.log(`⏳ Progreso optimización: ${Math.round(progress.percent)}%`);
            }
          })
          .on('end', () => {
            console.log('✅ Video optimizado para streaming');
            resolve(outputPath);
          })
          .on('error', (err) => {
            console.error('❌ Error optimizando video:', err);
            reject(new Error(`Error optimizando video: ${err.message}`));
          })
          .save(outputPath);
      });

    } catch (error) {
      console.error('❌ Error optimizando video:', error);
      throw error;
    }
  }

  async combineAudioVideoSimple(videoPath, audioPath, outputPath) {
    return new Promise((resolve, reject) => {
      // Comando FFmpeg simple que reemplaza el audio completamente
      // Sin intentar rellenar audio con silencio para evitar procesamiento muy lento
      const simpleArgs = [
        '-i', videoPath,
        '-i', audioPath,
        '-c:v', 'copy',          // Copiar video sin recodificar
        '-c:a', 'aac',           // Codec AAC para audio
        '-b:a', '192k',          // Bitrate alto
        '-map', '0:v',           // Solo video del primer input
        '-map', '1:a',           // Solo audio del segundo input
        '-y',
        outputPath
      ];

      console.log('🔧 Usando comando FFmpeg simplificado');
      
      const ffmpegProcess = spawn('ffmpeg', simpleArgs);
      let errorOutput = '';

      ffmpegProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      ffmpegProcess.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Video creado con método alternativo: ${outputPath}`);
          resolve(outputPath);
        } else {
          console.error('❌ Método alternativo también falló:', errorOutput);
          reject(new Error(`Ambos métodos FFmpeg fallaron. Código: ${code}`));
        }
      });

      ffmpegProcess.on('error', (err) => {
        reject(new Error(`Error ejecutando FFmpeg alternativo: ${err.message}`));
      });
    });
  }
}

module.exports = VideoProcessor;