const verifySignUp = require('./verifySignUp');
const randomTicket = require('./randomTicketGenerator.js');
const authJwt = require('./verifyJwtToken');


module.exports = function (app) {

    const controller = require('../controller/userController.js');
    //const controllerRandom = require('../controller/randomTicketGenerator.js');
    const controllerToPlay = require('../controller/jouerController.js');

    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "*");
        res.header("Access-Control-Allow-Headers", "x-access-token, Origin, Content-Type, Accept");
        res.removeHeader("X-Powered-By");
        res.setHeader("X-XSS-Protection", "1; mode=block");
        next();
    });

    app.post('/api/auth/signup', [verifySignUp.checkInvalidFirstAndLastName, verifySignUp.checkInvalidEmailAdress,
        verifySignUp.checkDuplicateUserNameOrEmail, verifySignUp.checkInvalidTelephoneNumber, verifySignUp.checkValidFormRegister],
        controller.signup);
    app.post('/api/auth/signin', [verifySignUp.checkBlockingUser], controller.signin);
    app.post('/api/auth/loginWithSocialNetwork', controller.loginWithSocialNetwork);
    app.post('/api/auth/recover/password', [verifySignUp.checkExistingEmail], controller.recoverPassword);
    app.post('/api/auth/reset/password/:token', [verifySignUp.checkValidPasswordToken], controller.newPassword);
    app.get('/api/auth/valider/inscription/:token', [authJwt.validFormatToken], controller.registerConfirmation);
    app.post('/api/auth/reset/user/password', [verifySignUp.verifyEqualPassword], controller.initializedPassword);


    app.get('/api/test/employe', [authJwt.verifyToken, authJwt.isEmpOrAdmin], controller.managementBoard);
    app.put('/api/test/employe/valider/:id', [authJwt.verifyToken], controllerToPlay.setValiderReception);
    app.get('/api/test/employe/listes/gains', [authJwt.verifyToken], controller.findAllGains);
    app.get('/api/test/employe/filtrer', [authJwt.verifyToken], controller.queryGainsByNumberOfTicketAndName);

    app.get('/api/test/admin', [authJwt.verifyToken, authJwt.isAdmin], controller.adminBoard);
    app.get('/api/test/admin/listes/gains', [authJwt.verifyToken], controller.findAllGains);
    app.get('/api/test/admin/listes/gains/:id', [authJwt.verifyToken], controller.findEarningById);
    app.get('/api/test/admin/generer/tickets', [authJwt.verifyToken,verifySignUp.checkRandomTicket],
        [randomTicket.randomTicketSixtyPercent, randomTicket.randomTicketTwentyPercent,
        randomTicket.randomTicketTenPercent, randomTicket.randomTicketSixPercent, randomTicket.randomTicketFourPercent]
        , controller.addTicket);
    app.get('/api/test/admin/tickets/restants', [authJwt.verifyToken], controllerToPlay.getNumberTicketRemains);
    app.get('/api/test/admin/tickets/total', [authJwt.verifyToken], controllerToPlay.getNumberTotalOfTickets);
    app.get('/api/test/admin/nombre/participants', [authJwt.verifyToken], controllerToPlay.getNumberOfParticipants);
    app.get('/api/test/admin/tickets/repartitions', controllerToPlay.getDistributionByPercentage);
    app.get('/api/test/admin/tickets/evolutions', controllerToPlay.getEarningsByLibelle);
    app.post('/api/test/admin/email', [authJwt.verifyToken], controllerToPlay.sendEmail);
    app.get('/api/test/admin/tirage-au-sort', [authJwt.verifyToken, verifySignUp.checkWinnerExist], controllerToPlay.drawingLots);
    app.get('/api/test/admin/client/gagnant', [authJwt.verifyToken], controllerToPlay.userWinner);
    app.get('/api/test/admin/liste-utilisateurs', [authJwt.verifyToken], controller.userList);
    app.get('/api/test/admin/liste-roles', [authJwt.verifyToken], controller.rolesList);
    app.get('/api/test/admin/utilisateur/info/:id', [authJwt.verifyToken], controller.getUser);
    app.get('/api/test/admin/filtrer', [authJwt.verifyToken], controller.queryGainsByLibelle);
    app.get('/api/test/admin/envoyer/campagne', [authJwt.verifyToken], controllerToPlay.sendCampaign);
    app.get('/api/test/admin/filtrer/nom/user', [authJwt.verifyToken], controller.queryByNameUser);

    app.get('/api/test/user', [authJwt.verifyToken], controller.userContent);
    app.get('/api/test/user/listes/gains/:userId', [authJwt.verifyToken], controller.findAllGainsByIdUser);
    app.post('/api/test/user/jouer/:userId', [authJwt.verifyToken], controllerToPlay.checkNumberTicketAndSave);
    app.put('/api/auth/updateUser', [verifySignUp.checkInvalidEmailAdress, verifySignUp.checkInvalidFirstAndLastName
        , verifySignUp.checkInvalidTelephoneNumber, verifySignUp.checkValidFormEdit], controller.updateUser);
    app.post('/api/auth/addUser', [verifySignUp.checkInvalidEmailAdress, verifySignUp.checkDuplicateUserNameOrEmail,
        verifySignUp.checkInvalidFirstAndLastName, verifySignUp.checkInvalidTelephoneNumber, verifySignUp.checkInvalidAge,
        authJwt.verifyToken, verifySignUp.checkPermissionRolesAdmin], controller.addUser);
    app.delete('/api/deleteUser/:id', [authJwt.verifyToken], controller.deleteUser);
    app.get('/api/test/user/filtrer/libelle/:userId', [authJwt.verifyToken], controller.queryGainsUserByLibelle);
    app.get('/api/test/user/info/:id', [authJwt.verifyToken], controller.getUser);
    app.put('/api/test/user/edition/profil', [verifySignUp.checkInvalidEmailAdress, authJwt.verifyToken,
        verifySignUp.checkInvalidFirstAndLastName, verifySignUp.checkInvalidTelephoneNumber, verifySignUp.checkValidFormEdit], controller.updateProfil);
    app.post('/api/test/user/desinscription/news', [authJwt.verifyToken], controller.unsubscribe);
    app.put('/api/test/user/completer/profil/user', [authJwt.verifyToken, verifySignUp.checkInvalidTelephoneNumber, verifySignUp.checkInvalidAge], controller.updateProfiluser);

}
