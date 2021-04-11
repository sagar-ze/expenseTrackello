FROM node:14
WORKDIR /app

# intall packages
COPY package*.json ./
RUN npm install

# speficy production environment
ENV NODE_ENV=production

#copy files
COPY . .

#run server
CMD ["npm","start"]