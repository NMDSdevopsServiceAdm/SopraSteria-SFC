'use strict';
module.exports = (sequelize, DataTypes) => {
  const pcodedata = sequelize.define('pcodedata', {
    uprn: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    sub_building_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    building_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    building_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    street_description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    post_town: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    postcode: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    local_custodian_code: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    county: {
      type: DataTypes.STRING,
      allowNull: true
    },
    rm_organisation_name: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    schema: 'cqcref',
    freezeTableName: true
  });
  return pcodedata;
};
