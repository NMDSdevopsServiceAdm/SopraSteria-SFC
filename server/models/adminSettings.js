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
      timestamps: false,
    },
  );

  AdminSettings.getLADates = getLADates;

  return AdminSettings;
};

const getLADates = async function () {
  return this.findAll({
    where: {
      Name: ['laReturnStartDate', 'laReturnEndDate'],
    },
  });
};
