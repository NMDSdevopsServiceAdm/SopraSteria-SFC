const { Op } = require('sequelize');
const { cssr, pcodedata } = require('../../models');

async function getCssrRecordsWithLikePostcode(postcode) {
  return pcodedata.findAll({
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
        model: cssr,
        as: 'theAuthority',
        attributes: ['id', 'name', 'nmdsIdLetter'],
        required: true,
      },
    ],
  });
}

async function getCssrRecordsCompleteMatch(postcode) {
  return pcodedata.findAll({
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
        model: cssr,
        as: 'theAuthority',
        attributes: ['id', 'name', 'nmdsIdLetter'],
      },
    ],
  });
}

module.exports.getCssrRecordsWithLikePostcode = getCssrRecordsWithLikePostcode;
module.exports.getCssrRecordsCompleteMatch = getCssrRecordsCompleteMatch;
