/* jshint indent: 2 */
const { Op } = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  const Location = sequelize.define(
    'location',
    {
      locationid: {
        type: DataTypes.TEXT,
        allowNull: false,
        primaryKey: true,
        unique: true,
      },
      locationname: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      addressline1: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      addressline2: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      towncity: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      county: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      postalcode: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      mainservice: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdat: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedat: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      providerid: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'location',
      schema: 'cqcref',
      createdAt: false,
      updatedAt: false,
    },
  );

  Location.findByLocationID = async function (locationID) {
    return await this.findOne({
      where: {
        locationid: locationID,
      },
    });
  };

  Location.findMultipleByLocationID = async function (locationIDs) {
    return await this.findAll({
      attributes: ['locationid'],
      where: {
        locationid: { [Op.in]: locationIDs }
      }
    })
  }

  Location.findByPostcode = async function (postcode) {
    return await this.findAll({
      where: {
        postalcode: postcode,
      },
    });
  };

  Location.updateProviderID = async function (locationID, providerID) {
    return this.update(
      { providerid: providerID, updatedat: new Date() },
      {
        where: {
          locationid: locationID,
        },
      },
    );
  };

  return Location;
};
