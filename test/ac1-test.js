process.env.NODE_ENV = 'test';
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
const db = require('../app/config/db.config.js');
const jwt = require("jsonwebtoken");
const config = require("../app/config/config");
const {mysql} = require("sequelize/lib/data-types");
const bcrypt = require("bcryptjs");
const {now} = require("sequelize/lib/utils");

const Gain = db.gain;
const User = db.user;
const Ticket = db.ticket;
chai.use(chaiHttp);

let user = {
    "nom": "admin",
    "prenom": "administrateur",
    "login": "admin@gmail.com",
    "roles": [
        "admin"
    ],
    password: bcrypt.hashSync("1234567", 8),
    "status": "activated"
};

let myuser = {
    "nom": "test",
    "prenom": "userTest",
    "login": "test@gmail.com",
    "age": 25,
    "telephone": "07 67 80 67 89",
    "roles": [
        "user"
    ],
    password: "12345678"

};
const user_George = new User({
    nom: "george",
    prenom: "sauvage",
    login: "geo@gmail.com",
    age: 25,
    telephone: "07 67 80 67 89",
    roles: [
        "user"
    ],
    password: "1234567"
});
const ticket = new Ticket({
    numero_ticket : '2yeeowx3ut',
    statut: '0'
})


var token = jwt.sign({id: user.login}, config.secret, {
    expiresIn: 86400 // expires in 24 hours
});


/************************** TEST CRUD  AND USER AUTHENTICATION *******************************************/
describe("GET  user by id", () => {
    it("should return an user if valid id is passed", async () => {
        const userHana = new User({
            nom: "hana",
            prenom: "khelil",
            login: "khelil@gmail.com",
            age: 35,
            telephone: "07 67 10 67 89",
            roles: [
                "user"
            ],
            password: bcrypt.hashSync("1234567", 8),
            status: 'activated'

        });
        await userHana.save();
        userId = userHana.id;
        const res = await chai.request(server).get("/api/test/user/info/" + userId)
            .set("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept")
            .set('x-access-token', token);
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('nom').and.to.be.a('string');
    });
});


describe("Get id user not exist  ", () => {
    describe("Try to get  user by Id not exist", () => {
        it("should return 404 error when valid object id is passed but does not exist", async () => {
            const res = await chai.request(server).get("/api/test/user/info/5f43ef20c1d4a133e4628181")
                .set('x-access-token', token);
            res.should.have.status(404);
            res.body.should.be.a('object');
            res.body.should.have.property("message").eql("Utilisateur non trouvé");
        });
    });
});


describe("POST / authenticate user", () => {
    it("should connect succesfully an user", async () => {
        const userAurelien = new User({
            nom: "aurelien",
            prenom: "utilisateur",
            login: "hamza@gmail.com",
            age: 25,
            telephone: "07 07 10 67 89",
            confirmationcode: "",
            roles: [
                "user"
            ],
            status: "activated",
            stateaccount: "unblocked",
            expirydate: "2022-01-17 12:38:37",
            password: bcrypt.hashSync("1234567", 8)
        });
        await userAurelien.save();
        userId = userAurelien.id;
        const res = await chai.request(server)
            .post("/api/auth/signin")
            .set('Content-type', 'application/json')
            .set('Accept', 'application/json')
            .set("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept")
            .send({login: userAurelien.login, password: "1234567"})
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('auth').and.to.be.true;
    });
});


describe("PUT /:id user", () => {
    it("should update the existing user and return status 200", async () => {
        const users = new User({
            nom: "ibrahim",
            prenom: "savane",
            login: "savane@gmail.com",
            age: 25,
            telephone: "07 67 10 67 89",
            roles: [
                "user"
            ],
            password: bcrypt.hashSync("1234567", 8)
        });
        await users.save();
        userId = users.id;
        const res = await chai.request(server)
            .put("/api/test/user/edition/profil")
            .set('Content-type', 'application/json')
            .set('Accept', 'application/json')
            .set("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept")
            .set('x-access-token', token)
            .send({
                nom: "ibrahim sorry",
                prenom: "sy savané",
                login: "savane@gmail.com",
                age: 25,
                telephone: "07 67 10 67 89",
                roles: [
                    "user"
                ],
                password: "1234567",
                id: userId
            });

        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property("message").eql("Le profil a été mis à jour !");
    });
});


describe("POST / invalid authentication", () => {
    describe("Reject invalid authentication", () => {
        it("should not connect an user and return 404", (done) => {
            chai.request(server)
                .post('/api/auth/signin')
                .set('Content-type', 'application/json')
                .set('Accept', 'application/json')
                .send({login: 'machin@gmail.com', password: 'machin123'})
                .end((err, res) => {
                    res.should.have.status(404);
                    res.body.should.be.a('object');
                    res.body.should.have.property('reason').eql('Adresse e-mail ou mot de passe incorrect. Veuillez réessayer. ');
                    done();
                });
        });
    });
});

describe("POST / Add user ", () => {
    describe("Add new user", () => {
        it("It should add succesfully an new user", async () => {
            const res = await chai.request(server)
                .post('/api/auth/signup')
                .set('Content-type', 'application/json')
                .set('Accept', 'application/json')
                .set("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept")
                .send(myuser);
            res.should.have.status(201);
            res.body.should.be.a('object');
            res.body.should.have.property('messageId').and.to.be.a('string');
        });
    });
});

describe(" POST /Add user already exist", () => {
    describe("Add user already exist", () => {
        it("should return 409 conflicted when user exists", (done) => {
            chai.request(server)
                .post("/api/auth/signup")
                .set('Content-type', 'application/json')
                .set('Accept', 'application/json')
                .set("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept")
                .set('x-access-token', token)
                .send(myuser)
                .end((err, res) => {
                    res.should.have.status(409);
                    res.body.should.be.a('object');
                    res.text.should.be.eql('Cette adresse email est déja associé à un compte utilisateur !');

                    done();
                });
        });
    });
});


describe("DELETE /:id user", () => {
    it("should delete successfuly user by id and return response", async () => {
        const user = new User({
            nom: "george",
            prenom: "sauvage",
            login: "geo@gmail.com",
            age: 25,
            telephone: "07 67 80 67 89",
            roles: [
                "user"
            ],
            password: "1234567"
        });
        await user.save();
        userId = user.id;
        const res = await chai.request(server).delete("/api/deleteUser/" + userId)
            .set('x-access-token', token);
        res.should.have.status(204);
    });
});

describe("DELETE /:id when user already not exit", () => {
    it("should return 404 when user is already deleted or id user does not exist", async () => {
        chai.request(server)
            .get('/api/test/user/info/' + 3536894)
            .set('Content-type', 'application/json')
            .set('Accept', 'application/json')
            .set("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept")
            .set('x-access-token', token)
            .end((err, res) => {
                res.should.have.status(404);
                res.body.should.be.a('object');
                res.body.should.have.property('message').and.to.be.a('string');
                res.body.should.have.property('message').eql('Utilisateur non trouvé');
            });
    });

});
describe("POST / connect user who does not activated account", () => {
it("should not allow user to login if account is not active", async () => {
    let request = chai.request(server);
    const res = await request
        .post("/api/auth/signin")
        .set('Content-type', 'application/json')
        .set('Accept', 'application/json')
        .set("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept")
        .set('x-access-token', token)
        .send({
            "login":myuser.login,
            "password": myuser.password
        });
    res.should.have.status(401);
    res.body.should.be.a('object');
    res.body.should.have.property('reason').and.to.be.a('string').and.to.equal("Compte inactif veuillez vérifier votre boite de méssagerie , pour confirmer votre inscription. ");
});
});

it("should return phone number invalid when user data is not valid", async () => {
    let request = chai.request(server);
    const res = await request
        .post("/api/auth/signup")
        .set('Content-type', 'application/json')
        .set('Accept', 'application/json')
        .set("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept")
        .send({
            "nom": "sy",
            "prenom": "elhadji",
            "telephone": "fsfiioior_78272",
            "age": 23,
            "login": "ansou@gmail.com",
            "password": "123456789",
            "roles": [
                "user"
            ]
        });
    res.should.have.status(400);
    res.body.should.be.a('object');
    res.text.should.be.a('string').and.to.contain("Numéro de téléphone invalide");
});

/******************************* TEST TICKETS USER AND  USER EARNINGS **************************************************/

describe("GET / Add gain and display list Earning user", () => {
    it("It should save ticket and return earning", async () => {
        //await initDatabase();
        await user_George.save();
        userId = user_George.id;
        await ticket.save();
        numero_ticket = ticket.id;
        let gain = new Gain({
            taux: '20%',
            libelle: 'thé détox ou infusion de 100g',
            date: now(),
            userId: userId,
            ticketId: numero_ticket
        });
        await gain.save();

        const gainList = await chai.request(server)
            .get("/api/test/admin/listes/gains" + "?page=0&size=5")
            .set('Content-type', 'application/json')
            .set('Accept', 'application/json')
            .set("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept")
            .set('x-access-token', token)
            .send();
        gainList.should.have.status(200);
        gainList.body.should.be.a('object');
        gainList.body.should.have.property('totalItems');
        gainList.body.should.have.property('totalPages');
        gainList.body.should.have.property('limit');


        gainList.body.should.have.property('gains')
            .and.to.be.a('array');
        var firstItem = gainList.body.gains[0];
        firstItem.should.have.property('id').and.to.be.a('number')
        firstItem.should.have.property('taux').and.to.be.a('string')
        firstItem.should.have.property('libelle').and.to.be.a('string');
        firstItem.should.have.property('date').and.to.be.a('string');
    });
});



describe("POST / Check a valid ticket", () => {
    describe("Check a valid ticket", () => {
        it("Should not found the ticket an return 404", async () => {
            const users = new User({
                nom: "ibrahim",
                prenom: "savane",
                login: "savanes@gmail.com",
                age: 25,
                telephone: "07 67 10 67 89",
                roles: [
                    "user"
                ],
                password: bcrypt.hashSync("1234567", 8)
            });
            await users.save();
            userId = users.id;
            const res = await chai.request(server)
                .post('/api/test/user/jouer/' + userId)
                .set('Content-type', 'application/json')
                .set('Accept', 'application/json')
                .set("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept")
                .set('x-access-token', token)
                .send({numero_ticket: '2yeeowx3uu'});
            res.should.have.status(404);
            res.body.should.be.a('object');
            res.body.should.have.property('message').and.to.be.a('string');
        });
    });
});


describe("GET/ Tickets", () => {
    describe("get tickets repartions", () => {
        it("should get list of  tickets repartitions", (done) => {
            chai.request(server)
                .get('/api/test/admin/tickets/repartitions')
                .set('Content-type', 'application/json')
                .set("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept")
                .set('x-access-token', token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    var firstItem = res.body[0];
                    firstItem.should.have.property('taux').and.to.be.a('string');
                    firstItem.should.have.property('count').and.to.be.a('number');
                    done();
                });
        });
    });
});
