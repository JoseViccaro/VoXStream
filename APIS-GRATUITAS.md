# 🎬 Guía de APIs Gratuitas para VoXStream

## 🚀 Configuración Rápida (5 minutos)

### 1. 🔑 OpenAI API - $5 USD GRATIS
**Para transcripción con Whisper (muy preciso)**

#### Pasos:
1. **Crear cuenta**: https://platform.openai.com/signup
2. **Verificar email** y completar registro
3. **Ir a API Keys**: https://platform.openai.com/api-keys  
4. **Crear nueva clave**: Clic en "Create new secret key"
5. **Copiar la clave**: Comienza con `sk-...` 
6. **Pegar en `.env`**:
   ```env
   OPENAI_API_KEY=sk-tu-clave-aqui
   ```

**💰 Créditos gratis**: $5 USD (suficiente para ~5 horas de audio)  
**💲 Precio después**: $0.006 por minuto (muy barato)

---

### 2. 🌐 Google Cloud - $300 USD GRATIS
**Para traducción y síntesis de voz**

#### Pasos:
1. **Ir a Google Cloud**: https://console.cloud.google.com
2. **Activar prueba gratuita** (requiere tarjeta, pero no te cobra)
3. **Crear nuevo proyecto** o usar el existente
4. **Habilitar APIs necesarias**:
   - Google Translate API
   - Text-to-Speech API
5. **Crear API Key**:
   - Ve a "APIs & Services" → "Credentials"
   - Clic "Create Credentials" → "API Key"
   - Copia la clave generada
6. **Pegar en `.env`**:
   ```env
   GOOGLE_TRANSLATE_API_KEY=tu-clave-de-google-aqui
   ```

**💰 Créditos gratis**: $300 USD por 90 días  
**🆓 Límites permanentes gratis**:
- Translate: 500,000 caracteres/mes
- Text-to-Speech: 4M caracteres/mes

---

## ⚡ Configuración Rápida

1. **Edita el archivo `.env`** en la carpeta VoXStream-main:
   ```env
   OPENAI_API_KEY=sk-tu-clave-de-openai-aqui
   GOOGLE_TRANSLATE_API_KEY=tu-clave-de-google-aqui
   PORT=3000
   NODE_ENV=development
   ```

2. **Reinicia el servidor**:
   ```bash
   npm start
   ```

3. **¡Listo!** Sube un video y prueba el doblaje automático

---

## 🎯 Alternativas 100% Gratuitas

Si prefieres no usar tarjeta de crédito:

### MyMemory Translate (Sin registro)
- **Gratuito**: 1000 palabras/día sin API key
- **Con registro**: 10,000 palabras/día
- La app ya tiene este fallback integrado

### Whisper Local (Offline)
- Instalar Whisper en tu Mac:
  ```bash
  pip install openai-whisper
  ```
- La app puede usar Whisper local si detecta la instalación

---

## 🚨 Solución de Problemas

### Error: "API key inválida"
- Verifica que copiaste la clave completa
- Asegúrate de no incluir espacios extra
- La clave de OpenAI debe empezar con `sk-`

### Error: "Cuota excedida"
- OpenAI: Espera hasta el próximo mes o agrega créditos
- Google: Verifica que las APIs estén habilitadas

### Modo Demo
- Si no configuras las APIs, VoXStream funciona en modo demo
- Muestra el proceso completo pero con contenido simulado
- Perfecto para probar la interfaz y flujo

---

## 📊 Costos Reales Después del Período Gratuito

### OpenAI Whisper
- **Audio corto** (5 min): ~$0.03
- **Audio largo** (1 hora): ~$0.36
- **Muy económico** para uso personal

### Google Cloud
- **Traducción**: Gratis hasta 500K caracteres/mes
- **Text-to-Speech**: Gratis hasta 4M caracteres/mes
- **La mayoría de usuarios nunca superan el límite gratuito**

---

💡 **Tip**: Empieza con los créditos gratuitos, prueba la app, y luego decide si quieres continuar. ¡Los costos son muy bajos para uso personal!