# Step 1: Build
FROM node:18 AS builder

WORKDIR /app
COPY . .
RUN npm install

ENV NODE_OPTIONS=--max-old-space-size=512
RUN npm run build



# Step 2: Run
FROM node:18

WORKDIR /app
# 로컬에서 빌드된 dist 복사
COPY ./dist ./dist
COPY ./package*.json ./

# 운영환경 의존성만 설치

RUN npm install --only=production

EXPOSE 3000
CMD ["node", "dist/main"]
