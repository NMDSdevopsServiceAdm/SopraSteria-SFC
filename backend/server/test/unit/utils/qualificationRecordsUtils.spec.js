const expect = require('chai').expect;

const { sortQualificationsByGroup } = require('../../../utils/qualificationRecordsUtils');
const { mockQualificationRecords, expectedQualificationsSortedByGroup } = require('../mockdata/qualifications');

describe('qualificationRecordsUtils', () => {
  describe('sortQualificationsByGroup', () => {
    it('should return object with count set to count passed in', async () => {
      const qualificationsSortedByGroup = sortQualificationsByGroup(mockQualificationRecords);

      expect(qualificationsSortedByGroup.count).to.equal(5);
    });

    it('should group 2 Diploma qualifications into object in groups array', async () => {
      const qualificationsSortedByGroup = sortQualificationsByGroup(mockQualificationRecords);

      expect(qualificationsSortedByGroup.groups[0]).to.deep.equal(expectedQualificationsSortedByGroup.groups[0]);
    });

    it('should have group for Apprenticeship qualifications with one record in groups array', async () => {
      const qualificationsSortedByGroup = sortQualificationsByGroup(mockQualificationRecords);

      expect(qualificationsSortedByGroup.groups[1]).to.deep.equal(expectedQualificationsSortedByGroup.groups[1]);
    });

    it('should have group for Certificate qualifications with one record in groups array', async () => {
      const qualificationsSortedByGroup = sortQualificationsByGroup(mockQualificationRecords);

      expect(qualificationsSortedByGroup.groups[2]).to.deep.equal(expectedQualificationsSortedByGroup.groups[2]);
    });

    it('should have group for award qualifications with one record in groups array', async () => {
      const qualificationsSortedByGroup = sortQualificationsByGroup(mockQualificationRecords);

      expect(qualificationsSortedByGroup.groups[3]).to.deep.equal(expectedQualificationsSortedByGroup.groups[3]);
    });
  });
});
