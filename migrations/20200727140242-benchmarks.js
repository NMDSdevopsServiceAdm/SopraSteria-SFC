'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
   return queryInterface.createTable('Benchmarks', {
    CssrID: {
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
   }).then(() => queryInterface.addConstraint({
    tableName: 'Benchmarks',
    schema: 'cqc'
  }, ['CssrID', 'MainServiceFK'], {
    type: 'primary key',
    name: 'benchmarks_pkey'
  }));
  },

  down: (queryInterface, Sequelize) => {
   return queryInterface.dropTable({
     tableName: 'Benchmarks',
     schema: 'cqc'
   });
  }
};
