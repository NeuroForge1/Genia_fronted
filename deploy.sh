#!/bin/bash

# Script para despliegue manual de Genia Frontend

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Iniciando proceso de despliegue manual de Genia Frontend...${NC}"

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js no está instalado. Por favor, instálelo antes de continuar.${NC}"
    exit 1
fi

# Verificar que npm esté instalado
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm no está instalado. Por favor, instálelo antes de continuar.${NC}"
    exit 1
fi

# Verificar que Vercel CLI esté instalado
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Vercel CLI no está instalado. Instalando...${NC}"
    npm install -g vercel
fi

# Instalar dependencias
echo -e "${YELLOW}Instalando dependencias...${NC}"
npm install

# Construir la aplicación
echo -e "${YELLOW}Construyendo la aplicación...${NC}"
npm run build

# Verificar si la construcción fue exitosa
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Construcción exitosa.${NC}"
else
    echo -e "${RED}Error durante la construcción. Verifique los errores y vuelva a intentarlo.${NC}"
    exit 1
fi

# Preguntar si desea desplegar a producción
echo -e "${YELLOW}¿Desea desplegar a producción? (s/n)${NC}"
read -r deploy_prod

if [[ "$deploy_prod" =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}Desplegando a producción con Vercel...${NC}"
    echo -e "${YELLOW}Asegúrese de haber iniciado sesión en Vercel con 'vercel login' antes de continuar.${NC}"
    vercel --prod
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Despliegue a producción exitoso.${NC}"
        echo -e "${YELLOW}Recuerde configurar los webhooks:${NC}"
        echo -e "- Webhook de Stripe: https://[su-dominio]/api/webhook"
        echo -e "- Webhook de Twilio: https://[su-dominio]/api/webhook/twilio"
    else
        echo -e "${RED}Error durante el despliegue a producción. Verifique los errores y vuelva a intentarlo.${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}Despliegue a producción cancelado.${NC}"
fi

echo -e "${GREEN}Proceso de despliegue manual completado.${NC}"
