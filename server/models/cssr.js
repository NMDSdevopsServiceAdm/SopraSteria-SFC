/* jshint indent: 2 */
const getAddressAPI = require('../utils/getAddressAPI');

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

  CSSR.getIdFromDistrict = async function (postcode) {
    const postcodeData = await getAddressAPI.getPostcodeData(postcode);
    if (!postcodeData || !postcodeData.addresses) {
      return false;
    }
    
    const district = postcodeData.addresses[0].district;
    const cssr = await this.findOne({
      attributes: ['id'],
      where: {
        LocalAuthority: district,
      },
    });

    if (cssr && cssr.id) {
      return cssr.id;
    } else {
      return false;
    }
  };

  return CSSR;
};
