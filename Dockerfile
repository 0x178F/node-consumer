FROM node:18.12.1-alpine

WORKDIR /app

COPY ["package.json", "yarn.lock*", "./"]

RUN yarn install --frozen-lockfile --prod

COPY . .

CMD ["node", "--experimental-specifier-resolution=node" , "./src/app.js"]
