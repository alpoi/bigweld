FROM node

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./

RUN npm install

COPY ./src ./src

RUN npm run build
RUN npm run register
RUN sed -i 's/markersMap\.find/markersMap?.find/g' node_modules/play-dl/dist/index.js

EXPOSE 80

CMD ["npm", "run", "start"]