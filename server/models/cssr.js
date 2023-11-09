/* jshint indent: 2 */
const { Op } = require('sequelize');

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

  /*
    1. Use attached CssrId on establishment to get Cssr
    2. Try to get CSSR the 'traditional' way using the relationship or loose
    3. Get district from postcodes table if exists
    4. Query getAddressAPI and cache result
  */
  CSSR.getCSSRsFromEstablishmentId = async (establishmentId) => {
    const establishments = await sequelize.models.establishment.findAll({
      attributes: ['postcode', 'id', 'cssrId'],
      where: { id: establishmentId },
    });

    if (!establishments) {
      console.error(`No establishments found for establishmentId ${establishmentId}`);
      return false;
    }

    const attachedCssrId = establishments.find((establishment) => establishment.CssrId != null);

    // if we already have an attached cssrId
    if (attachedCssrId) {
      return await this.findOne({
        where: {
          CssrId: attachedCssrId,
        },
      });
    }

    // Try and match or loose match
    const cssrResults = await sequelize.models.pcodedata.getLinkedCssrRecordsFromPostcode(establishments[0].postcode);

    if (cssrResults[0] && cssrResults[0].cssrRecord) {
      return cssrResults[0].cssrRecord;
    }

    // Now try and retrieve CSSR based on district
    return await CSSR.getIdFromPostcodeDistrict(establishments[0].postcode);
  };

  CSSR.getCSSRsFromPostcode = async (postcode) => {
    // Try and match or loose match
    const cssrResults = await sequelize.models.pcodedata.getLinkedCssrRecordsFromPostcode(postcode);

    if (cssrResults[0] && cssrResults[0].cssrRecord) {
      return cssrResults[0].cssrRecord;
    }

    // Now try and retrieve CSSR based on district
    return await CSSR.getIdFromPostcodeDistrict(postcode);
  };

  // fallback queries getAddressAPI, caches results
  // then use district to match with cssr.LocalAuthority
  CSSR.getIdFromPostcodeDistrict = async function (postcode) {
    // Check for full records in postcodes table or query getAddressAPI and cache
    const postcodesRecords = sequelize.models.postcodes.firstOrCreate(postcode);

    if (postcodesRecords && postcodesRecords[0].district) {
      const district = postcodesRecords[0].district;

      return await this.findOne({
        where: {
          LocalAuthority: { [Op.iLike]: `%${district}%` },
        },
      });
    }

    return null;
  };

  return CSSR;
};
