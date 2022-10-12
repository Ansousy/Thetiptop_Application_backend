const db = require('../config/db.config.js');
const config = require('../config/config.js');
const User = db.user;
const Role = db.role;
const Ticket = db.ticket;
const Gain = db.gain;
const Op = db.Sequelize.Op;

var SibApiV3Sdk = require('sib-api-v3-sdk');
var defaultClient = SibApiV3Sdk.ApiClient.instance;

//Configure API key authorization: api-key
var apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = 'MyKey';
var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
var sendEmail = new SibApiV3Sdk.SendSmtpEmail();
var dataForm = {}
let apiSendCampaignInstance = new SibApiV3Sdk.EmailCampaignsApi();




const {RateLimiterRedis} = require('rate-limiter-flexible');
const redis = require('redis');
const redisClient = redis.createClient({
   enable_offline_queue: false,
    host: 'localhost',
    //host: 'redis',
    port: '6379'
});
const opts = {
    redis: redisClient,
    points: 6, // 5 points
    duration: 30, // Per 15 minutes
    blockDuration: 5 * 60, // block for 15 minutes if more than points consumed
};
const rateLimiter = new RateLimiterRedis(opts);


// -> Configure send email by sendinblue
exports.sendEmail = (req, res) => {
    dataForm = {
        nom: req.body.nom,
        objet: req.body.objet,
        email: req.body.email,
        message: req.body.message
    };

    sendSmtpEmail = {
        sender: {
            "name": "ThéTiTop jeux concours ",
            "email": "thetiptop@jeux-concours.fr"
        },
        to: [
            {
                "email": dataForm.email,
                "name": " M. " + dataForm.nom
            }
        ],
        subject: dataForm.objet,
        htmlContent: "<html><head></head><body><p>" + dataForm.message + "</p></body></html>"

    }
    apiInstance.sendTransacEmail(sendSmtpEmail).then(data => {
        res.status(200).send(data)
    }).catch(err => {
            res.status(400).send({reason: err.message});
        }
    );
}

// -> Check if Number of ticket exist and  has not already been used and generate earning of user
exports.checkNumberTicketAndSave = async   (req, res, next) => {
    var d = new Date,
        dformat = [d.getFullYear(),
                d.getMonth() + 1,
                d.getDate()].join('-') + ' ' +
            [d.getHours(),
                d.getMinutes(),
                d.getSeconds()].join(':');

   const user = await User.findOne({where: {id: req.params.userId}});
   if (user.stateaccount == "blocked") {
        return res.status(404).send({reason: "Votre compte sera débloqué le   "+user.expirydate});
    }
    try {
        Ticket.findOne({
            where: {
                numero_ticket: req.body.numero_ticket,
                statut: '0'
            }
        }).then(ticket => {

            if (!ticket) {
                return res.status(404).send({message: "Veuillez verifier les informations du ticket saisie"});

                // Consume 1 point for each failed login attempt
                /*rateLimiter.consume(req.connection.remoteAddress)
                    .then((data) => {
                        console.log(req.connection.remoteAddress)
                        // Message to user
                        return res.status(404).send({message: " tentatives restantes " + data.remainingPoints});
                    })
                    .catch((rateLimiterRes) => {
                        // Blocked
                        //update ticket table set statut ticket = 1 -> non usable ticket
                        const minwait = Date.now() + 3*60*1000
                        User.update({stateaccount: 'blocked', expirydate: minwait},
                            {returning: true, where: {id: req.params.userId}}
                        )
                        const secBeforeNext = Math.ceil(rateLimiterRes.msBeforeNext / 1000) || 1;
                        res.set('Retry-After', String(secBeforeNext));
                        res.status(429).send({message: 'Trop de tentatives frauduleuses, votre compte sera bloqué pour 1H de temps '});
                    });*/

            } else {
                const strNumero = ticket.numero_ticket
                const ticketId = ticket.id
                if (strNumero.substring(0, 1) == '1') {
                    Gain.create({
                        taux: '60%',
                        libelle: 'un infuseur à thé',
                        date: dformat,
                        userId: req.params.userId,
                        ticketId: ticketId,
                    }).then(result => {
                        res.send({message: "Félicitation vous avez gagné !!! "});
                        return;
                    })

                } else if (strNumero.substring(0, 1) == '2') {
                    Gain.create({
                        taux: '20%',
                        libelle: 'thé détox ou infusion de 100g',
                        date: dformat,
                        userId: req.params.userId,
                        ticketId: ticketId
                    }).then(result => {
                        res.status(200).send({message: "Félicitation vous avez gagné !!! "});
                        return;
                    })
                } else if (strNumero.substring(0, 1) == '3') {
                    Gain.create({
                        taux: '10%',
                        libelle: 'thé signature de 100g',
                        date: dformat,
                        userId: req.params.userId,
                        ticketId: ticketId
                    }).then(result => {
                        res.status(200).send({message: "Félicitation vous avez gagné !!! "});
                        return;
                    })
                } else if (strNumero.substring(0, 1) == '4') {
                    Gain.create({
                        taux: '6%',
                        libelle: "Coffret découverte de 39 euros ",
                        date: dformat,
                        userId: req.params.userId,
                        ticketId: ticketId
                    }).then(result => {
                        res.status(200).send({message: "Félicitation vous avez gagné !!! "});
                        return;
                    })
                } else if (strNumero.substring(0, 1) == '5') {
                    Gain.create({
                        taux: '4%',
                        libelle: "Coffret découverte  de 69 euros",
                        date: dformat,
                        userId: req.params.userId,
                        ticketId: ticketId
                    }).then(result => {
                        res.status(200).send({message: "Félicitation vous avez gagné !!! "});
                        return;
                    })
                }
                //update ticket table set statut ticket = 1 -> non usable ticket
                Ticket.update({statut: '1'},
                    {returning: true, where: {id: ticketId}}
                )
                // send confimation email to user in order to inform this earning

                User.findOne({
                    where: {id: req.params.userId}
                }).then(user => {
                    sendEmail = {
                        sender: {
                            "name": "ThéTiTop jeux concours ",
                            "email": "thetiptop@jeux-concours.fr"
                        },
                        to: [{
                            email: user.dataValues.login,
                            name: 'M. ' + user.dataValues.nom + '  ' + user.dataValues.prenom
                        }],
                        templateId: 1,
                        headers: {
                            'api-key': 'MyKey',
                            'content-type': 'application/json',
                            'accept': 'application/json'
                        }

                    };
                });
            }
        });
    } catch (err) {
        next(err);
    }
}
//Number of tickets remains
exports.getNumberTicketRemains = async (req, res) => {
    const ticketRemains = await Ticket.count({
        where: {statut: '0'}
    });
    var ticketsPercentage = Math.trunc((ticketRemains/1500000)*100);
        res.status(200).send({
            "ticketRestant": ticketRemains,
            "ticketPourcentage": ticketsPercentage
    })
}

//Number total of tickets
exports.getNumberTotalOfTickets = (req, res) => {
    Ticket.count({}).then(ticket => {
        res.status(200).send({
            "totalTickets": ticket
        })
    })
}

//nombre of participants
exports.getNumberOfParticipants = (req, res) => {
    Gain.count({}).then(participant => {
        res.status(200).send({
            "participants": participant
        })
    })
}

//Distribution of tickets by percentage
exports.getDistributionByPercentage = (req, res) => {
    Gain.count({
        group: 'taux',
        attributes: [
            'taux'
        ]
    }).then(repartition => {
        res.status(200).send(
            repartition
        )
    })
}
//Evolution earnings  by libelle
exports.getEarningsByLibelle = (req, res) => {
    Gain.count({
        group: 'libelle',
        attributes: [
            'libelle'
        ]
    }).then(evolution => {
        res.status(200).send(evolution)
    })
}

//Evolution earnings  by libelle
exports.setValiderReception = (req, res) => {
    Gain.update({reception: req.body.reception},
        {where: {id: req.params.id}}
    ).then(reception => {
        reception = reception ? 0 : 1;
        res.status(200).json({
            "reception": reception
        });
    })
}
//Big Drawing of lots
var gainUser = {};
exports.drawingLots = async (req, res) => {
    const gains = await Gain.findAll({
        include: [
            {
                model: User,
                attributes: ['id', 'nom', 'prenom', 'login', 'telephone']
            }
        ]
    });
    if (gains.length > 0) {
        var rand = Math.floor(Math.random() * gains.length)
        gainUser = gains[rand];
    }else {
        return res.status(400).send({message: "Tirage au sort impossible , il n'y a aucun  participant"});
    }

    Gain.update({gagnant: '1'}, {
        where: {id: gainUser.id}
    }).then(() => {
        Gain.findOne({
            include: [
                {
                    model: User,
                    attributes: ['id', 'nom', 'prenom', 'login', 'telephone']
                }
            ],
            where: {gagnant: '1'}
        }).then(
            gain => {
                return res.status(200).send(gain)
            }).catch(err => {
            res.status(500).send({message: "erreur de selection"});
        });
    }).catch(err => {
        res.status(500).send({message: "erreur update"});
    });

};

exports.userWinner = (req, res) => {
    Gain.findOne({
        include: [
            {
                model: User,
                attributes: ['id', 'nom', 'prenom', 'login', 'telephone']
            }
        ],
        where: {gagnant: '1'}
    }).then(
        gain => {
            return res.status(200).send([gain.user])
        }).catch(err => {
        res.status(400).send({message: " Effectuez un tirage pour afficher le vainqueur"});
    });
}

//send campaign
exports.sendCampaign = (req,res)=>{
    //let campaignId = req.params.campaignId;
    let campaignId = 5;
    apiSendCampaignInstance.sendEmailCampaignNow(campaignId).then((data) => {
        return res.status(200).send(data);
    }). catch(error => {
        res.status(400).send({message: "Erreur d'envoie de la campagne"+ error})
        console.error(error);
    });

}




