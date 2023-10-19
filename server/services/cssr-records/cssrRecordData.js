const { Op } = require('sequelize');
// const { cssr, PcodeData } = require('../../models');
const models = require('../../models/index');

async function getCssrRecordsWithLikePostcode(postcode) {
  return await models.pcodedata.findAll({
    attributes: [
      'uprn',
      'building_number',
      'street_description',
      'sub_building_name',
      'building_name',
      'rm_organisation_name',
      'post_town',
      'county',
      'postcode',
    ],
    where: {
      postcode: {
        [Op.like]: `${postcode}%`,
      },
    },
    include: [
      {
        model: models.cssr,
        as: 'theAuthority',
        attributes: ['id', 'name', 'nmdsIdLetter'],
        required: true,
      },
    ],
  });
}

async function getCssrRecordsCompleteMatch(postcode) {
  return await models.pcodedata.findAll({
    attributes: [
      'uprn',
      'building_number',
      'street_description',
      'sub_building_name',
      'building_name',
      'rm_organisation_name',
      'post_town',
      'county',
      'postcode',
    ],
    where: {
      postcode: postcode,
    },
    include: [
      {
        model: models.cssr,
        as: 'theAuthority',
        attributes: ['id', 'name', 'nmdsIdLetter'],
      },
    ],
  });
}

module.exports.getCssrRecordsWithLikePostcode = getCssrRecordsWithLikePostcode;
module.exports.getCssrRecordsCompleteMatch = getCssrRecordsCompleteMatch;
