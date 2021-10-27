const Qualification = require('../../../models/classes/qualification').Qualification;
const { sortQualificationsByGroup } = require('../../../utils/qualificationRecordsUtils');

const getAllQualifications = async (establishmentId, workerUid) => {
  const allQualificationRecords = await Qualification.fetch(establishmentId, workerUid);


  if (allQualificationRecords) {
    return sortQualificationsByGroup(allQualificationRecords);
  }
  return { count: 0, groups: [], lastUpdated: null };
}

module.exports.getAllQualifications = getAllQualifications;
