require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })
const env = {
    database: 'thetiptop' ,
    username: 'root',
    //password: process.env.MYSQL_ROOT_PASSWORD,
    //host: process.env.DB_HOST,
    password: '',
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 50,
        min: 0,
        acquire: 1200000,
        idle: 1000000
    }
};

module.exports = env;
