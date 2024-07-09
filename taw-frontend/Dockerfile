FROM node:lts-alpine
WORKDIR /app
COPY . .

RUN rm -rf node_modules
RUN npm install -g @angular/cli@17
COPY package*.json ./
RUN npm install
RUN npm ci

EXPOSE 4200
CMD ["ng", "serve", "--host", "0.0.0.0"]
