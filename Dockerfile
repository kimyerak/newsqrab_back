# Step 1: Build
FROM node:18 AS builder

WORKDIR /app
COPY . .
RUN npm install

# Node 메모리 증가 후 빌드 실행
RUN export NODE_OPTIONS="--max-old-space-size=4096" && npm run build



# Step 2: Run
FROM node:18

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm install --only=production

EXPOSE 3000
CMD ["node", "dist/main"]
