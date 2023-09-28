const { Op } = require('sequelize');
const { cssr, pcodedata } = require('../../models');

async function getCssrRecordWithLikePostcode(postcode) {
  return pcodedata.findOne({
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
    logging: true,
  });
}

async function getCssrRecordCompleteMatch(postcode) {
  return pcodedata.findOne({
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

module.exports.getCssrRecordWithLikePostcode = getCssrRecordWithLikePostcode;
module.exports.getCssrRecordCompleteMatch = getCssrRecordCompleteMatch;
