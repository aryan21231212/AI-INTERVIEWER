
FROM node:22-alpine


RUN apk add --no-cache python3 py3-pip


RUN pip3 install PyPDF2 --break-system-packages


WORKDIR /app


COPY package*.json ./
RUN npm install


COPY . .


EXPOSE 3001


CMD ["node", "server.js"]