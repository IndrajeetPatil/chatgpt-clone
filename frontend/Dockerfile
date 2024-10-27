FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copy the project files 
# (remember that Dockerfile is in the frontend directory)
COPY . .

RUN npm run build
EXPOSE 3000

CMD ["npm", "run", "start"]
