# 🚀 Configuración Rápida - VoXStream

## ⏰ 5 MINUTOS PARA VOZ NATURAL Y TRADUCCIÓN REAL

### 🎯 Paso 1: OpenAI (Whisper) - GRATIS
```
1. 🌐 Ve a: https://platform.openai.com/signup
2. 📧 Crea cuenta con email
3. 🔑 Ve a: https://platform.openai.com/api-keys  
4. ➕ Clic "Create new secret key"
5. 📋 Copia la clave (sk-...)
```

### 🎯 Paso 2: Google Cloud - GRATIS  
```
1. 🌐 Ve a: https://console.cloud.google.com
2. 🆓 Clic "Free Trial" (pide tarjeta, NO cobra)
3. 📁 Crear proyecto nuevo
4. 🔧 Habilitar APIs:
   • Busca "Cloud Translation API" → Enable
   • Busca "Text-to-Speech API" → Enable
5. 🔑 Crear API Key:
   • "APIs & Services" → "Credentials" 
   • "Create Credentials" → "API Key"
   • Copia la clave
```

### 🎯 Paso 3: Configurar .env
Edita el archivo `.env` en tu carpeta VoXStream:

```env
# Pega tu clave de OpenAI aquí (empieza con sk-)
OPENAI_API_KEY=sk-tu-clave-de-openai-aqui

# Pega tu clave de Google aquí
GOOGLE_TRANSLATE_API_KEY=tu-clave-de-google-aqui

# Configuración básica
PORT=3000
NODE_ENV=development
MAX_FILE_SIZE=2147483648
```

### 🎯 Paso 4: Reiniciar
```bash
npm start
```

## 🎁 ¿Qué consigues GRATIS?

### OpenAI - $5 USD gratis
- ✅ **5 horas** de audio transcrito
- ✅ **Precisión perfecta** con Whisper
- ✅ **Múltiples idiomas** detectados automáticamente

### Google Cloud - $300 USD + Permanente
- ✅ **$300 USD** por 90 días
- ✅ **500,000 caracteres/mes** traducción (PARA SIEMPRE)
- ✅ **4M caracteres/mes** text-to-speech (PARA SIEMPRE)
- ✅ **Voces neurales** super naturales

## 🎤 Voces Naturales Incluidas

Con Google TTS obtienes:
- 🇪🇸 **Voces neurales españolas** (hombre/mujer)
- 🎭 **Entonación natural** 
- 🎵 **Calidad studio**
- ⚡ **Generación rápida**

## 💡 Consejos

1. **Usa email diferente** si ya agotaste créditos
2. **Guarda las claves** en lugar seguro  
3. **No compartas** las API keys públicamente
4. **Revisa costos** después del período gratuito

## 🎊 Resultado

¡Doblaje automático profesional con:
- ✅ Transcripción perfecta
- ✅ Traducción precisa  
- ✅ Voz natural y clara
- ✅ Videos hasta 2GB

---

**¿Problemas?** Abre el archivo `APIS-GRATUITAS.md` para más detalles.