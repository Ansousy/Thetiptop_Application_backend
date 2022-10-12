module.exports = (sequelize, Sequelize) => {
	const PasswordResetToken  = sequelize.define('resetpassword', {
	  token: {
		  type: Sequelize.STRING,
		  allowNull: false
	  },
	  dateexpiration: {
		  type: Sequelize.DATE,
		  allowNull: false
	  }
	});
	
	return PasswordResetToken ;
}