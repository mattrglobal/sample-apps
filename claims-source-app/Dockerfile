FROM node:22-alpine

WORKDIR /app

COPY . .

RUN npm install

ARG PORT=7310
ENV PORT=${PORT}
EXPOSE ${PORT}

CMD ["npm", "run", "dev"]
