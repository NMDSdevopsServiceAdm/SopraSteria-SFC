// const { pcodedata } = require('../../models');
const models = require('../../models');

// Looks up Cssr record based on postcode and
// ignores the last character if not found
const getCssrRecordsFromPostcode = async (postcode) => {
  const cssrRecords = await models.pcodedata.getLinkedCssrRecordsCompleteMatch(postcode);

  if (!cssrRecords) {
    console.error('Could not obtain CSSR records from postcode non local custodian match');
    // no match so try nearest authority
    // The UK postcode consists of five to seven alphanumeric characters
    // outwardcode (2-4 chars) and inwardcode (3chars)
    return await getCssrRecordsFuzzyMatch(postcode);
  }
};

async function getCssrRecordsFuzzyMatch(postcode) {
  let [outwardCode, inwardCode] = postcode.substring(0, 8).split(' '); //limit to avoid injection
  let cssrRecords;

  if (outwardCode.length == 0 || outwardCode.length > 4) {
    console.error(`Postcode: ${postcode} is invalid!`);
  }

  while (!cssrRecords && inwardCode.length > 0) {
    inwardCode = inwardCode.slice(0, -1);
    console.log(`Attempting to match cssr record for postcode like ${outwardCode} ${inwardCode}%`);
    //try fuzzy matching
    cssrRecords = await models.pcodedata.getLinkedCssrRecordsWithLikePostcode(`${outwardCode} ${inwardCode}`);
  }
  return cssrRecords;
}

module.exports.getCssrRecordsFromPostcode = getCssrRecordsFromPostcode;
