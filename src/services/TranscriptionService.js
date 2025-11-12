const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");

class TranscriptionService {
  constructor() {
    this.whisperUrl = process.env.WHISPER_SERVICE_URL || "http://localhost:5001";
  }

  async transcribe(audioPath, options = {}) {
    try {
      console.log("Iniciando transcripción con Whisper local...");
      
      if (!await fs.pathExists(audioPath)) {
        throw new Error("Archivo de audio no encontrado");
      }

      const audioStats = await fs.stat(audioPath);
      console.log(`Tamaño del audio: ${Math.round(audioStats.size / 1024 / 1024)}MB`);

      // Verificar servicio Whisper con timeout más largo
      try {
        console.log(`Verificando servicio Whisper en ${this.whisperUrl}...`);
        await axios.get(`${this.whisperUrl}/health`, { timeout: 10000 });
        console.log("✅ Servicio Whisper disponible");
      } catch (error) {
        console.error("❌ Error conectando a Whisper:", error.message);
        throw new Error(`Servicio Whisper local no disponible en ${this.whisperUrl}. Asegúrate de que el servicio Python esté corriendo.`);
      }

      const formData = new FormData();
      formData.append("audio", fs.createReadStream(audioPath));
      if (options.language) {
        formData.append("language", options.language);
      }

      console.log("Enviando audio al servicio Whisper local...");
      const response = await axios.post(`${this.whisperUrl}/transcribe`, formData, {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 300000 // 5 minutos para archivos grandes
      });

      const result = response.data;
      console.log(`Transcripci�n completada: ${result.language}`);

      return {
        text: result.text,
        language: result.language || "desconocido",
        duration: result.duration || 0,
        segments: result.segments || [],
        confidence: result.confidence || 0
      };

    } catch (error) {
      console.error("Error en transcripci�n:", error);
      throw new Error(`Error de transcripci�n: ${error.message}`);
    }
  }
}

module.exports = TranscriptionService;
