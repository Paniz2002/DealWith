FROM node:18.16.0-alpine3.17

# Create app directory
WORKDIR /home/node/app

# Install app dependencies
COPY --chown=node:node package*.json ./
# COPY --chown=node:node . .
USER node

CMD [ "npm", "install" ]

# Bundle app source
COPY --chown=node:node . .

EXPOSE 3000

CMD [ "npm", "run", "dev" ]