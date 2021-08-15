FROM node:14

WORKDIR /app

COPY package.json ./

COPY tsconfig.json ./

COPY src ./src

RUN ls -a

RUN npm install

EXPOSE 8000

CMD ["npm", "run", "start"]
