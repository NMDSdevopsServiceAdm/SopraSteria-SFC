const getAddressAPI = require('../utils/getAddressAPI');
const pCodeCheck = require('../utils/postcodeSanitizer');

module.exports = function (sequelize, DataTypes) {
  const postcodes = sequelize.define(
    'postcodes',
    {
      uuid: {
        type: DataTypes.UUIDV4,
        allowNull: false,
        field: '"uuid"',
      },
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
  // TODO this is not my comment above. We now have pk uuid.!
  postcodes.removeAttribute('id');

  postcodes.findByPostcode = async function (postcode) {
    return await this.findOne({
      where: { postcode: postcode },
    });
  };

  postcodes.findAllByPostcode = async function (postcode) {
    return await this.findAll({
      where: { postcode: postcode },
    });
  };

  // Retrieve full postcodes records or callgetAddress and cache
  postcodes.firstOrCreate = async function (postcode) {
    postcode = pCodeCheck.sanitisePostcode(postcode);
    let foundPostcodes = await this.findAllByPostcode(postcode);
    let allPostcodeResultsFull = true;

    // Now for each foundPostcode need to check for full record
    // if not full then update record with getAddressAPI
    foundPostcodes.forEach(function (foundPostcode) {
      if (foundPostcode.country == null) {
        allPostcodeResultsFull = false;
      }
    });

    // If postcode exists and has a Country indicates it already has
    // spoken to getAddressAPI
    if (foundPostcodes.length && allPostcodeResultsFull) {
      return foundPostcodes;
    }

    const getAddressAPIResults = await getAddressAPI.getPostcodeData(postcode);

    if (!getAddressAPIResults || getAddressAPIResults.addresses.length === 0) {
      console.error(`Could not get a response from getAddress for postcode ${postcode}`);
      return foundPostcodes;
    }

    // Some records with this postcode are not full so we delete all with this postcode
    // if getAddressAPI returns results
    // TODO should actually map getAddressAPI results to foundPostcodes and then save
    if (foundPostcodes.length) {
      await this.destroy({ where: { postcode: postcode } });
    }

    console.log(`New or updated postcodes data for: ${getAddressAPIResults.postcode}`);

    let results = [];
    getAddressAPIResults.addresses.forEach(function (address) {
      console.log(`Adding ${address.building_name}`);
      results.push({
        postcode: getAddressAPIResults.postcode,
        latitude: getAddressAPIResults.latitude,
        longitude: getAddressAPIResults.longitude,
        thoroughfare: address.thoroughfare,
        buildingName: address.building_name,
        subBuildingName: address.sub_building_name,
        subBuildingNumber: address.sub_building_number,
        buildingNumber: address.building_number,
        line1: address.line_1,
        line2: address.line_2,
        line3: address.line_3,
        line4: address.line_4,
        locality: address.locality,
        townOrCity: address.town_or_city,
        county: address.county,
        district: address.district,
        country: address.country,
      });
    });

    return this.bulkCreate(results); // TODO await?
  };

  return postcodes;
};
