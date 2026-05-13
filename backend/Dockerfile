FROM node:24-slim
WORKDIR /app
RUN apt-get update -qq && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN chmod +x entrypoint.sh
EXPOSE 4000
CMD ["sh", "entrypoint.sh"]
