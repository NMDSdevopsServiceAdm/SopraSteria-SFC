const expect = require('chai').expect;

const { formatQualificationTitle } = require('../../../utils/qualificationsUtils');
const { registrationWithUser, convertedRegistrationResponse } = require('../mockdata/registration');

describe('qualificationsUtils', () => {
  describe('formatQualificationTitle', () => {
    it('should return the title unchanged when no level is provided', () => {
      const title = 'This is a qual';
      const level = null;

      const returnedValue = formatQualificationTitle(title, level);

      expect(returnedValue).to.deep.equal(title);
    });

    describe('level is provided', () => {
      it('should return the title with the level in brackets', () => {
        const title = 'This is a qual';
        const level = '4';

        const returnedValue = formatQualificationTitle(title, level);

        expect(returnedValue).to.deep.equal('This is a qual (level 4)');
      });

      it('should return the title with the level in brackets when the qual already has brackets', () => {
        const title = 'This is a qual (ABC)';
        const level = '6';

        const returnedValue = formatQualificationTitle(title, level);

        expect(returnedValue).to.deep.equal('This is a qual (ABC, level 6)');
      });
    })
  });
});
