'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn(
      {
        tableName: 'postcodes',
        schema: 'cqcref',
      },
      'thoroughfare',
      {
        type: Sequelize.STRING,
        allowNull: true,
      },
    ),
      queryInterface.addColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'building_name',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      ),
      queryInterface.addColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'sub_building_name',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      ),
      queryInterface.addColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'sub_building_number',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      ),
      queryInterface.addColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'building_number',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      ),
      queryInterface.addColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'line_1',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      ),
      queryInterface.addColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'line_2',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      ),
      queryInterface.addColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'line_3',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      ),
      queryInterface.addColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'line_4',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      ),
      queryInterface.addColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'locality',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      ),
      queryInterface.addColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'town_or_city',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      ),
      queryInterface.addColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'county',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      ),
      queryInterface.addColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'district',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      ),
      queryInterface.addColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'country',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
      );
  },

  async down(queryInterface) {
    queryInterface.removeColumn(
      {
        tableName: 'postcodes',
        schema: 'cqcref',
      },
      'thoroughfare',
    ),
      queryInterface.removeColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'building_name',
      ),
      queryInterface.removeColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'sub_building_name',
      ),
      queryInterface.removeColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'sub_building_number',
      ),
      queryInterface.removeColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'building_number',
      ),
      queryInterface.removeColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'line_1',
      ),
      queryInterface.removeColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'line_2',
      ),
      queryInterface.removeColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'line_3',
      ),
      queryInterface.removeColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'line_4',
      ),
      queryInterface.removeColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'locality',
      ),
      queryInterface.removeColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'town_or_city',
      ),
      queryInterface.removeColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'county',
      ),
      queryInterface.removeColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'district',
      ),
      queryInterface.removeColumn(
        {
          tableName: 'postcodes',
          schema: 'cqcref',
        },
        'country',
      );
  },
};
