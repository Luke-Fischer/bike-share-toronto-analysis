FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN npm ci || npm i

COPY . .

ENV HOST=0.0.0.0
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
