FROM node:lts-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm ci 

COPY . .
EXPOSE 3000

# This is supposed to run when we are done with the project.
# CMD ["npm", "run", "build"]
# CMD ["npm", "start"]

# Instead while developing run this.

RUN npx prisma generate
CMD ["npm", "run", "dev"]
