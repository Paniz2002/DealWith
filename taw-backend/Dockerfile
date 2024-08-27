FROM node:lts-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
COPY . .

RUN rm -rf node_modules
RUN npm install
RUN npm ci

EXPOSE 3000
EXPOSE 3001
# This is supposed to run when we are done with the project.
#FIXME THIS WILL NOT WORK IF WE USE IMPORT REQUIRE, IT WILL WORK IF WE USE IMPORT FROM @see: https://stackoverflow.com/questions/39664068/import-assignment-cannot-be-used-when-targeting-ecmascript-2015-modules
#CMD ["sh", "-c", "npm run build  && npm run start"]



CMD ["sh", "-c", "npm run dev"]
