# Step 1: Build
FROM node:18 AS builder

WORKDIR /app
COPY . .
RUN npm install

ENV NODE_OPTIONS=--max-old-space-size=1024
RUN npm run build



# Step 2: Run
FROM node:18

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm install --only=production

EXPOSE 3000
CMD ["node", "dist/main"]
