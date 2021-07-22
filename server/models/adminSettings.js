'use strict';
const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const AdminSettings = sequelize.define(
    'AdminSettings',
    {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      Value: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
    },
    {
      tableName: 'AdminSettings',
      schema: 'cqc',
    },
  );

  AdminSettings.getLADates = async function () {
    return this.findAll({
      where: {
        Name: ['laReturnStartDate', 'laReturnEndDate'],
        // Name: {
        //   [Op.in]: ['laReturnStartDate', 'laReturnEndDate'],
        // },
      },
    });
  };

  return AdminSettings;
};
