const db = require('../config/db.config.js');
const config = require('../config/config.js');
const User = db.user;
const Role = db.role;
const Ticket = db.ticket;
const Gain = db.gain;
const PasswordResetToken = db.resetpassword;
const Op = db.Sequelize.Op;
const crypto = require('crypto');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

var SibApiV3Sdk = require('sib-api-v3-sdk');
var defaultClient = SibApiV3Sdk.ApiClient.instance;

//Configure API key authorization: api-key
var apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = 'mYKey';
var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
var sendSmtpEmailConfirmation = new SibApiV3Sdk.SendSmtpEmail();
var apiInstanceContact = new SibApiV3Sdk.ContactsApi();
require('dotenv').config({path: `.env.${process.env.NODE_ENV}`})

var dataForm = {}

//connect to elasticsearch
const {Client} = require('elasticsearch')
const client = new Client({
    hosts: [{
        host: 'elasticsearch.dsp-archiweb21-ah-es-ag-hk.fr',
        auth: 'elastic:Elmas19+',
        protocol: 'https',
        port: 443
    }],
    log: 'trace'
});


exports.addTicket = (req, res) => {
    // Inscription d'un utilisateur avec un nom,prenom,login et mot de passe crypter
    Ticket.findAll({}).then(() => {
        res.status(204).send({message: "Insertion des tickets"});

    }).catch(err => {
        res.status(500).send({reason: err.message});
    })

}


exports.signup = (req, res) => {
    const token = jwt.sign({email: req.body.email}, config.secret)
    // Inscription d'un utilisateur avec un nom,prenom,login  age telephone et mot de passe crypter
    sendSmtpEmailConfirmation = {
        sender: {
            "name": "ThéTiTop jeux concours ",
            "name": "ThéTiTop jeux concours ",
            "email": "thetiptop@jeux-concours.fr"
        },
        to: [
            {
                "email": req.body.login,
            }
        ],
        subject: "Confirmation d'inscription",
        htmlContent: " Vous recevez cette email parce que vous venez de s'inscrire aux jeux ThéTiTop,\n\n " +
            "veuillez cliquer sur le lien suivant ou collez-le dans votre navigateur pour valider votre inscription \n\n" +
            process.env.FRONT_URL + "auth/confirmation-inscription/" + token

    };
    User.create({
        nom: req.body.nom,
        prenom: req.body.prenom,
        telephone: req.body.telephone.trim(),
        age: req.body.age,
        login: req.body.login.trim(),
        password: bcrypt.hashSync(req.body.password, 8),
        confirmationcode: token
    }).then(user => {
        Role.findAll({
            where: {
                name: 'user'
            }
        }).then(roles => {
            user.setRoles(roles).then(() => {
                apiInstance.sendTransacEmail(sendSmtpEmailConfirmation).then(data => {
                    res.status(201).send(data);
                }).catch(err => {
                    res.status(500).send({reason: err.message});
                });

            });
        }).catch(err => {
            res.status(500).send({reason: err.message});
        });
    }).catch(err => {
        res.status(500).send({reason: err.message});
    })
};
exports.registerConfirmation = async (req, res) => {
    const user = await User.findOne({
        where:
            {confirmationCode: req.params.token}
    });
    if (!user) {
        return res.status(400).send({message: "Erreur de confirmation de l'inscription utilisateur."});
    }
    User.update({status: 'activated'},
        {
            where: {
                id: user.id
            }
        }).then(() => {
        return res.status(201).json({message: 'Votre inscription a été confirmé avec succés. Veuillez vous connecter. '});
    }).catch(err => {
        res.status(500).send({message: "Erreur de confirmation de votre inscription."});
    });
};

/** Connexion d'un utilisateur avec un login et mot de passe
 * Verifier si le mot de passe est correct
 * Vérifier si le login est correct
 **/
var d = new Date,
    dformat = [d.getFullYear(),
        d.getMonth() + 1,
        d.getDate()].join('-');
exports.signin = (req, res) => {
    User.findOne({
        where: {
            login: req.body.login
        }
    }).then(user => {

        if (!user) {
            return res.status(404).send({reason: "Adresse e-mail ou mot de passe incorrect. Veuillez réessayer. "});
        }
        if (user.status === "inactivated") {
            return res.status(401).send({reason: "Compte inactif veuillez vérifier votre boite de méssagerie , pour confirmer votre inscription. "});
        }
        if (user.stateaccount === "blocked") {
            return res.status(401).send({reason: "Votre compte sera débloqué le   " + user.expirydate});
        }
        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send({auth: false, accessToken: null, reason: 'Adresse e-mail ou mot de passe incorrect. Veuillez réessayer.'});
        }

        var token = jwt.sign({id: user.id}, config.secret, {
            expiresIn: 86400 // expires in 24 hours
        });

        var authorities = [];
        user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
                authorities.push('ROLE_' + roles[i].name.toUpperCase());
            }
            //send logs to elasticsearch

            const cli = client.index({
                index: 'login',
                type: 'mytype',
                id: req.body.id,
                body: {
                    name: user.nom,
                    login: req.body.login,
                    dateLogin: dformat
                },
                status: req.status,
                error: req.error,
            })

            res.status(200).send({
                auth: true,
                accessToken: token,
                login: user.login,
                id: user.id,
                authorities: authorities,
                //client: cli
            });
        })
    }).catch(err => {
        res.status(500).send({reason: err.message});
    });
}
//inscription via google et facebook
exports.loginWithSocialNetwork = async function (req, res) {
    User.create({
        nom: req.body.lastName,
        prenom: req.body.firstName,
        login: req.body.email,
        password: bcrypt.hashSync("default", 8),
        status: 'activated'
    }).then(createdUser => {
        Role.findAll({
            where: {
                name: 'user'
            }
        }).then(roles => {
            createdUser.setRoles(roles);
            var token = jwt.sign({id: createdUser.id}, config.secret, {
                expiresIn: 86400 // expires in 24 hours
            });
            var authorities = [];
            for (let i = 0; i < roles.length; i++) {
                authorities.push('ROLE_' + roles[i].name.toUpperCase());
            }
            res.status(201).send({
                auth: true,
                accessToken: token,
                login: createdUser.login,
                id: createdUser.id,
                authorities: authorities
            });
        }).catch(err => {
            res.status(404).send({reason: err.message});
        });
    }).catch(err => {
        res.status(500).send({reason: err.message});
    });
}

exports.deleteUser = async function (req, res) {
    try {
        const idUser = req.params.id;
        const user = await User.findByPk(idUser);
        const gain = await Gain.findAll({
            where: {
                userId: idUser
            }
        });

        if (gain) {
            for (var i = 0; i < gain.length; i++) {
                await gain[i].destroy({
                    where: {
                        id: gain[i].id
                    }
                });
            }
        }
        if (!user) {
            res.status(404).send({message: "utilisateur non trouvé"});
        } else {
            await user.destroy();
            res.status(204).send({message: "utilisateur supprimé"});
        }

    } catch (err) {
        res.status(500).send({reason: err.message});
    }
};
exports.updateUser = async function (req, res) {
    await User.update({
        nom: req.body.nom,
        prenom: req.body.prenom,
        login: req.body.login,
        age: req.body.age,
        telephone: req.body.telephone.trim()
    }, {
        where: {
            id: req.body.id
        }
    });
    User.findOne({
        where: {
            login: req.body.login
        }
    }).then(updateUser => {
        Role.findAll({
            where: {
                name: req.body.role
            }
        }).then(roles => {
            updateUser.setRoles(roles).then(() => {
                res.status(204).send({message: 'Mise à jour réussie!'});
            });
        })
    }).catch(err => {
        res.status(500).send({reason: err.message});
    });
};

exports.updateProfil = function (req, res) {
    User.update({
        nom: req.body.nom,
        prenom: req.body.prenom,
        login: req.body.login,
        age: req.body.age,
        telephone: req.body.telephone.trim()
    }, {
        where: {
            id: req.body.id
        }
    }).then(() => {
        return res.status(200).json({message: 'Le profil a été mis à jour !'});

    }).catch(err => {
        res.status(500).send({reason: err.message});
    });
};


exports.addUser = function (req, res) {
    User.create({
        nom: req.body.nom,
        prenom: req.body.prenom,
        login: req.body.login,
        age: req.body.age,
        telephone: req.body.telephone,
        status: 'activated',
        password: bcrypt.hashSync(req.body.password, 8)
    }).then(user => {
        Role.findAll({
            where: {
                name: req.body.role
            }
        }).then(roles => {
            user.setRoles(roles).then(() => {
                res.status(201).send({message: 'Utilisateur ajouté', "user": user});
            });

        }).catch(err => {
            res.status(500).send({reason: err.message});
        });
    }).catch(err => {
        res.status(500).send({reason: err.message});
    })
}

exports.userContent = (req, res) => {
    User.findOne({
        where: {id: req.userId},
        attributes: ['nom', 'prenom', 'login', 'telephone', 'age'],
        include: [{
            model: Role,
            attributes: ['id', 'name'],
            through: {
                attributes: ['userId', 'roleId'],
            }
        }]
    }).then(user => {
        res.status(201).send({
            'user': user
        });
    }).catch(err => {
        res.status(500).send({
            'description': 'Can not access User Page',
            'error': err
        });
    })
}

exports.adminBoard = (req, res) => {
    User.findOne({
        where: {id: req.userId},
        attributes: ['nom', 'prenom', 'login'],
        include: [{
            model: Role,
            attributes: ['id', 'name'],
            through: {
                attributes: ['userId', 'roleId'],
            }
        }]
    }).then(user => {
        res.status(200).send({
            'user': user
        });
    }).catch(err => {
        res.status(500).send({
            'error': err
        });
    })
}

exports.managementBoard = (req, res) => {
    User.findOne({
        where: {id: req.userId},
        attributes: ['nom', 'prenom', 'login'],
        include: [{
            model: Role,
            attributes: ['id', 'name'],
            through: {
                attributes: ['userId', 'roleId'],
            }
        }]
    }).then(user => {
        res.status(200).send({
            'user': user
        });
    }).catch(err => {
        res.status(500).send({
            'error': err
        });
    })
}

//lister tous les tickets gains utilisateurs pour -> administrateur et employé
exports.findAllGains = (req, res) => {
    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.size);
    const offset = page ? page * limit : 0;


    Gain.findAndCountAll({
        //Add order conditions here....
        order: [
            ['date', 'DESC']
        ],
        include: [
            {
                model: User,
                attributes: ['id', 'nom', 'prenom', 'login', 'telephone']
            },
            {
                model: Ticket,
                attributes: ['id', 'numero_ticket', 'statut']
            }
        ],
        limit: limit,
        offset: offset
    })
        .then(gains => {
            const totalPages = Math.ceil(gains.count / limit);
            const response = {
                "totalItems": gains.count,
                "totalPages": totalPages,
                "currentPage": page,
                "limit": limit,
                "pageSize": gains.rows.length,
                "gains": gains.rows
            }
            res.send(response);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Erreur de récupération des gains des utilisateurs"
            });
        });
};

//filtre par nom user ou libelle
exports.queryGainsByLibelle = async (req, res) => {
    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.size);
    //retrieve
    let libelleGain = req.query.libelle;
    let nomUser = req.query.nom;
    const offset = page ? page * limit : 0;
    let gains = {}
    if (libelleGain != null && nomUser != null) {
        gains = await Gain.findAndCountAll({
            //filtre by libelle gains
            where: {libelle: {[Op.like]: `%` + libelleGain + `%`}},
            include: [
                {
                    model: User,
                    where: {nom: {[Op.like]: `%` + nomUser + `%`}},
                    attributes: ['id', 'nom', 'prenom', 'login', 'telephone'],
                },
                {
                    model: Ticket,
                    attributes: ['id', 'numero_ticket', 'statut']
                }
            ],
            limit: limit,
            offset: offset
        });
    }
    if (libelleGain != null && nomUser == null) {
        gains = await Gain.findAndCountAll({
            //filtre by libelle gains
            where: {libelle: {[Op.like]: `%` + libelleGain + `%`}},
            include: [
                {
                    model: User,
                    attributes: ['id', 'nom', 'prenom', 'login', 'telephone'],
                },
                {
                    model: Ticket,
                    attributes: ['id', 'numero_ticket', 'statut']
                }
            ],
            limit: limit,
            offset: offset
        });
    }
    if (libelleGain == null && nomUser != null) {
        gains = await Gain.findAndCountAll({
            //filtre by libelle gains
            include: [
                {
                    model: User,
                    attributes: ['id', 'nom', 'prenom', 'login', 'telephone'],
                    where: {nom: {[Op.like]: `%` + nomUser + `%`}},

                },
                {
                    model: Ticket,
                    attributes: ['id', 'numero_ticket', 'statut']
                }
            ],
            limit: limit,
            offset: offset
        });
    }

    const totalPages = Math.ceil(gains.count / limit);
    const response = {
        "totalPages": totalPages,
        "currentPage": page + 1,
        "limit": limit,
        "pageSize": gains.rows.length,
        "gains": gains.rows
    }
    res.status(200).send(response);
};
//filtre par nom user ou numero de ticket
exports.queryGainsByNumberOfTicketAndName = async (req, res) => {
    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.size);
    //retrieve
    let numeroTicket = req.query.ticket;
    let nomUser = req.query.nom;
    const offset = page ? page * limit : 0;
    let gains = {}
    if (numeroTicket != null && nomUser != null) {
        gains = await Gain.findAndCountAll({
            //filter by  number of ticket and name of user
            include: [
                {
                    model: User,
                    attributes: ['id', 'nom', 'prenom', 'login', 'telephone'],
                    where: {nom: {[Op.like]: `%` + nomUser + `%`}}
                },
                {
                    model: Ticket,
                    attributes: ['id', 'numero_ticket', 'statut'],
                    where: {numero_ticket: {[Op.like]: `%` + numeroTicket + `%`}},

                }
            ],
            limit: limit,
            offset: offset
        });
    }
    if (numeroTicket != null && nomUser == null) {
        gains = await Gain.findAndCountAll({
            //filtrer par numero_ticket
            include: [
                {
                    model: User,
                    attributes: ['id', 'nom', 'prenom', 'login', 'telephone'],

                },
                {
                    model: Ticket,
                    attributes: ['id', 'numero_ticket', 'statut'],
                    where: {numero_ticket: {[Op.like]: `%` + numeroTicket + `%`}},

                }
            ],
            limit: limit,
            offset: offset
        });
    }
    if (numeroTicket == null && nomUser != null) {
        gains = await Gain.findAndCountAll({
            //filtre by nom user
            include: [
                {
                    model: User,
                    where: {nom: {[Op.like]: `%` + nomUser + `%`}},
                    attributes: ['id', 'nom', 'prenom', 'login', 'telephone'],
                },
                {
                    model: Ticket,
                    attributes: ['id', 'numero_ticket', 'statut']
                }
            ],
            limit: limit,
            offset: offset
        });
    }


    const totalPages = Math.ceil(gains.count / limit);
    const response = {
        "totalPages": totalPages,
        "currentPage": page + 1,
        "limit": limit,
        "pageSize": gains.rows.length,
        "gains": gains.rows
    }
    res.status(200).send(response);
};


exports.queryGainsUserByLibelle = async (req, res) => {
    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.size);
    const idUser = req.params.userId;
    //retrieve
    let libelleGain = req.query.libelle;
    const offset = page ? page * limit : 0;
    let gains = {}
    if (libelleGain != null) {
        gains = await Gain.findAndCountAll({
            //filtre by libelle gains
            where: {
                userId: idUser,
                libelle: {[Op.like]: `%` + libelleGain + `%`}
            },
            include: [
                {
                    model: Ticket,
                    attributes: ['id', 'numero_ticket', 'statut']
                }
            ],
            limit: limit,
            offset: offset
        });
    }

    const totalPages = Math.ceil(gains.count / limit);
    const response = {
        "totalPages": totalPages,
        "currentPage": page + 1,
        "limit": limit,
        "pageSize": gains.rows.length,
        "gains": gains.rows
    }
    res.status(200).send(response);

};

//lister tous les tickets gains de l'utilisateur avec -> paramettre id users
exports.findAllGainsByIdUser = (req, res) => {
    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.size);
    const offset = page ? page * limit : 0;
    Gain.findAndCountAll({
        where: {userId: req.params.userId},
        //Add order conditions here....
        order: [
            ['date', 'DESC'],
        ],
        include: [
            {
                model: User,
                attributes: ['id', 'nom', 'prenom', 'login', 'telephone']
            },
            {
                model: Ticket,
                attributes: ['id', 'numero_ticket']
            }
        ],
        limit: limit,
        offset: offset
    }).then(gains => {
        const totalPages = Math.ceil(gains.count / limit);
        const response = {
            "totalItems": gains.count,
            "totalPages": totalPages,
            "currentPage": page,
            "limit": limit,
            "pageSize": gains.rows.length,
            "gains": gains.rows
        }
        res.send(response);
    })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Erreur de récupération des gains des utilisateurs"
            });
        });
};

//Récuperer  gain par son Id
exports.findEarningById = (req, res) => {
    Gain.findAll({
        attributes: ['id', 'libelle'],
        where: {id: req.params.id},
        include: [
            {
                model: User,
                attributes: ['nom', 'prenom', 'login', 'telephone']
            },
            {
                model: Ticket,
                attributes: ['numero_ticket']
            }
        ]
    }).then(gains => {
        res.status(200).send(gains);
    }).catch(err => {
        res.status(500).send({
            message:
                err.message || "Erreur de récupération du gain utilisateur"
        });
    });
};
//envoyer email de récupération du mot de passe
exports.recoverPassword = async (req, res, next) => {
    const user = await User.findOne({
        where: {
            login: req.body.login
        }
    });
    let datexpire = Date.now() + 43200 * 1000;
    var resettoken = new PasswordResetToken({
        userId: user.id,
        token: crypto.randomBytes(16).toString('hex'),
        dateexpiration: datexpire
    });
    //save token
    resettoken.save();
    //construct email
    sendSmtpEmail = {
        sender: {
            "name": "ThéTiTop jeux concours ",
            "email": "thetiptop@jeux-concours.fr"
        },
        to: [
            {
                "email": user.login,
            }
        ],
        subject: "Réinitialisation du mot de passe",
        htmlContent: " Vous recevez cette email parce que vous avez demandé de réinitialiser votre mot de passe,\n\n " +
            "veuillez cliquer sur le lien suivant ou collez-le dans votre navigateur pour commencer le processus  de réinitialisation du mot de passe \n\n" +
            process.env.FRONT_URL + "auth/reinitialiser-mot-de-passe/" + resettoken.token + " \n\n" +
            "Si vous ne l'avez pas demandé, veuillez ignorer cet e-mail et votre mot de passe restera inchangé."

    };
    //send email
    apiInstance.sendTransacEmail(sendSmtpEmail).then(data => {
        res.status(200).send(data);
        console.log('API called successfully. Returned data: ' + data);
    }).catch(err => {
        res.status(500).send({reason: err.message});
    });
};


//réinitialisation du mot de passe
exports.newPassword = async (req, res) => {
    var password = req.body.newpassword;
    var confirmpassword = req.body.confirmpassword;
    if (password !== confirmpassword) {
       return res.status(400).send({message: "Les deux mot de passes ne correspondent pas"});
    }

    const passwordResetToken = await PasswordResetToken.findOne({
        where: {
            token: req.body.token
        }
    });

    User.update({password: bcrypt.hashSync(req.body.newpassword, 8)},
        {
            where: {
                id: passwordResetToken.userId
            }
        }).then(() => {
        //passwordResetToken.remove();
        return res.status(200).json({message: 'Le mot de passe a été réinitialisé !'});
    }).catch(err => {
        res.status(500).send({reason: err.message + "erreur de  mot de passe"});
    });
};
//liste utilisateur
exports.userList = (req, res) => {
    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.size);
    const offset = page ? page * limit : 0;
    User.findAndCountAll({
        //Add order conditions here....
        order: [
            ['nom', 'ASC']
        ],
        attributes: ['id', 'nom', 'prenom', 'login', 'age', 'telephone'],
        include: [{
            model: Role,
            attributes: ['id', 'name']
        }],
        limit: limit,
        offset: offset
    }).then(users => {
        const totalPages = Math.ceil(users.count / limit);
        const response = {
            "totalItems": users.count,
            "totalPages": totalPages,
            "currentPage": page,
            "limit": limit,
            "pageSize": users.rows.length,
            "users": users.rows
        }
        res.send(response);

    }).catch(err => {
        res.status(500).send({reason: err.message});
    })

};

exports.rolesList = (req, res) => {
    Role.findAll().then(rows => {
        var response = [];
        for (row of rows) {
            response.push(row.name);
        }
        res.send(response)
    }).catch(err => {
        res.status(500).send({reason: err.message});
    });
};
//liste utilisateur
exports.queryByNameUser = (req, res) => {
    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.size);
    const offset = page ? page * limit : 0;
    let nomUser = req.query.nom;

    User.findAndCountAll({
        where: {nom: {[Op.like]: `%` + nomUser + `%`}},
        attributes: ['id', 'nom', 'prenom', 'login', 'age', 'telephone'],
        include: [{
            where: {name: {[Op.ne]: `ADMIN`}},
            model: Role,
            attributes: ['id', 'name']
        }],
        limit: limit,
        offset: offset
    }).then(users => {
        const totalPages = Math.ceil(users.count / limit);
        const response = {
            "totalItems": users.count,
            "totalPages": totalPages,
            "currentPage": page,
            "limit": limit,
            "pageSize": users.rows.length,
            "users": users.rows
        }
        res.send(response);

    }).catch(err => {
        res.status(500).send({reason: err.message});
    })

};
exports.getUser = async (req, res) => {
    let user = await User.findOne({
        where: {id: req.params.id},
        attributes: ['id', 'nom', 'prenom', 'login', 'telephone', 'age'],
        include: [{
            model: Role,
            attributes: ['id', 'name'],
            through: {
                attributes: ['userId', 'roleId'],
            }
        }]
    });
    if (!user){
        return res.status(404).send({message: "Utilisateur non trouvé"});
    }
    return  res.status(200).send(user);

}

//réinitialisater mot de passe utilisateur
exports.initializedPassword = async (req, res) => {
    User.update({password: bcrypt.hashSync(req.body.password, 8)},
        {
            where: {
                id: req.body.id
            }
        }).then(() => {
        return res.status(200).json({message: 'Le mot de passe a été réinitialisé !'});
    }).catch(err => {
        res.status(500).send({reason: "erreur de réinitialisation du mot de passe"});
    });
};


exports.unsubscribe = (req, res) => {
    let contactEmails = new SibApiV3Sdk.RemoveContactFromList();
    contactEmails =
        {
            "emails": [
                req.body.adresse_email
            ]
        };
    apiInstanceContact.removeContactFromList(3, contactEmails).then(data => {
        return res.status(204).send(data)
    }).catch(error => {
        res.status(404).send({info: "vous n\'êtes pas inscrit dans notre liste de diffusion"});
    });
};

exports.updateProfiluser = (req, res) => {
    User.update(
        {
            age: req.body.age,
            telephone: req.body.telephone
        },
        {
            where: {
                login: req.body.login
            }
        }).then(() => {
        return res.status(201).json({message: 'votre profil a été mise à jour !'});
    }).catch(err => {
        res.status(500).send({message: "erreur de mise à jour du profil" + err.reason});
    });
};
