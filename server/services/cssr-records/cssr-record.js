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

  // no match so try nearest authority
  // TODO Allow to fail
  // The UK postcode consists of five to seven alphanumeric characters
  if(postcode.contains(" ")) {
    let [outwardCode, inwardCode] = postcode.substring(0, 7).split(" "); //limit to avoid injection

    while (!cssrRecord && inwardCode.length > 0) {
      inwardCode = inwardCode.slice(0, -1);
      //try matching ignoring last character of postcode
      cssrRecord = await pcodedata.findOne({
        where: {
          postcode: {
            [Op.like]: `${outwardCode} ${inwardCode}%`,
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
  } else {
    console.error("Postcode: ${postcode} does not contain spaces so invalid!");
  }

  if (!cssrRecord) {
    console.error('Could not obtain CSSR record from postcode non local custodian match');
  }

  return cssrRecord;
};

module.exports.GetCssrRecordFromPostcode = GetCssrRecordFromPostcode;
