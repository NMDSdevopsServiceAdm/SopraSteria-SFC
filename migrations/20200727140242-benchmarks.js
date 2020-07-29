'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
   const Benchmarks = queryInterface.createTable('Benchmarks', {
    CssrIDFK: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
    //   references: {
    //     model: {
    //       tableName: 'Cssr',
    //       schema: 'cqc'
    //     },
    //     key: 'CssrID'
    //   },
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
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
   return queryInterface.dropTable({
     tableName: 'Benchmarks',
     schema: 'cqc'
   });
  }
};
