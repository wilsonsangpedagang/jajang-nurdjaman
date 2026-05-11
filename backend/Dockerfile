FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

# Install Python 3 and ML dependencies for the BVI predictor
RUN apk add --no-cache python3 py3-pip py3-numpy py3-scipy && \
    pip3 install --no-cache-dir --break-system-packages \
      scikit-learn pandas xgboost

COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
COPY business_viability_model.pkl ./business_viability_model.pkl
COPY data ./data

EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
