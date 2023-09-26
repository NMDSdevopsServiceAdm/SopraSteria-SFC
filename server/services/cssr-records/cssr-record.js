const { Op } = require('sequelize');
const { cssr, pcodedata } = require('../../models');

// Looks up Cssr record based on postcode and
// ignores the last character if not found
const GetCssrRecordFromPostcode = async (postcode) => {
  let cssrRecord = await pcodedata.findOne({
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

  if (!cssrRecord) {
    //try matching ignoring last character of postcode
    // The UK postcode consists of five to seven alphanumeric characters
    cssrRecord = await pcodedata.findOne({
      where: {
        postcode: {
          [Op.like]: postcode.slice(0, -1).substring(0, 7) + '%', // 'SR2 7T%' limit to avoid injection
        },
      },
      include: [
        {
          model: cssr,
          as: 'theAuthority',
          attributes: ['id', 'name', 'nmdsIdLetter'],
          // where: {} // ?TODO
          required: true,
        },
      ],
    });
  }

  if (!cssrRecord) {
    console.error('Could not obtain CSSR record from postcode');
  }

  return cssrRecord;
};

module.exports.GetCssrRecordFromPostcode = GetCssrRecordFromPostcode;
