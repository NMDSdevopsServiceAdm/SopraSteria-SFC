/* jshint indent: 2 */
const { Op } = require('sequelize');
const getCssrRecordsFromPostcode = require('../services/cssr-records/cssr-record').getCssrRecordsFromPostcode;

module.exports = function (sequelize, DataTypes) {
  const CSSR = sequelize.define(
    'cssr',
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        field: '"CssrID"',
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"CssR"',
      },
      localAuthority: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"LocalAuthority"',
      },
      localCustodianCode: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"LocalCustodianCode"',
      },
      region: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"Region"',
      },
      regionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: '"RegionID"',
      },
      nmdsIdLetter: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: '"NmdsIDLetter"',
      },
    },
    {
      tableName: '"Cssr"',
      schema: 'cqc',
      createdAt: false,
      updatedAt: false,
    },
  );

  // TODO needs caching or no ability to query getAddress as
  // we know it already has a reliable record
  // maybe add establishmentId as PK for postcodes

  //Use the CssrID attached to establishmentId to get cssr record

  /*
    1. First try to get CSSR the 'traditional' way using the relationship or fuzzy
    2. Get district from postcodes table if exists (maybe try fuzzy)
    3. Maybe query getAddressAPI for district

    District = CSSR.LocalAuthority
  */
  CSSR.getCSSRFromEstablishmentId = async (establishmentId) => {
    const postcode = await sequelize.models.establishment.findOne({
      attributes: ['postcode', 'id'],
      where: { id: establishmentId },
    });

    if (!postcode) {
      console.error(`No establishment found for establishmentId ${establishmentId}`);
      return false;
    }

    // Try and match or fuzzy match
    const cssrResults = await getCssrRecordsFromPostcode(postcode.postcode);

    if (cssrResults[0] && cssrResults[0].theAuthority) {
      return cssrResults[0].theAuthority;
    }

    // Now try and retrieve CSSR based on district
    return await CSSR.getIdFromDistrict(postcode.postcode);
  };

  // TODO what if there is no postcodes record either
  // fallback to getAddress??
  CSSR.getIdFromDistrict = async function (postcode) {
    // Check for full records in postcodes table or query getAddressAPI and cache
    const postcodesRecords = sequelize.models.postcodes.firstOrCreate(postcode);

    if (postcodesRecords && postcodesRecords[0].district) {
      const district = postcodesRecords[0].district;

      const cssr = await this.findOne({
        attributes: ['id', 'name'],
        where: {
          LocalAuthority: { [Op.like]: `%${district}%` }, // TODO Use this!!!
        },
      });

      if (cssr && cssr.id) {
        return { id: cssr.id, name: cssr.name };
      }
    }

    return false;
  };

  return CSSR;
};
