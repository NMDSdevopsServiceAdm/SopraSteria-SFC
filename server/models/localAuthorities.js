'use strict';

const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const LocalAuthorities = sequelize.define(
    'LocalAuthorities',
    {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      EstablishmentFK: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      LocalAuthorityName: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      LastYear: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ThisYear: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Status: {
        type: DataTypes.ENUM,
        values: [
          'Not updated',
          'Update, not complete',
          'Update, complete',
          'Confirmed, not complete',
          'Confirmed, complete',
        ],
      },
      Notes: DataTypes.TEXT,
      LocalAuthorityUID: {
        type: DataTypes.UUID,
        unique: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
    },
    {
      tableName: 'LocalAuthorities',
      schema: 'cqc',
      timestamps: false,
    },
  );

  LocalAuthorities.associate = function (models) {
    LocalAuthorities.belongsTo(models.establishment, {
      foreignKey: 'EstablishmentFK',
      targetKey: 'id',
    });
  };

  LocalAuthorities.getAll = async function () {
    return await this.findAll({
      attributes: ['LocalAuthorityName', 'ThisYear', 'Status', 'Notes', 'LocalAuthorityUID'],
      include: [
        {
          model: sequelize.models.establishment,
          attributes: ['nmdsId'],
        },
      ],
    });
  };

  LocalAuthorities.findById = async function (uid) {
    return await this.findOne({
      where: {
        LocalAuthorityUID: uid,
      },
      attributes: ['LocalAuthorityName', 'ThisYear', 'Status', 'Notes'],
    });
  };

  LocalAuthorities.updateLA = async function (uid, values) {
    return await this.update(values, {
      where: {
        LocalAuthorityUID: uid,
      },
    });
  };

  LocalAuthorities.resetLocalAuthorities = async function () {
    return await this.update(
      {
        LastYear: sequelize.col('ThisYear'),
        ThisYear: 0,
        Status: 'Not updated',
        Notes: null,
      },
      {
        where: {
          ID: {
            [Op.not]: null,
          },
        },
      },
    );
  };

  return LocalAuthorities;
};
