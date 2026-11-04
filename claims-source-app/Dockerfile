FROM node:26-alpine

WORKDIR /app

COPY . .

RUN npm install

ARG PORT=7310
ENV PORT=${PORT}
EXPOSE ${PORT}

CMD ["npm", "run", "dev"]
