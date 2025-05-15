FROM node:18

WORKDIR /app

# ✅ 로컬에서 미리 빌드된 dist 폴더만 복사
COPY ./dist ./dist
COPY ./package*.json ./

# ✅ 프로덕션 의존성만 설치
RUN npm install --only=production

EXPOSE 3000
CMD ["node", "dist/main"]
