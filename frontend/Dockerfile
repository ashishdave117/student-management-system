# Production Docker Container for Service 2 (Frontend)
FROM node:20-alpine

WORKDIR /app

# Install application dependencies
COPY package*.json ./
RUN npm install --production

# Copy frontend source code
COPY . .

# Render defaults to port 10000
ENV PORT=10000
EXPOSE 10000

CMD ["node", "server.js"]
