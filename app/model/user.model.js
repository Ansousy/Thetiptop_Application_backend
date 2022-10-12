module.exports = (sequelize, Sequelize) => {
	const User = sequelize.define('users', {
	  nom: {
		  type: Sequelize.STRING
	  },
	  prenom: {
		  type: Sequelize.STRING
	  },
	  login: {
		  type: Sequelize.STRING
	  },
	  password: {
		  type: Sequelize.STRING
	  },
		age: {
		  type: Sequelize.STRING
	  },
		telephone: {
		  type: Sequelize.STRING
	  },
		confirmationcode: {
		  type: Sequelize.STRING
	  },
		status: {
		  type: Sequelize.STRING,
			allowNull: false,
			defaultValue: "inactivated"
	  },
		stateaccount: {
		  type: Sequelize.STRING,
	  },
		expirydate: {
			type: Sequelize.DATE
		}

	});
	
	return User;
}