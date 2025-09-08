# MCP Server Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose the port (if MCP server needs one)
EXPOSE 3001

# Start the MCP server
CMD ["npm", "start"]