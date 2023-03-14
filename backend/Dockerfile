FROM node:18-slim
WORKDIR /usr/src/app
COPY package.json ./
RUN npm i --production
RUN npm cache clean --force
ENV NODE_ENV="production"
COPY . .
CMD [ "npm", "start" ]