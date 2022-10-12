const jwt = require('jsonwebtoken');
const config = require('../config/config.js');
const db = require('../config/db.config.js');
const User = db.user;

verifyToken = (req, res, next) => {
    let token = req.headers['x-access-token'];

	if (!token){
		return res.status(403).send({
			auth: false, message: 'Aucun token trouvé.'
		});
	}

	jwt.verify(token, config.secret, (err, decoded) => {
		if (err){
			return res.status(401).send({
					auth: false,
					message: "L'authentification à échouer  " + err
				});
		}
		req.userId = decoded.id;
		next();
	});
}

validFormatToken = (req, res, next) => {
	let token = req.params.token;
	jwt.verify(token, config.secret, (err) => {
		if (err) {
			return res.status(401).send({
				message: "Erreur de confirmation de votre inscription : token invalide "
			});
		}
		return next();
	});
}

isAdmin = (req, res, next) => {	
	User.findById(req.userId)
		.then(user => {
			user.getRoles().then(roles => {
				for(let i=0; i<roles.length; i++){
					if(roles[i].name.toUpperCase() === "ADMIN"){
						next();
						return;
					}
				}
				
				res.status(403).send("Vous n'êtes pas autorisé à visualiser cette page !");
				return;
			})
		})
}

isEmpOrAdmin = (req, res, next) => {
	User.findById(req.userId)
		.then(user => {
			user.getRoles().then(roles => {
				for(let i=0; i<roles.length; i++){					
					if(roles[i].name.toUpperCase() === "EMP"){
						next();
						return;
					}
					
					if(roles[i].name.toUpperCase() === "ADMIN"){
						next();
						return;
					}
				}
				
				res.status(403).send("Vous n'êtes pas autorisé à visualiser cette page !!");
			})
		})
}

const authJwt = {};
authJwt.verifyToken = verifyToken;
authJwt.isAdmin = isAdmin;
authJwt.isEmpOrAdmin = isEmpOrAdmin;
authJwt.validFormatToken = validFormatToken;

module.exports = authJwt;
