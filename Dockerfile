# 1. Base Image
FROM node:20-alpine AS base

# 2. Set working directory
WORKDIR /app

# 3. Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# 4. Copy source code
COPY . .

# 5. Build the application
RUN npm run build

# 6. Production Image
FROM node:20-alpine AS production

WORKDIR /app

# Copy built assets from the 'base' stage
COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

# Expose the port the app runs on
EXPOSE 3000

# Command to start the app
CMD ["npm", "start"]
