FROM node:22-alpine

WORKDIR /app

COPY . .

RUN npm install

ARG PORT=7311
ENV PORT=${PORT}
EXPOSE ${PORT}

CMD ["npm", "run", "dev"]
