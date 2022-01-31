const {
  validateWorkerHeaders,
  getWorkerHeadersWithExtraQuals,
} = require('../../../../../../../routes/establishments/bulkUpload/validate/headers/worker');
const expect = require('chai').expect;

const workerHeadersWithCHGUNIQUEWRKID =
  'LOCALESTID,UNIQUEWORKERID,CHGUNIQUEWRKID,STATUS,DISPLAYID,FLUVAC,NINUMBER,' +
  'POSTCODE,DOB,GENDER,ETHNICITY,NATIONALITY,BRITISHCITIZENSHIP,COUNTRYOFBIRTH,YEAROFENTRY,' +
  'DISABLED,CARECERT,RECSOURCE,STARTDATE,STARTINSECT,APPRENTICE,EMPLSTATUS,ZEROHRCONT,' +
  'DAYSSICK,SALARYINT,SALARY,HOURLYRATE,MAINJOBROLE,MAINJRDESC,CONTHOURS,AVGHOURS,' +
  'OTHERJOBROLE,OTHERJRDESC,NMCREG,NURSESPEC,AMHP,SCQUAL,NONSCQUAL,QUALACH01,QUALACH01NOTES,' +
  'QUALACH02,QUALACH02NOTES,QUALACH03,QUALACH03NOTES';

const workerHeadersWithoutCHGUNIQUEWRKID =
  'LOCALESTID,UNIQUEWORKERID,STATUS,DISPLAYID,FLUVAC,NINUMBER,' +
  'POSTCODE,DOB,GENDER,ETHNICITY,NATIONALITY,BRITISHCITIZENSHIP,COUNTRYOFBIRTH,YEAROFENTRY,' +
  'DISABLED,CARECERT,RECSOURCE,STARTDATE,STARTINSECT,APPRENTICE,EMPLSTATUS,ZEROHRCONT,' +
  'DAYSSICK,SALARYINT,SALARY,HOURLYRATE,MAINJOBROLE,MAINJRDESC,CONTHOURS,AVGHOURS,' +
  'OTHERJOBROLE,OTHERJRDESC,NMCREG,NURSESPEC,AMHP,SCQUAL,NONSCQUAL,QUALACH01,QUALACH01NOTES,' +
  'QUALACH02,QUALACH02NOTES,QUALACH03,QUALACH03NOTES';

describe('server/routes/establishments/bulkUpload/validate/headers/worker', () => {
  describe('validateWorkerHeaders()', () => {
    it('should return true when headings match with CHGUNIQUEWRKID', async () => {
      expect(await validateWorkerHeaders(workerHeadersWithCHGUNIQUEWRKID)).to.deep.equal(true);
    });

    it('should return true when headings match without CHGUNIQUEWRKID', async () => {
      expect(await validateWorkerHeaders(workerHeadersWithoutCHGUNIQUEWRKID)).to.deep.equal(true);
    });

    it('should return false when header (NATIONALITY) missing', async () => {
      const invalidHeaders = workerHeadersWithoutCHGUNIQUEWRKID.replace('NATIONALITY,', '');

      expect(await validateWorkerHeaders(invalidHeaders)).to.deep.equal(false);
    });

    describe('Extra qualifications', () => {
      it('should return true when headings match with headers for one extra QUAL', async () => {
        const headersWithExtraQuals = workerHeadersWithoutCHGUNIQUEWRKID.concat(',QUALACH04,QUALACH04NOTES');

        expect(await validateWorkerHeaders(headersWithExtraQuals)).to.deep.equal(true);
      });

      it('should return true when headings match with headers for two extra QUALs', async () => {
        const headersWithExtraQuals = workerHeadersWithoutCHGUNIQUEWRKID.concat(
          ',QUALACH04,QUALACH04NOTES,QUALACH05,QUALACH05NOTES',
        );

        expect(await validateWorkerHeaders(headersWithExtraQuals)).to.deep.equal(true);
      });

      it('should return false when invalid extra QUALs headers (wrong qual number)', async () => {
        const headersWithExtraQuals = workerHeadersWithoutCHGUNIQUEWRKID.concat(
          ',QUALACH04,QUALACH04NOTES,QUALACH04,QUALACH05NOTES',
        );

        expect(await validateWorkerHeaders(headersWithExtraQuals)).to.deep.equal(false);
      });

      it('should return false when invalid extra QUALs headers (wrong qualNotes number)', async () => {
        const headersWithExtraQuals = workerHeadersWithoutCHGUNIQUEWRKID.concat(
          ',QUALACH04,QUALACH04NOTES,QUALACH05,QUALACH03NOTES',
        );

        expect(await validateWorkerHeaders(headersWithExtraQuals)).to.deep.equal(false);
      });
    });
  });

  describe('getWorkerHeadersWithExtraQuals', () => {
    it('should return standard headers when MAX_QUALS 3', async () => {
      expect(getWorkerHeadersWithExtraQuals(3)).to.deep.equal(workerHeadersWithoutCHGUNIQUEWRKID);
    });

    it('should return standard headers when MAX_QUALS less than 3', async () => {
      expect(getWorkerHeadersWithExtraQuals(1)).to.deep.equal(workerHeadersWithoutCHGUNIQUEWRKID);
    });

    it('should return headers with two extra qualification headers (QUALACH and QUALACHNOTES) when MAX_QUALS 4', async () => {
      const headersWithExtraQuals = workerHeadersWithoutCHGUNIQUEWRKID.concat(',QUALACH04,QUALACH04NOTES');

      expect(getWorkerHeadersWithExtraQuals(4)).to.deep.equal(headersWithExtraQuals);
    });

    it('should return headers with four extra qualification headers (QUALACH and QUALACHNOTES x 2) when MAX_QUALS 5', async () => {
      const headersWithExtraQuals = workerHeadersWithoutCHGUNIQUEWRKID.concat(
        ',QUALACH04,QUALACH04NOTES,QUALACH05,QUALACH05NOTES',
      );

      expect(getWorkerHeadersWithExtraQuals(5)).to.deep.equal(headersWithExtraQuals);
    });
  });
});
