const env = require('./env.js');

const Sequelize = require('sequelize');
const sequelize = new Sequelize(env.database, env.username, env.password, {
  host: env.host,
  dialect: env.dialect,
  operatorsAliases: false,
 
  pool: {
    max: env.pool.max,
    min: env.pool.min,
    acquire: env.pool.acquire,
    idle: env.pool.idle
  }
});
 
const db = {};
 
db.Sequelize = Sequelize;
db.sequelize = sequelize;
 
db.user = require('../model/user.model.js')(sequelize, Sequelize);
db.role = require('../model/role.model.js')(sequelize, Sequelize);
db.ticket = require('../model/ticket.model.js')(sequelize, Sequelize);
db.gain = require('../model/gain.model.js')(sequelize, Sequelize);
db.resetpassword = require('../model/resetpassword.model.js')(sequelize, Sequelize);

/*********************************/
db.role.belongsToMany(db.user, { through: 'user_roles', foreignKey: 'roleId', otherKey: 'userId'});
db.user.belongsToMany(db.role, { through: 'user_roles', foreignKey: 'userId', otherKey: 'roleId'});
/*******************************************/
db.user.hasMany(db.gain);
db.gain.belongsTo(db.user);

db.ticket.hasMany(db.gain);
db.gain.belongsTo(db.ticket);
/********************************************/
db.user.hasMany(db.resetpassword)
db.resetpassword.belongsTo(db.user)
/********************************************/


module.exports = db;
