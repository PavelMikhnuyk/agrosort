FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
COPY backend/fonts ./fonts/
RUN npm install --omit=dev
COPY backend/ ./
COPY frontend/ ./frontend/
EXPOSE 3000
CMD ["node", "src/index.js"]