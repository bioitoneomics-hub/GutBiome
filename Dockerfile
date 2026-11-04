FROM node:20-bookworm-slim

# Install system dependencies: Chromium (for A4 PDF rendering) and Python3 with HDF5 support (for BIOM 2.1 matrix parsing)
RUN apt-get update && apt-get install -y \
    chromium \
    python3 \
    python3-h5py \
    fonts-liberation \
    fonts-dejavu-core \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libasound2 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Chrome executable path for Puppeteer
ENV CHROME_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copy package manifests and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy project source
COPY . .

# Set production environment and build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Render supplies the PORT environment variable (default 10000 or custom)
ENV PORT=10000
EXPOSE 10000

CMD ["sh", "-c", "npx next start -p ${PORT:-10000}"]

