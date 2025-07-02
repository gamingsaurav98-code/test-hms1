# Use Node 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install bash (optional but included per your original file)
RUN apk add --no-cache bash

# Install necessary dependencies
RUN apk add --no-cache libc6-compat

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including devDependencies for now)
RUN npm install

# Install postcss and autoprefixer explicitly
RUN npm install -D postcss tailwindcss lucide-react

# Copy rest of the project
COPY . .

# Create a basic admin page if it doesn't exist
RUN mkdir -p ./app/admin/\(dashboard\)

# Build the project (will use autoprefixer, tailwindcss, etc.)
RUN npm run build

# Expose the port
EXPOSE 3000

# Start in production mode
CMD ["npm", "start"]
