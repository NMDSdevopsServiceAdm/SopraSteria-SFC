const cssrRecordData = require('./cssrRecordData');

// Looks up Cssr record based on postcode and
// ignores the last character if not found
const getCssrRecordsFromPostcode = async (postcode) => {
  let cssrRecord = await cssrRecordData.getCssrRecordsCompleteMatch(postcode);

  if (!cssrRecord) {
    console.error('Could not obtain CSSR record from postcode non local custodian match');
    // no match so try nearest authority
    // The UK postcode consists of five to seven alphanumeric characters
    // outwardcode (2-4 chars) and inwardcode (3chars)
    cssrRecord = await getCssrRecordsFuzzyMatch(postcode);
  }

  return cssrRecord;
};

async function getCssrRecordsFuzzyMatch(postcode) {
  let [outwardCode, inwardCode] = postcode.substring(0, 8).split(' '); //limit to avoid injection
  let cssrRecord;

  if (outwardCode.length == 0 || outwardCode.length > 4) {
    console.error(`Postcode: ${postcode} is invalid!`);
  }

  while (!cssrRecord && inwardCode.length > 0) {
    inwardCode = inwardCode.slice(0, -1);
    console.log(`Attempting to match cssr record for postcode like ${outwardCode} ${inwardCode}%`);
    //try matching ignoring last character of postcode
    cssrRecord = await cssrRecordData.getCssrRecordsWithLikePostcode(`${outwardCode} ${inwardCode}`);
  }
  return cssrRecord;
}

module.exports.getCssrRecordsFromPostcode = getCssrRecordsFromPostcode;
