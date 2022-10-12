const db = require('../config/db.config.js');
const config = require('../config/config.js');
const Ticket = db.ticket;

//length = 900 000  tickets
randomTicketSixtyPercent = (req, res, next) => {
    var a = 9,
        b = 'abcdefghijklmnopqrstuvwxyz123456789',
        test = false,
        arr = [];

    for (var j = 0; j < 900000; j++) {
        c = '';
        for (i = 0; i < a; i++)
            c += b[Math.floor(Math.random() * b.length)];

        arr.push('1' + c)
    }
    /*
    ** remove duplicates from the Array if they exist
    ** Test the length of two arrays
    */
    var uniqueArr = [...new Set(arr)]
    if (uniqueArr.length == arr.length)
        test = false;
    else
        test = true;

    /*
    ** while test =  true there are not unique tickets
    ** restart Loop while until test = false
    */

    do {
        for (var j = 0; j < (arr.length - uniqueArr.length); j++) {
            c = '';
            for (i = 0; i < a; i++)
                c += b[Math.floor(Math.random() * b.length)];

            uniqueArr.push('1' + c)
        }
        result = [...new Set(uniqueArr)]
        if (uniqueArr.length == arr.length)
            test = false;
        else
            test = true;
    } while (test == true)

    let ticket = {};
    data = []

    uniqueArr.forEach(
        (tickets) => {
            data.push({"numero_ticket": tickets});
        });
    //insert tickets into  BD -> table tickets
     Ticket.bulkCreate(data).then(() => {
        // send uploading message to client
        res.status(200);
        return;
    });
    next();

};

//length = 300 000  tickets
randomTicketTwentyPercent = (req, res, next) => {
    var a = 9,
        b = 'abcdefghijklmnopqrstuvwxyz123456789',
        test = false,
        arr = [];

    for (var j = 0; j < 300000; j++) {
        c = '';
        for (i = 0; i < a; i++)
            c += b[Math.floor(Math.random() * b.length)];

        arr.push('2' + c)
    }
    /*
    ** remove duplicates from the Array if they exist
    ** Test the length of two arrays
    */
    var uniqueArr = [...new Set(arr)]
    if (uniqueArr.length == arr.length)
        test = false;
    else
        test = true;

    /*
    ** while test =  true there are not unique tickets
    ** restart Loop while until test = false
    */

    do {
        for (var j = 0; j < (arr.length - uniqueArr.length); j++) {
            c = '';
            for (i = 0; i < a; i++)
                c += b[Math.floor(Math.random() * b.length)];

            uniqueArr.push('2' + c)
        }
        result = [...new Set(uniqueArr)]
        if (uniqueArr.length == arr.length)
            test = false;
        else
            test = true;
    } while (test == true)

    let ticket = {};
    data = []

    uniqueArr.forEach(
        (tickets) => {
            data.push({"numero_ticket": tickets});
        });
    //insert tickets into  BD -> table tickets
    Ticket.bulkCreate(data).then(() => {
        res.status(200);
        return
    });
    next();

};

//length = 150 000  tickets
randomTicketTenPercent = (req, res,next) => {
    var a = 9,
        b = 'abcdefghijklmnopqrstuvwxyz123456789',
        test = false,
        arr = [];

        for (var j = 0; j < 150000; j++) {
            c = '';
            for (i = 0; i < a; i++)
                c += b[Math.floor(Math.random() * b.length)];

            arr.push('3' + c)
        }
        /*
        ** remove duplicates from the Array if they exist
        ** Test the length of two arrays
        */
        var uniqueArr = [...new Set(arr)]
        if (uniqueArr.length == arr.length)
            test = false;
        else
            test = true;

        /*
        ** while test =  true there are not unique tickets
        ** restart Loop while until test = false
        */

        do {
            for (var j = 0; j < (arr.length - uniqueArr.length); j++) {
                c = '';
                for (i = 0; i < a; i++)
                    c += b[Math.floor(Math.random() * b.length)];

                uniqueArr.push('3' + c)
            }
            result = [...new Set(uniqueArr)]
            if (uniqueArr.length == arr.length)
                test = false;
            else
                test = true;
        } while (test == true)

        let ticket = {};
        data = []

        uniqueArr.forEach(
            (tickets) => {
                data.push({"numero_ticket": tickets});
            });
        //insert tickets into  BD -> table tickets
        Ticket.bulkCreate(data).then(() => {
            res.status(200);
            return
        });
    next();
}

//length = 90 000  tickets
randomTicketSixPercent = (req, res,next) => {
    var a = 9,
        b = 'abcdefghijklmnopqrstuvwxyz123456789',
        test = false,
        arr = [];

        for (var j = 0; j < 90000; j++) {
            c = '';
            for (i = 0; i < a; i++)
                c += b[Math.floor(Math.random() * b.length)];

            arr.push('4' + c)
        }
        /*
        ** remove duplicates from the Array if they exist
        ** Test the length of two arrays
        */
        var uniqueArr = [...new Set(arr)]
        if (uniqueArr.length == arr.length)
            test = false;
        else
            test = true;

        /*
        ** while test =  true there are not unique tickets
        ** restart Loop while until test = false
        */

        do {
            for (var j = 0; j < (arr.length - uniqueArr.length); j++) {
                c = '';
                for (i = 0; i < a; i++)
                    c += b[Math.floor(Math.random() * b.length)];

                uniqueArr.push('4' + c)
            }
            result = [...new Set(uniqueArr)]
            if (uniqueArr.length == arr.length)
                test = false;
            else
                test = true;
        } while (test == true)

        let ticket = {};
        data = []

        uniqueArr.forEach(
            (tickets) => {
                data.push({"numero_ticket": tickets});
            });
        //insert tickets into  BD -> table tickets
        Ticket.bulkCreate(data).then(result => {
            res.status(200);
        });
    next();
}
//length = 60 000  tickets
randomTicketFourPercent = (req, res,next) => {
    var a = 9,
        b = 'abcdefghijklmnopqrstuvwxyz123456789',
        test = false,
        arr = [];

        for (var j = 0; j < 60000; j++) {
            c = '';
            for (i = 0; i < a; i++)
                c += b[Math.floor(Math.random() * b.length)];

            arr.push('5' + c)
        }
        /*
        ** remove duplicates from the Array if they exist
        ** Test the length of two arrays
        */
        var uniqueArr = [...new Set(arr)]
        if (uniqueArr.length == arr.length)
            test = false;
        else
            test = true;

        /*
        ** while test =  true there are not unique tickets
        ** restart Loop while until test = false
        */

        do {
            for (var j = 0; j < (arr.length - uniqueArr.length); j++) {
                c = '';
                for (i = 0; i < a; i++)
                    c += b[Math.floor(Math.random() * b.length)];

                uniqueArr.push('5' + c)
            }
            result = [...new Set(uniqueArr)]
            if (uniqueArr.length == arr.length)
                test = false;
            else
                test = true;
        } while (test == true)

        let ticket = {};
        data = []

        uniqueArr.forEach(
            (tickets) => {
                data.push({"numero_ticket": tickets});
            });
        //insert tickets into  BD -> table tickets
        Ticket.bulkCreate(data).then(() => {
            // send uploading message to client
            res.status(200);
        });
    next();
}


const randomTicketGenerator = {};
randomTicketGenerator.randomTicketSixtyPercent = randomTicketSixtyPercent;
randomTicketGenerator.randomTicketTwentyPercent =randomTicketTwentyPercent;
randomTicketGenerator.randomTicketTenPercent=randomTicketTenPercent;
randomTicketGenerator.randomTicketSixPercent=randomTicketSixPercent;
randomTicketGenerator.randomTicketFourPercent=randomTicketFourPercent;

module.exports = randomTicketGenerator;
