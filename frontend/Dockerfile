FROM node:22-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm install

# Copy the project files 
# (remember that Dockerfile is in the frontend directory)
COPY . .

RUN npm run build
EXPOSE 3000

CMD ["npm", "run", "start"]
