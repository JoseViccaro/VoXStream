"""
Servicio de síntesis de voz local usando pyttsx3
Compatible con Python 3.13
"""

from flask import Flask, request, jsonify
import pyttsx3
import os
import threading
import subprocess
import tempfile

app = Flask(__name__)

# Lock para evitar problemas de concurrencia
tts_lock = threading.Lock()

print("✅ Motor TTS inicializado (pyttsx3)")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'engine': 'pyttsx3'})

@app.route('/synthesize-to-file', methods=['POST'])
def synthesize_to_file():
    data = request.json
    text = data.get('text')
    output_path = data.get('output_path')
    language = data.get('language', 'en')
    target_duration = data.get('target_duration', None)  # Duración objetivo en segundos
    
    if not text or not output_path:
        return jsonify({'error': 'Se requiere text y output_path'}), 400
    
    try:
        # Crear directorio si no existe
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        print(f"🎵 Generando audio: {text[:50]}...")
        
        # Calcular velocidad óptima si tenemos duración objetivo
        speech_rate = 140  # Velocidad por defecto
        
        if target_duration:
            # Estimar palabras por minuto necesarias
            word_count = len(text.split())
            target_minutes = target_duration / 60.0
            target_wpm = word_count / target_minutes if target_minutes > 0 else 150
            
            # Convertir WPM a rate de pyttsx3 (aproximación: rate ≈ WPM * 0.95)
            speech_rate = int(target_wpm * 0.95)
            
            # Limitar el rate a rangos razonables (80-250)
            # Menos de 80 es muy lento, más de 250 es ininteligible
            speech_rate = max(80, min(250, speech_rate))
            
            print(f"📊 Palabras: {word_count}, Duración objetivo: {target_duration:.1f}s")
            print(f"📊 WPM objetivo: {target_wpm:.1f}, Rate TTS: {speech_rate}")
        
        # Usar lock para evitar problemas de concurrencia
        with tts_lock:
            # Inicializar TTS engine
            engine = pyttsx3.init()
            
            # Configurar velocidad calculada
            engine.setProperty('rate', speech_rate)
            engine.setProperty('volume', 1.0)
            
            # Configurar voz según idioma
            voices = engine.getProperty('voices')
            
            # Buscar mejor voz para español
            if language == 'es':
                # Intentar encontrar voz en español
                spanish_voice = None
                for voice in voices:
                    if 'spanish' in voice.name.lower() or 'español' in voice.name.lower():
                        spanish_voice = voice.id
                        break
                
                if spanish_voice:
                    engine.setProperty('voice', spanish_voice)
                    print(f"🎤 Usando voz en español")
                elif len(voices) > 1:
                    engine.setProperty('voice', voices[1].id)
                    print(f"🎤 Usando voz alternativa")
            elif len(voices) > 0:
                engine.setProperty('voice', voices[0].id)
            
            # Generar audio
            engine.save_to_file(text, output_path)
            engine.runAndWait()
        
        print(f"✅ Audio generado: {output_path}")
        
        # Mejorar calidad del audio con FFmpeg
        # Convertir a 44.1kHz estéreo con mejor bitrate
        temp_path = output_path + ".temp.wav"
        try:
            print(f"🔧 Mejorando calidad del audio con FFmpeg...")
            
            # Usar FFmpeg para mejorar la calidad del audio
            ffmpeg_cmd = [
                'ffmpeg',
                '-i', output_path,
                '-ar', '44100',      # Sample rate 44.1kHz (estándar de calidad)
                '-ac', '2',          # Estéreo
                '-b:a', '192k',      # Bitrate alto
                '-y',
                temp_path
            ]
            
            result = subprocess.run(
                ffmpeg_cmd,
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                # Reemplazar el archivo original con el mejorado
                os.replace(temp_path, output_path)
                print(f"✅ Calidad del audio mejorada")
            else:
                print(f"⚠️ No se pudo mejorar la calidad, usando audio original")
                if os.path.exists(temp_path):
                    os.remove(temp_path)
        except Exception as e:
            print(f"⚠️ Error mejorando calidad: {e}, usando audio original")
            if os.path.exists(temp_path):
                os.remove(temp_path)
        
        return jsonify({
            'success': True,
            'audio_path': output_path,
            'duration': 0
        })
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Servicio TTS iniciado en http://localhost:5002")
    app.run(host='0.0.0.0', port=5002, debug=False)
