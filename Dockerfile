FROM node:18-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Don't expose a specific port - let Railway handle it
EXPOSE $PORT

# Start the application (Railway will set PORT)
CMD ["npm", "start"]
