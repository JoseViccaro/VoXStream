"""
Servicio de síntesis de voz usando edge-tts (voces naturales de Microsoft)
"""

from flask import Flask, request, jsonify
import edge_tts
import asyncio
import os
import subprocess

app = Flask(__name__)

print("✅ Motor TTS inicializado (edge-tts)")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'engine': 'edge-tts'})

@app.route('/synthesize-to-file', methods=['POST'])
def synthesize_to_file():
    data = request.json
    text = data.get('text')
    output_path = data.get('output_path')
    language = data.get('language', 'es')
    target_duration = data.get('target_duration', None)
    
    if not text or not output_path:
        return jsonify({'error': 'Se requiere text y output_path'}), 400
    
    try:
        # Crear directorio si no existe
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        print(f"🎵 Generando audio con edge-tts: {text[:50]}...")
        
        # Seleccionar voz de narrador profesional (voice-over) según idioma
        voice = "es-ES-ElviraNeural"  # Voz femenina profesional en español (España)
        if language == 'es':
            # Voces profesionales de narración en español (más naturales y claras)
            voices = [
                "es-ES-ElviraNeural",    # Mujer profesional, España - Excelente para narración
                "es-MX-DaliaNeural",     # Mujer profesional, México - Clara y natural
                "es-US-AlonsoNeural"     # Hombre profesional, US - Estilo documentales
            ]
            voice = voices[0]  # Usar voz femenina profesional por defecto
        elif language == 'en':
            voice = "en-US-JennyNeural"  # Mujer profesional, inglés estadounidense
        
        # Calcular rate (velocidad) basado en duración objetivo
        # Incrementar velocidad base para narración más dinámica
        rate = "+15%"  # Velocidad un 15% más rápida por defecto (más natural para voice-over)
        
        if target_duration:
            # Estimar duración base (aproximadamente 160 palabras por minuto para voz más rápida)
            word_count = len(text.split())
            estimated_duration = (word_count / 160) * 60  # en segundos (ajustado para velocidad mayor)
            
            # Calcular ajuste de velocidad necesario
            if estimated_duration > 0:
                speed_ratio = estimated_duration / target_duration
                
                # Convertir a porcentaje para edge-tts
                # Añadir el 15% base de velocidad al ajuste calculado
                rate_percent = int((speed_ratio - 1) * 100) + 15
                
                # Limitar el rate a rangos razonables (-30% a +100%)
                # Para voice-over preferimos velocidades más altas
                rate_percent = max(-30, min(100, rate_percent))
                
                rate = f"+{rate_percent}%" if rate_percent >= 0 else f"{rate_percent}%"
                
                print(f"📊 Palabras: {word_count}, Duración objetivo: {target_duration:.1f}s")
                print(f"📊 Duración estimada: {estimated_duration:.1f}s, Rate: {rate}")
        
        # Generar audio con edge-tts
        temp_mp3 = output_path + ".temp.mp3"
        
        async def generate():
            communicate = edge_tts.Communicate(text, voice, rate=rate)
            await communicate.save(temp_mp3)
        
        # Ejecutar generación asíncrona
        asyncio.run(generate())
        
        print(f"✅ Audio generado: {temp_mp3}")
        
        # Convertir MP3 a WAV con FFmpeg para mejor compatibilidad
        try:
            print(f"🔧 Convirtiendo a WAV con FFmpeg...")
            
            ffmpeg_cmd = [
                'ffmpeg',
                '-i', temp_mp3,
                '-ar', '44100',      # Sample rate 44.1kHz
                '-ac', '2',          # Estéreo
                '-b:a', '192k',      # Bitrate alto
                '-y',
                output_path
            ]
            
            result = subprocess.run(
                ffmpeg_cmd,
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                # Eliminar archivo temporal MP3
                os.remove(temp_mp3)
                print(f"✅ Conversión completada: {output_path}")
            else:
                print(f"⚠️ Error en conversión, usando MP3 original")
                os.rename(temp_mp3, output_path)
        except Exception as e:
            print(f"⚠️ Error en conversión: {e}, usando MP3 original")
            if os.path.exists(temp_mp3):
                os.rename(temp_mp3, output_path)
        
        return jsonify({
            'success': True,
            'audio_path': output_path,
            'duration': 0
        })
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('TTS_PORT', 5002))
    print(f"🚀 Servicio TTS (edge-tts) iniciado en http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
