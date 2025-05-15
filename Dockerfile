FROM node:18

# Puppeteer 실행에 필요한 패키지 설치
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libdrm2 \ 
    libgbm1 \
    xdg-utils \
    --no-install-recommends \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ✅ 로컬에서 미리 빌드된 dist 폴더만 복사
COPY ./dist ./dist
COPY ./package*.json ./

# ✅ 프로덕션 의존성만 설치
RUN npm install --only=production

EXPOSE 3000
CMD ["node", "dist/src/main"]
