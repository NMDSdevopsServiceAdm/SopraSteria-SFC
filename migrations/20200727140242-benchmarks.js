'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
   const Benchmarks = queryInterface.createTable('Benchmarks', {
    CssrIDFK: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
    },
    MainServiceFK: {
      type:Sequelize.DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: {
          tableName: 'services',
          schema: 'cqc'
        },
        key: 'reportingID'
      }
    },
    Pay: {
      type:Sequelize.DataTypes.INTEGER,
      allowNull: true,
    },
    Sickness: {
      type:Sequelize.DataTypes.INTEGER,
      allowNull: true,
    },
    Turnover: {
      type:Sequelize.DataTypes.DECIMAL(3,2),
      allowNull: true,
    },
    Qualifications: {
      type:Sequelize.DataTypes.DECIMAL(3,2),
      allowNull: true,
    },
    Workplaces: {
      type:Sequelize.DataTypes.INTEGER,
      allowNull: false,
    },
    Staff: {
      type:Sequelize.DataTypes.INTEGER,
      allowNull: false,
    },
   },
   {
    schema: 'cqc'
   }
   )



   return Benchmarks;
  },

  down: (queryInterface, Sequelize) => {
   return queryInterface.dropTable({
     tableName: 'Benchmarks',
     schema: 'cqc'
   });
  }
};
