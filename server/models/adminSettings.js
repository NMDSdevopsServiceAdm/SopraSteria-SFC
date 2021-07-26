'use strict';
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
      Data: {
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

  AdminSettings.getValue = getValue;
  AdminSettings.setValue = setValue;

  return AdminSettings;
};

const getValue = async function (Name) {
  return await this.findOne({
    where: {
      Name,
    },
  });
};

const setValue = async function (Name, value) {
  return await this.update(
    { Data: value },
    {
      where: {
        Name,
      },
    },
  );
};
