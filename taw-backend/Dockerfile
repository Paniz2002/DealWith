FROM node:lts-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
COPY . .

RUN rm -rf node_modules
RUN npm ci

EXPOSE 3000
# This is supposed to run when we are done with the project.
# CMD ["npm", "run", "build"]
# CMD ["npm", "start"]

# Instead while developing run this.
CMD ["npm", "run", "dev"]
