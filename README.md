# Projet Application TheTipTop

### Introduction
The objective of this project is to create a website application for a competition for the client
Thetiptop.
The application is divided into two parts :
-   back-end part managed by  Javascript, Node JS environment server and Express  
-   front-end built with Angular 9, Typescript.

### Prerequisites
* Serveur Node Js v12.18.2 ou plus 
* Git
* MYSQL 8
* Sequelize ORM  4.39.0  

### Application Structure  

>Backend
*  `config` - This folder contains configuration database relationnal mapping  and environment variables
*  `controller` - This folder contains callback functions that corresponds to the routers to handle requests and return response 
*  `model`  - This folder contains the schema definitions for our MySql models
*  `router` - This folder contains the route definition for our API and  webtoken security
*  `test`   - This folder contains tests of our apllication
*  `server.js` - The entry point to our application. This file defines our express server and connects it to MySql using sequelize.  
   It also requires the routes and models we'll be using in the application.  


>Frontend
*  `service` - This folder contains  API services we need  to make the server call and get data to display
*  `routing` - Define navigation rules among the different application states and view hierarchies.
*  `modules` - The modules contains all declares a compilation context for a set of components that is dedicated to an application domain
*  `auth` - This folder contain some API services for connection define  requests authenticated  
   using the authorization header and caught bad authentication and will return 401 or 403
*  `component` - The component is a class that contains the core of business logic for the application.  
   It contains the template which is going to display when this class gets invoke. It also contains the corresponding css for that template.  
   Same it contains the service which reads data from the server and renders it to template dor display.   
   This component interacts with the template with the method and property of API

### Create your ApiKey 
*  Create your Api Key using Sendinblue to send transaction email or create your own transactionnal email  


### Installation and local run  
Clone the repository and install the dependencies  
* ` git clone `
  
Enter to backend folder 
* ` cd backend `

* ` npm install`  

Start Server backend - the server start on localhost:8000  
* ` npm run dev `  
  
Enter to frontend folder  
* ` cd frontend `
* ` npm install `
  
  Start Server frontend - the server start on localhost:4200
* ` npm start `

### Installation and using Docker  
If you want to use Docker clone the repository and install the dependencies make sure you are in the principal folder

use the command below   
* `docker-compose up --build`   

#### About  

Writted by  **SY Elhadji**   developper    




