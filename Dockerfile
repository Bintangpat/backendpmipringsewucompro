# Gunakan node versi terbaru
FROM node:22-alpine

WORKDIR /app

# Copy package.json dan install library
COPY package*.json ./
RUN npm install

# Copy seluruh kode backend
COPY . .

# Build NestJS menjadi javascript murni
RUN npx prisma generate
RUN npm run build

# Jalankan aplikasi
CMD ["npm", "run", "start:prod"]

