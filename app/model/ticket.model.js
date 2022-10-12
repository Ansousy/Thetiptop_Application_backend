module.exports = (sequelize, Sequelize) => {

	const Ticket = sequelize.define('tickets', {
	  id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
	  },
	  numero_ticket: {
		  type: Sequelize.STRING
	  },
	  statut: {
		  type: Sequelize.INTEGER,
		  allowNull: false,
		  defaultValue: '0'
	  }
	});
	
	return Ticket;
}