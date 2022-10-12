module.exports = (sequelize, Sequelize) => {

	  {
        // I don't want createdAt and updateAt
          timestamps: false
      }
     	const Gain = sequelize.define('gains', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
          taux: {
              type: Sequelize.STRING
          },
          libelle: {
              type: Sequelize.STRING
          },
          date: {
              type: Sequelize.DATE
          },
          reception: {
              type: Sequelize.INTEGER,
              allowNull: false,
              defaultValue: '0'
	      },
            gagnant:{
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: '0'
            }
	  });
	
	return Gain;
}