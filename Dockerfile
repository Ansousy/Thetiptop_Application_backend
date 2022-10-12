# Create image based on the official Node 6 image from the dockerhub
FROM node:14
# Create a directory where our app will be placed
RUN mkdir -p /usr/src/app
# Change directory so that our commands run inside this new directory
WORKDIR /usr/src/app
# Copy dependency definitions
ADD . /usr/src/app
#COPY package*.json ./
COPY ./package.json /usr/src/app/
COPY ./package-lock.json /usr/src/app/

# Install dependecies
RUN npm install
#ENV NODE_ENV=production
#add netcat
RUN apt-get update && apt-get install -y netcat
# Get all the code needed to run the app
COPY . /usr/src/app
# Expose the port the app runs in
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}
EXPOSE 8000
# Serve the app
CMD ["npm", "run" ,"prod"]
#COPY ./wait.sh /wait.sh
#RUN chmod +x /wait.sh

