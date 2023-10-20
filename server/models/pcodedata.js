/* jshint indent: 2 */

const { Op } = require('sequelize');

module.exports = function (sequelize, DataTypes) {
  const pcodedata = sequelize.define(
    'pcodedata',
    {
      uprn: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: true,
      },
      sub_building_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      building_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      building_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      street_description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      post_town: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      postcode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      local_custodian_code: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      county: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rm_organisation_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'pcodedata',
      schema: 'cqcref',
      createdAt: false,
      updatedAt: false,
    },
  );

  pcodedata.associate = (models) => {
    pcodedata.belongsTo(models.cssr, {
      foreignKey: 'local_custodian_code',
      targetKey: 'localCustodianCode',
      as: 'theAuthority',
    });
  };

  pcodedata.getLinkedCssrRecordsFromPostcode = async function (postcode) {
    const cssrRecords = await this.getLinkedCssrRecordsCompleteMatch(postcode);

    if (!cssrRecords) {
      console.error('Could not obtain CSSR records from postcode non local custodian match');
      // no match so try nearest authority
      // The UK postcode consists of five to seven alphanumeric characters
      // outwardcode (2-4 chars) and inwardcode (3chars)
      return await this.getCssrRecordsFuzzyMatch(postcode);
    }

    return cssrRecords;
  };

  pcodedata.getCssrRecordsFuzzyMatch = async function (postcode) {
    let [outwardCode, inwardCode] = postcode.substring(0, 8).split(' '); //limit to avoid injection
    let cssrRecords;

    if (outwardCode.length == 0 || outwardCode.length > 4) {
      console.error(`Postcode: ${postcode} is invalid!`);
    }

    while (!cssrRecords && inwardCode.length > 0) {
      inwardCode = inwardCode.slice(0, -1);
      console.log(`Attempting to match cssr record for postcode like ${outwardCode} ${inwardCode}%`);
      //try fuzzy matching
      cssrRecords = await this.getLinkedCssrRecordsWithLikePostcode(`${outwardCode} ${inwardCode}`);
    }
    return cssrRecords;
  };

  pcodedata.getLinkedCssrRecordsCompleteMatch = async function (postcode) {
    return await this.findAll({
      where: {
        postcode: postcode,
      },
      include: [
        {
          model: sequelize.models.cssr,
          as: 'theAuthority',
          attributes: ['id', 'name', 'nmdsIdLetter'],
        },
      ],
    });
  };

  pcodedata.getLinkedCssrRecordsWithLikePostcode = async function (postcode) {
    return await this.findAll({
      where: {
        postcode: {
          [Op.like]: `${postcode}%`,
        },
      },
      include: [
        {
          model: sequelize.models.cssr,
          as: 'theAuthority',
          attributes: ['id', 'name', 'nmdsIdLetter'],
          required: true,
        },
      ],
    });
  };

  return pcodedata;
};
