const db = require('../config/db.config.js');
const config = require('../config/config.js');
const ROLEs = config.ROLEs;
const User = db.user;
const Gain = db.gain;
const Ticket = db.ticket;
const PasswordResetToken = db.resetpassword;
const Op = db.Sequelize.Op;
const { check, validationResult }  = require('express-validator');
const jwt = require("jsonwebtoken");

checkDuplicateUserNameOrEmail = (req, res, next) => {
	// -> Check Email is already in use
	User.findOne({
		where: {
			login: req.body.login
		}
	}).then(user => {
		if (user) {
			res.status(409).send("Cette adresse email est déja associé à un compte utilisateur.");
			return;
		}

		next();
	});
};

checkInvalidEmailAdress = (req,res,next) =>{
	const regExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	const validateEmail = regExp.test(String(req.body.login).toLowerCase());
	if(!validateEmail){
		return res.status(400).send("Invalide adresse Email");
	}
	next();
};
checkInvalidTelephoneNumber = (req,res,next) =>{
	const regExp =/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
	const validateTelephoneNumber = regExp.test(req.body.telephone);
	if(!validateTelephoneNumber){
		return res.status(400).send("Numéro de téléphone invalide");
	}
	next();
};
checkInvalidFirstAndLastName = (req,res,next) =>{
	const regExp =/^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð\-' \-]+$/;
	const validateNom = regExp.test((req.body.nom));
	const validatePrenom = regExp.test((req.body.prenom));
	if(!validateNom || !validatePrenom){
		return res.status(400).send("Entrez un nom ou prénom valide sans caractéres spéciaux sauf tiret apostrophe, ni chiffre");
	}
	next();
};


checkRolesExisted = (req, res, next) => {
	for (let i = 0; i < req.body.roles.length; i++) {
		if (!ROLEs.includes(req.body.roles[i].toUpperCase())) {
			res.status(400).send("ce rôle n'existe pas  " + req.body.roles[i]);
			return;
		}
	}
	next();
}
checkPermissionRolesUser = (req, res, next) => {
		if (req.body.roles[0] !== 'user') {
			res.status(403).send("Vous n'êtes pas autorisé à vous s'inscrire");
			return;
	    }
	next();
}
checkPermissionRolesAdmin = async (req, res, next) => {
	let token = req.headers['x-access-token'];
	const decodedToken = jwt.decode(token);
	const user = await User.findByPk(decodedToken.id);
	user.getRoles().then(roles => {
		if (roles[0].name !== "ADMIN") {
			res.status(403).send("Vous n'êtes pas autorisé à ajouter un utilisateur.");
			return;
		}
		next();
	})

};

//check bad number Ticket
checkBadNumberTicket = (req, res, next) => {
	Ticket.findOne({
		where: {
			numero_ticket: req.body.numero_ticket
		}
	}).then(ticket => {
		if (!ticket) {
			res.status(400).send("Ce numéro de ticket n'existe pas !");
			return;
		}

		next();
	});

};
checkExistingEmail = (req, res, next) => {
	User.findOne({
		where: {
			login: req.body.login
		}
	}).then(user => {
		if (!user) {
			res.status(400).send("cette adresse email n'existe pas !");
			return;
		}
		next();
	});
};

checkValidPasswordToken = async(req, res, next) => {
	if (!req.body.token) {
		return res
			.status(400)
			.json({ message: "Le token n'existe pas " });
	}

	const passwordResetToken =  await PasswordResetToken.findOne({
		where: {
			token: req.body.token,
			dateexpiration: {
				[Op.gt]: Date.now()
			}
		}
	});
	if (!passwordResetToken) {
		return res
			.status(404)
			.json({ message: 'URL Invalide,veuillez demander une nouvelle réinitialisation du mot de passe !' });
	}
	User.findOne({
		where:  {id: passwordResetToken.userId}
	}).then(userRetrieve => {
		if (!userRetrieve) {
			res.status(404).send({message: "Utilisateur n'existe pas "});
			return;
		}
		next();
	});
};
checkWinnerExist = (req, res,next) =>{
	var drawingDate = new Date("28/07/2020");
	if(Date.now() >= drawingDate){
		return res
			.status(500)
			.json({ message: "Le tirage ne peut être effectué avant la date finale " });
	}

	Gain.findOne({
		where: {
			gagnant: 1
		}
	}).then(gain => {
		if (gain) {
			res.status(404).send({message: "Le tirage a été déja effectué !"});
			return;
		}
		next();
	})
};
checkBlockingUser =  async (req, res, next) => {
	const dateActuelle = Date.now()
	User.findOne({
		where: {
			login: req.body.login,
			stateaccount: 'blocked',
			expirydate: {
				[Op.lt]: dateActuelle
			}
		}
	}).then(user=> {
		if (user) {
			User.update({stateaccount: 'unblocked'},
				{ where: {login: user.login}}
			).then(() => {
				res.status(200).send();
				return;

			});
		}
		next();
	});

};

verifyEqualPassword = (req, res, next) => {
	var password = req.body.password;
	var newpassword = req.body.confirm;
	if (password != newpassword) {
		res.status(400).send({reason: "Les deux mot de passes ne correspondent pas"});
		return;
	}
	next();
};
checkInvalidAge = (req,res,next) =>{
	var reg = /^\d+$/;
	const validateAge = reg.test(String(req.body.age).toLowerCase());
	if(!validateAge){
		return res.status(400).send("Invalide : l'âge doit être en format numérique");
	}
	next();
};
checkValidFormRegister = async (req,res,next) =>{

	await check('nom', 'Le nom doit avoir au minimum deux caractéres')
		.isLength({min: 2, max: 30}).run(req);
	await check('prenom', 'Le prénom doit avoir au minimum deux caractéres')
		.isLength({min: 2, max: 30}).run(req);
	await check('password','le mot de passe doit avoir minimum 6 caractéres').isLength({ min: 6, max:20 }).run(req);
	await check('age', "l'age doit être au format numérique max 100").isInt({min:5, max: 100}).run(req)

	const result = validationResult(req);
	if (!result.isEmpty()) {
		return res.status(422).send(result.array());
	}
	next();
};
checkValidFormEdit = async (req,res,next) =>{

	await check('nom', 'Le nom doit avoir au minimum deux caractéres')
		.isLength({min: 2, max: 30}).run(req);
	await check('prenom', 'Le prénom doit avoir au minimum deux caractéres')
		.isLength({min: 2, max: 30}).run(req);
	await check('age', "l'age doit être au format numérique max 100").isInt({min:5, max: 100}).run(req)

	const result = validationResult(req);
	if (!result.isEmpty()) {
		return res.status(422).send(result.array());
	}
	next();
};
checkRandomTicket = async (req, res, next) => {
	const tickets = await Ticket.count({})
	if(tickets === 1500000){
		return res.status(400).send({message: "Tous les tickets ont été déja générés"});
	}
	next();
}

const signUpVerify = {};
signUpVerify.checkDuplicateUserNameOrEmail = checkDuplicateUserNameOrEmail;
signUpVerify.checkRolesExisted = checkRolesExisted;
signUpVerify.checkBadNumberTicket = checkBadNumberTicket;
signUpVerify.checkExistingEmail = checkExistingEmail;
signUpVerify.checkValidPasswordToken = checkValidPasswordToken;
signUpVerify.checkWinnerExist = checkWinnerExist;
signUpVerify.checkInvalidEmailAdress = checkInvalidEmailAdress;
signUpVerify.checkInvalidTelephoneNumber = checkInvalidTelephoneNumber;
signUpVerify.checkBlockingUser = checkBlockingUser;
signUpVerify.checkInvalidFirstAndLastName = checkInvalidFirstAndLastName;
signUpVerify.verifyEqualPassword = verifyEqualPassword;
signUpVerify.checkInvalidAge = checkInvalidAge;
signUpVerify.checkValidFormRegister = checkValidFormRegister;
signUpVerify.checkValidFormEdit = checkValidFormEdit;
signUpVerify.checkPermissionRolesUser = checkPermissionRolesUser;
signUpVerify.checkPermissionRolesAdmin = checkPermissionRolesAdmin;
signUpVerify.checkRandomTicket = checkRandomTicket;

module.exports = signUpVerify;
