#!/bin/bash

# Script de inicio para macOS
echo "🚀 Iniciando VoXStream en macOS..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Ollama
if ! command -v ollama &> /dev/null; then
    echo -e "${YELLOW}⚠️  Ollama no encontrado. Instala con: brew install ollama${NC}"
    exit 1
fi

# Verificar FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${YELLOW}⚠️  FFmpeg no encontrado. Instala con: brew install ffmpeg${NC}"
    exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js no encontrado. Instala con: brew install node${NC}"
    exit 1
fi

# Verificar entorno virtual Python
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}📦 Creando entorno virtual Python...${NC}"
    python3 -m venv .venv
fi

# Activar entorno virtual
source .venv/bin/activate

# Instalar dependencias Python si es necesario
echo -e "${GREEN}📦 Verificando dependencias Python...${NC}"
pip install -q flask faster-whisper edge-tts requests 2>/dev/null

# Verificar si Ollama está corriendo
if ! pgrep -x "ollama" > /dev/null; then
    echo -e "${YELLOW}🚀 Iniciando Ollama...${NC}"
    ollama serve > /dev/null 2>&1 &
    sleep 3
fi

# Verificar modelo Llama
if ! ollama list | grep -q "llama3.2:1b"; then
    echo -e "${YELLOW}📥 Descargando modelo llama3.2:1b...${NC}"
    ollama pull llama3.2:1b
fi

# Iniciar servicios Python en background
echo -e "${GREEN}🎤 Iniciando servicio Whisper (puerto 5001)...${NC}"
python3 python-services/whisper_service.py > /dev/null 2>&1 &
WHISPER_PID=$!

echo -e "${GREEN}🗣️  Iniciando servicio TTS (puerto 5002)...${NC}"
python3 python-services/tts_service_edge.py > /dev/null 2>&1 &
TTS_PID=$!

# Esperar a que los servicios se inicien
echo -e "${YELLOW}⏳ Esperando 5 segundos a que los servicios se inicien...${NC}"
sleep 5

# Verificar servicios
if curl -s http://localhost:5001/health > /dev/null; then
    echo -e "${GREEN}✅ Whisper service OK (PID: $WHISPER_PID)${NC}"
else
    echo -e "${YELLOW}⚠️  Whisper service no responde${NC}"
fi

if curl -s http://localhost:5002/health > /dev/null; then
    echo -e "${GREEN}✅ TTS service OK (PID: $TTS_PID)${NC}"
else
    echo -e "${YELLOW}⚠️  TTS service no responde${NC}"
fi

# Iniciar servidor Node.js
echo -e "${GREEN}🎬 Iniciando servidor Node.js (puerto 3000)...${NC}"
echo -e "${GREEN}🌐 Abre http://localhost:3000 en tu navegador${NC}"
echo -e "${YELLOW}Presiona Ctrl+C para detener todos los servicios${NC}"

node src/index.js

# Cleanup al salir
echo -e "${YELLOW}🛑 Deteniendo servicios...${NC}"
kill $WHISPER_PID $TTS_PID 2>/dev/null
pkill -f "ollama serve" 2>/dev/null
