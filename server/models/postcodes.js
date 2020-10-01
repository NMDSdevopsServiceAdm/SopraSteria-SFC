const getAddressAPI = require('../utils/getAddressAPI');

module.exports = function (sequelize, DataTypes) {
  const postcodes = sequelize.define(
    'postcodes',
    {
      Postcode: {
        type: DataTypes.STRING,
        allowNull: true,
        field: '"postcode"',
      },
      Longitude: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: '"longitude"',
      },
      Latitude: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: '"latitude"',
      },
    },
    {
      tableName: 'postcodes',
      schema: 'cqcref',
      createdAt: false,
      updatedAt: false,
    },
  );

  // There is no PK key on the postcodes table
  postcodes.removeAttribute('id');

  postcodes.findByPostcode = async function (postcode) {
    return await this.findOne({
      where: { Postcode: postcode },
    });
  };

  postcodes.firstOrCreate = async function (postcode) {
    let foundPostcode = await this.findByPostcode(postcode);

    if (foundPostcode) {
      return foundPostcode;
    }

    const pcodeData = await getAddressAPI.getPostcodeData(postcode);

    if (!pcodeData || pcodeData.addresses.length === 0) {
      return;
    }

    return await this.create({
      Postcode: pcodeData.postcode,
      Latitude: pcodeData.latitude,
      Longitude: pcodeData.longitude,
    });
  };

  return postcodes;
};
