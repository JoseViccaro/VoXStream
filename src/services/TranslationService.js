const axios = require('axios');

class TranslationService {
  constructor() {
    // Usar Ollama local para traducción
    this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'llama3.2:1b';
  }

  async translate(text, targetLanguage = 'es', sourceLanguage = 'auto') {
    try {
      console.log(`🌐 Traduciendo texto a ${targetLanguage} con Ollama...`);
      
      // Extraer texto si es un objeto de transcripción
      let textToTranslate = text;
      if (typeof text === 'object' && text.text) {
        textToTranslate = text.text;
      }
      
      console.log(`📝 Texto original: "${textToTranslate.substring(0, 100)}..."`);
      console.log(`📏 Longitud del texto: ${textToTranslate.length} caracteres`);
      
      // Validar entrada
      if (!textToTranslate || textToTranslate.trim().length === 0) {
        throw new Error('Texto vacío para traducir');
      }

      // Si el texto es muy largo (>1500 caracteres), dividir en chunks
      if (textToTranslate.length > 1500) {
        console.log('📦 Texto largo detectado, dividiendo en chunks para mejor rendimiento...');
        return await this.translateInChunks(textToTranslate, targetLanguage, sourceLanguage);
      }

      // Verificar que Ollama está disponible
      try {
        await axios.get(`${this.ollamaUrl}/api/tags`, { timeout: 5000 });
      } catch (error) {
        throw new Error('Servicio Ollama no disponible. Instala Ollama desde: https://ollama.com');
      }

      // Preparar prompt para traducción
      const languageNames = {
        'es': 'español',
        'en': 'inglés',
        'fr': 'francés',
        'de': 'alemán',
        'it': 'italiano',
        'pt': 'portugués',
        'ja': 'japonés',
        'zh': 'chino'
      };

      const targetLangName = languageNames[targetLanguage] || targetLanguage;
      
      // Prompt más estricto y directo para que el modelo pequeño entienda mejor
      const prompt = `Eres un traductor profesional. Tu ÚNICA tarea es traducir el texto a ${targetLangName}.

REGLAS IMPORTANTES:
1. Traduce TODO el texto palabra por palabra
2. NO agregues comentarios, explicaciones ni preguntas
3. NO respondas como chatbot
4. SOLO devuelve la traducción exacta

TEXTO A TRADUCIR:
${textToTranslate}

TRADUCCIÓN EN ${targetLangName.toUpperCase()}:`;

      // Llamar a Ollama con timeout
      console.log('📡 Enviando a Ollama...');
      const startTime = Date.now();
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,  // Muy baja temperatura para respuestas más consistentes
          top_p: 0.9,
          num_predict: 2000  // Limitar tokens de respuesta
        }
      }, {
        timeout: 180000  // 3 minutos de timeout para textos completos
      });
      
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`⏱️ Traducción completada en ${elapsedTime}s`);

      let translatedText = response.data.response.trim();
      
      // Limpiar respuestas del modelo que incluyen preámbulos comunes
      const cleanupPatterns = [
        /^(La traducción (al|en) \w+ es:?\s*)/i,
        /^(Traducción:?\s*)/i,
        /^(Aquí está la traducción:?\s*)/i,
        /^(Here is the translation:?\s*)/i,
        /^(\w+ translation:?\s*)/i
      ];
      
      for (const pattern of cleanupPatterns) {
        translatedText = translatedText.replace(pattern, '');
      }
      
      translatedText = translatedText.trim();
      
      // Validar que la traducción no esté vacía ni sea igual al original
      if (!translatedText || translatedText.length < 10) {
        console.warn('⚠️ Traducción muy corta o vacía, usando texto original');
        translatedText = textToTranslate;
      }
      
      console.log(`✅ Traducción completada: "${translatedText.substring(0, 100)}..."`);

      return {
        originalText: textToTranslate,
        translatedText: translatedText,
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
        confidence: 0.95, // Ollama no proporciona confianza
        quality: this.assessTranslationQuality(textToTranslate, translatedText, sourceLanguage, targetLanguage),
        wordCount: textToTranslate.split(/\s+/).length,
        charCount: textToTranslate.length
      };

    } catch (error) {
      console.error('❌ Error en traducción:', error);
      throw new Error(`Error de traducción: ${error.message}`);
    }
  }

  assessTranslationQuality(originalText, translatedText, sourceLang, targetLang) {
    const quality = {
      score: 85,
      rating: 'alta',
      notes: []
    };

    // Verificar que la traducción no esté vacía
    if (!translatedText || translatedText.length === 0) {
      quality.score = 0;
      quality.rating = 'baja';
      quality.notes.push('Traducción vacía');
      return quality;
    }

    // Verificar longitud relativa
    const lengthRatio = translatedText.length / originalText.length;
    if (lengthRatio < 0.3 || lengthRatio > 3) {
      quality.score -= 20;
      quality.notes.push('Longitud sospechosa de la traducción');
    }

    // Verificar que no sea idéntica al original (posible fallo)
    if (translatedText === originalText) {
      quality.score -= 30;
      quality.notes.push('La traducción es idéntica al original');
    }

    // Actualizar rating
    if (quality.score >= 80) quality.rating = 'alta';
    else if (quality.score >= 60) quality.rating = 'media';
    else quality.rating = 'baja';

    return quality;
  }

  // Métodos de compatibilidad
  async translateInChunks(text, targetLanguage, sourceLanguage) {
    // Para textos muy largos, dividir en chunks más pequeños
    console.log('🔄 Dividiendo texto en chunks para traducción...');
    
    // Dividir por oraciones para mantener contexto
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > 1000 && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }
    
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    console.log(`📦 Procesando ${chunks.length} chunks...`);
    const translations = [];
    
    for (let i = 0; i < chunks.length; i++) {
      console.log(`🔄 Traduciendo chunk ${i + 1}/${chunks.length}...`);
      try {
        const result = await this.translateSingleChunk(chunks[i], targetLanguage, sourceLanguage);
        translations.push(result.translatedText);
      } catch (error) {
        console.error(`❌ Error en chunk ${i + 1}:`, error.message);
        // Si falla un chunk, usar el original
        translations.push(chunks[i]);
      }
    }

    const finalTranslation = translations.join(' ');
    console.log(`✅ Traducción por chunks completada (${chunks.length} chunks procesados)`);

    return {
      originalText: text,
      translatedText: finalTranslation,
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
      chunksProcessed: chunks.length,
      confidence: 0.85,
      quality: this.assessTranslationQuality(text, finalTranslation, sourceLanguage, targetLanguage),
      wordCount: text.split(/\s+/).length,
      charCount: text.length
    };
  }

  async translateSingleChunk(text, targetLanguage, sourceLanguage) {
    const languageNames = {
      'es': 'español',
      'en': 'inglés',
      'fr': 'francés',
      'de': 'alemán',
      'it': 'italiano',
      'pt': 'portugués',
      'ja': 'japonés',
      'zh': 'chino'
    };

    const targetLangName = languageNames[targetLanguage] || targetLanguage;
    
    const prompt = `Traduce este texto a ${targetLangName}. Solo devuelve la traducción, sin explicaciones:

${text}

Traducción:`;

    const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
      model: this.model,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.1,
        top_p: 0.9,
        num_predict: 1000
      }
    }, {
      timeout: 90000  // 90 segundos por chunk
    });

    let translatedText = response.data.response.trim();
    
    // Limpiar respuestas del modelo
    const cleanupPatterns = [
      /^(La traducción (al|en) \w+ es:?\s*)/i,
      /^(Traducción:?\s*)/i,
      /^(Aquí está la traducción:?\s*)/i
    ];
    
    for (const pattern of cleanupPatterns) {
      translatedText = translatedText.replace(pattern, '');
    }
    
    return {
      originalText: text,
      translatedText: translatedText.trim()
    };
  }

  getDemoTranslation(text, targetLanguage) {
    return {
      originalText: text,
      translatedText: `[Traducción demo a ${targetLanguage}] ${text}`,
      sourceLanguage: 'auto',
      targetLanguage: targetLanguage,
      confidence: 0,
      quality: { score: 0, rating: 'demo' }
    };
  }
}

module.exports = TranslationService;
