
var express = require('express');
var app = express();
var cors = require('cors')
const helmet = require("helmet");
var hpp = require('hpp');
const xssClean = require('xss-clean');

const http = require('http');

var bodyParser = require('body-parser');
app.use(bodyParser.json())
const corsOptions = {
	origin: '*',
	optionsSuccessStatus: 200
}

app.use(cors(corsOptions));
//protect for XSS
app.use(helmet());

//protect against HTTP Parameter Pollution attacks
app.use(hpp());

// Protect against XSS attacks, should come before any routes
app.use(xssClean());

app.disable('x-powered-by');
require('./app/router/router.js')(app);

const db = require('./app/config/db.config.js');
const Role = db.role;

// force: true will drop the table if it already exists
/*db.sequelize.sync({force: true}).then(() => {
	console.log('Drop and Resync with { force: true }');
	initial();
});
*/
// Create a Server

var server = app.listen(8000, function () {
	var host = server.address().address
	var port = server.address().port
	console.log(host +" "+ port)
})

/*
  ** setting  the environment variable NODE_ENV when running a Node.js
  ** load the environment variable of the corresponding environment.
*/

function initial() {
	Role.create({
		id: 1,
		name: "USER"
	});

	Role.create({
		id: 2,
		name: "EMP"
	});

	Role.create({
		id: 3,
		name: "ADMIN"
	});
}
/*
** apm -> elasticsearch -> kibana **
** metric applicatif **
 */
/*
var apm = require('elastic-apm-node').start({
	serviceName: 'metric-applicatif-'+process.env.NODE_ENV,
	metricsInterval: '30s',
	environment: process.env.NODE_ENV,
	// captureExceptions:false so we can see the error on the console
	captureExceptions: false,
	serverUrl: 'https://apm-server.dsp-archiweb21-ah-es-ag-hk.fr'
})
*/
module.exports = server

