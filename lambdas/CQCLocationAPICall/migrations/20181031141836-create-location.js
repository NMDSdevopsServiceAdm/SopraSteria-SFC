'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('cqc.location', {
      cqcid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      locationname: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      postalcod: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdat: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedat: {
        type: DataTypes.DATE,
        allowNull: true
      },
      locationid: {
        type: DataTypes.TEXT,
        allowNull: true,
        unique: true
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('cqc.location');
  }
};
