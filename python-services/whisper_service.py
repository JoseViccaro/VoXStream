"""
Servicio de transcripción local usando Faster-Whisper
Expone un endpoint HTTP simple para transcribir audio
"""

from flask import Flask, request, jsonify
from faster_whisper import WhisperModel
import os
import logging
import tempfile

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

# Cargar modelo Whisper (base es un buen balance entre velocidad y precisión)
# Opciones: tiny, base, small, medium, large-v2, large-v3
MODEL_SIZE = os.getenv('WHISPER_MODEL', 'base')
DEVICE = 'cpu'  # Cambiar a 'cuda' si tienes GPU NVIDIA

print(f"🎤 Cargando modelo Whisper '{MODEL_SIZE}'...")
model = WhisperModel(MODEL_SIZE, device=DEVICE, compute_type="int8")
print("✅ Modelo Whisper cargado")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model': MODEL_SIZE, 'device': DEVICE})

@app.route('/transcribe', methods=['POST'])
def transcribe():
    try:
        # Verificar que se envió un archivo
        if 'audio' not in request.files:
            return jsonify({'error': 'No se envió archivo de audio'}), 400
        
        audio_file = request.files['audio']
        language = request.form.get('language', None)  # None = detección automática
        
        # Guardar temporalmente usando tempfile para compatibilidad multiplataforma
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio_file.filename)[1]) as temp_file:
            temp_path = temp_file.name
            audio_file.save(temp_path)
        
        logging.info(f"📝 Transcribiendo archivo: {audio_file.filename}")
        
        # Transcribir
        segments, info = model.transcribe(
            temp_path, 
            language=language,
            beam_size=5,
            vad_filter=True,  # Filtro de detección de voz
            vad_parameters=dict(min_silence_duration_ms=500)
        )
        
        # Recopilar resultados
        full_text = ""
        segment_list = []
        
        for segment in segments:
            full_text += segment.text + " "
            segment_list.append({
                'start': segment.start,
                'end': segment.end,
                'text': segment.text,
                'confidence': segment.avg_logprob
            })
        
        # Limpiar archivo temporal
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        logging.info(f"✅ Transcripción completada: {info.language} ({len(segment_list)} segmentos)")
        
        return jsonify({
            'text': full_text.strip(),
            'language': info.language,
            'duration': info.duration,
            'segments': segment_list,
            'confidence': sum([s['confidence'] for s in segment_list]) / len(segment_list) if segment_list else 0
        })
        
    except Exception as e:
        logging.error(f"❌ Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    try:
        port = int(os.getenv('WHISPER_PORT', 5001))
        print(f"🚀 Servicio Whisper iniciado en http://localhost:{port}")
        app.run(host='0.0.0.0', port=port, debug=False, threaded=True)
    except Exception as e:
        logging.error(f"❌ Error fatal al iniciar servidor: {str(e)}")
        import traceback
        traceback.print_exc()
        input("Presiona Enter para salir...")
