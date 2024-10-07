FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

# Copy the project files 
# (remember that Dockerfile is in the frontend directory)
COPY . .

# Build the Next.js app
RUN npm run build

# Expose the port Next.js runs on
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "start"]
