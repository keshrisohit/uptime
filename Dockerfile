FROM node:6

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install


# Bundle app source
COPY . .

#Set env variable required for production set up
EXPOSE 8082
ARG DOCKER_ENV=production
ENV NODE_ENV=$DOCKER_ENV
CMD [ "npm", "start" ]
