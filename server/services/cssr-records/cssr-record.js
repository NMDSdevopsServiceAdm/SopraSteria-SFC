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
  // The UK postcode consists of five to seven alphanumeric characters
  // outwardcode (2-4 chars) and inwardcode (3chars)
  let [outwardCode, inwardCode] = postcode.substring(0, 8).split(" "); //limit to avoid injection

  if(outwardCode.length == 0 || outwardCode.length > 4) {
    console.error("Postcode: ${postcode} is invalid!");
  };

  while (!cssrRecord && inwardCode.length > 0) {
    inwardCode = inwardCode.slice(0, -1);
    console.log("Could not find cssr record for postcode ${outwardCode} ${inwardCode}%")
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
  };

  if (!cssrRecord) {
    console.error('Could not obtain CSSR record from postcode non local custodian match');
  };

  return cssrRecord;
};

module.exports.GetCssrRecordFromPostcode = GetCssrRecordFromPostcode;
