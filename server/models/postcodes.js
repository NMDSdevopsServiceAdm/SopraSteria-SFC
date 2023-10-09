const getAddressAPI = require('../utils/getAddressAPI');
const pCodeCheck = require('../utils/postcodeSanitizer');

module.exports = function (sequelize, DataTypes) {
  const postcodes = sequelize.define(
    'postcodes',
    {
      postcode: {
        type: DataTypes.STRING,
        allowNull: true,
        field: '"postcode"',
      },
      longitude: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: '"longitude"',
      },
      latitude: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: '"latitude"',
      },
      thoroughfare: {
        type: DataTypes.STRING,
        allowNull: true,
        field: '"thoroughfare"',
      },
      buildingName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: '"building_name"',
      },
      subBuildingName: {
        type: DataTypes.STRING,
        allowNull: true,
        field: '"sub_building_name"',
      },
      subBuildingNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: '"sub_building_number"',
      },
      buildingNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: '"building_number"',
      },
      line1: {
        type: DataTypes.STRING,
        allowNull: true,
        field: '"line_1"',
      },
      line2: {
        type: DataTypes.STRING,
        allowNull: true,
        field: '"line_2"',
      },
      line3: {
        type: DataTypes.STRING,
        allowNull: true,
        field: '"line_3"',
      },
      line4: {
        type: DataTypes.STRING,
        allowNull: true,
        field: '"line_4"',
      },
      locality: {
        type: DataTypes.STRING,
        allowNull: true,
        field: '"locality"',
      },
      townOrCity: {
        type: DataTypes.STRING,
        allowNull: true,
        field: '"town_or_city"',
      },
      county: {
        type: DataTypes.STRING,
        allowNull: true,
        field: '"county"',
      },
      district: {
        type: DataTypes.STRING,
        allowNull: true,
        field: '"district"',
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
        field: '"country"',
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

  // TODD add all response data from getAddressAPI to postcodes table
  // If not full record i.e no country then do the request and store the results
  // If no record do the request and store the results
  postcodes.findByPostcode = async function (postcode) {
    return await this.findOne({
      where: { postcode: postcode },
    });
  };

  postcodes.firstOrCreate = async function (postcode) {
    postcode = pCodeCheck.sanitisePostcode(postcode);
    let foundPostcode = await this.findByPostcode(postcode);

    // If postcode exists and has a Country indicates it already has
    // spoken to getAddressAPI
    if (foundPostcode && foundPostcode.Country != null) {
      return foundPostcode;
    }

    console.log('----------------------------------------------------------------------------------------');
    console.log(`POSTCODES: ${postcode} was not found in postcodes table`);
    console.log('----------------------------------------------------------------------------------------');
    const getAddressAPIResults = await getAddressAPI.getPostcodeData(postcode);

    if (!getAddressAPIResults || getAddressAPIResults.addresses.length === 0) {
      return;
    }

    console.log(`New postcode: ${getAddressAPIResults.postcode} adding to postcodes table`);

    const pcodeData = getAddressAPIResults.addresses[0];

    // TODO pcodeData.addresses is an array of results
    return await this.create({
      postcode: pcodeData.postcode,
      latitude: pcodeData.latitude,
      longitude: pcodeData.longitude,
      thoroughfare: pcodeData.thoroughfare,
      buildingName: pcodeData.building_name,
      subBuildingName: pcodeData.sub_building_name,
      subBuildingNumber: pcodeData.sub_building_number,
      buildingNumber: pcodeData.building_number,
      line1: pcodeData.line_1,
      line2: pcodeData.line_2,
      line3: pcodeData.line_3,
      line4: pcodeData.line_4,
      locality: pcodeData.locality,
      townOrCity: pcodeData.town_or_city,
      county: pcodeData.county,
      district: pcodeData.district,
      country: pcodeData.country,
    });
  };

  return postcodes;
};
