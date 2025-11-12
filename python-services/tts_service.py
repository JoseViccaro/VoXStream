"""
Servicio de síntesis de voz local usando TTS (Coqui)
Expone un endpoint HTTP simple para generar audio desde texto
"""

from flask import Flask, request, jsonify, send_file
from TTS.api import TTS
import os
import logging
import tempfile

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

# Cargar modelo TTS
# Opciones populares:
# - tts_models/es/css10/vits (español, rápido)
# - tts_models/multilingual/multi-dataset/xtts_v2 (multilingüe, alta calidad)
MODEL_NAME = os.getenv('TTS_MODEL', 'tts_models/es/css10/vits')

print(f"🗣️ Cargando modelo TTS '{MODEL_NAME}'...")
tts = TTS(MODEL_NAME)
print("✅ Modelo TTS cargado")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model': MODEL_NAME})

@app.route('/synthesize', methods=['POST'])
def synthesize():
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'No se proporcionó texto'}), 400
        
        text = data['text']
        language = data.get('language', 'es')
        
        logging.info(f"🎵 Generando audio para: '{text[:50]}...'")
        
        # Crear archivo temporal
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
        output_path = temp_file.name
        temp_file.close()
        
        # Generar audio
        tts.tts_to_file(
            text=text,
            file_path=output_path
        )
        
        logging.info(f"✅ Audio generado: {output_path}")
        
        # Enviar archivo
        return send_file(
            output_path,
            mimetype='audio/wav',
            as_attachment=True,
            download_name='speech.wav'
        )
        
    except Exception as e:
        logging.error(f"❌ Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/synthesize-to-file', methods=['POST'])
def synthesize_to_file():
    try:
        data = request.get_json()
        
        if not data or 'text' not in data or 'output_path' not in data:
            return jsonify({'error': 'Faltan parámetros'}), 400
        
        text = data['text']
        output_path = data['output_path']
        
        logging.info(f"🎵 Generando audio en: {output_path}")
        
        # Generar audio
        tts.tts_to_file(
            text=text,
            file_path=output_path
        )
        
        file_size = os.path.getsize(output_path)
        
        logging.info(f"✅ Audio generado: {file_size} bytes")
        
        return jsonify({
            'audioPath': output_path,
            'fileSize': file_size,
            'format': 'wav'
        })
        
    except Exception as e:
        logging.error(f"❌ Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.getenv('TTS_PORT', 5002))
    print(f"🚀 Servicio TTS iniciado en http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)
