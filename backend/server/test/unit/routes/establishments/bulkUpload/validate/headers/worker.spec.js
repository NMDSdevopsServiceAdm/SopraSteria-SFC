const {
  validateWorkerHeaders,
  getWorkerHeadersWithExtraQuals,
} = require('../../../../../../../routes/establishments/bulkUpload/validate/headers/worker');
const expect = require('chai').expect;

const workerHeadersWithCHGUNIQUEWRKID =
  'LOCALESTID,UNIQUEWORKERID,CHGUNIQUEWRKID,STATUS,DISPLAYID,NINUMBER,' +
  'POSTCODE,DOB,GENDER,ETHNICITY,NATIONALITY,BRITISHCITIZENSHIP,COUNTRYOFBIRTH,YEAROFENTRY,' +
  'DISABLED,CARECERT,L2CARECERT,RECSOURCE,HANDCVISA,INOUTUK,STARTDATE,STARTINSECT,DHA,APPRENTICE,EMPLSTATUS,ZEROHRCONT,' +
  'DAYSSICK,SALARYINT,SALARY,HOURLYRATE,MAINJOBROLE,MAINJRDESC,CONTHOURS,AVGHOURS,' +
  'NMCREG,NURSESPEC,AMHP,SCQUAL,NONSCQUAL,CWPCATEGORY,QUALACH01,QUALACH01NOTES,' +
  'QUALACH02,QUALACH02NOTES,QUALACH03,QUALACH03NOTES';

const workerHeadersWithTRANSFERSTAFFRECORD = workerHeadersWithCHGUNIQUEWRKID.replace(
  'CHGUNIQUEWRKID',
  'TRANSFERSTAFFRECORD',
);

const workerHeadersWithCHGUNIQUEWRKIDAndTRANSFERSTAFFRECORD = workerHeadersWithCHGUNIQUEWRKID.replace(
  'CHGUNIQUEWRKID',
  'CHGUNIQUEWRKID,TRANSFERSTAFFRECORD',
);

const workerHeadersWithoutCHGUNIQUEWRKID =
  'LOCALESTID,UNIQUEWORKERID,STATUS,DISPLAYID,NINUMBER,' +
  'POSTCODE,DOB,GENDER,ETHNICITY,NATIONALITY,BRITISHCITIZENSHIP,COUNTRYOFBIRTH,YEAROFENTRY,' +
  'DISABLED,CARECERT,L2CARECERT,RECSOURCE,HANDCVISA,INOUTUK,STARTDATE,STARTINSECT,DHA,APPRENTICE,EMPLSTATUS,ZEROHRCONT,' +
  'DAYSSICK,SALARYINT,SALARY,HOURLYRATE,MAINJOBROLE,MAINJRDESC,CONTHOURS,AVGHOURS,' +
  'NMCREG,NURSESPEC,AMHP,SCQUAL,NONSCQUAL,CWPCATEGORY,QUALACH01,QUALACH01NOTES,' +
  'QUALACH02,QUALACH02NOTES,QUALACH03,QUALACH03NOTES';

describe.only('server/routes/establishments/bulkUpload/validate/headers/worker', () => {
  describe('validateWorkerHeaders()', () => {
    it('should return true when headings match with CHGUNIQUEWRKID', async () => {
      expect(validateWorkerHeaders(workerHeadersWithCHGUNIQUEWRKID)).to.deep.equal(true);
    });

    it('should return true when headings match with TRANSFERSTAFFRECORD', async () => {
      expect(validateWorkerHeaders(workerHeadersWithTRANSFERSTAFFRECORD)).to.deep.equal(true);
    });

    it('should return true when headings match without CHGUNIQUEWRKID OR TRANSFERSTAFFRECORD', async () => {
      expect(validateWorkerHeaders(workerHeadersWithoutCHGUNIQUEWRKID)).to.deep.equal(true);
    });

    it('should return true when headings match with CHGUNIQUEWRKID and TRANSFERSTAFFRECORD', async () => {
      expect(validateWorkerHeaders(workerHeadersWithCHGUNIQUEWRKIDAndTRANSFERSTAFFRECORD)).to.equal(true);
    });

    it('should return false when header (NATIONALITY) missing', async () => {
      const invalidHeaders = workerHeadersWithoutCHGUNIQUEWRKID.replace('NATIONALITY,', '');

      expect(validateWorkerHeaders(invalidHeaders)).to.deep.equal(false);
    });

    describe('Extra qualifications', () => {
      const testCases = [
        workerHeadersWithCHGUNIQUEWRKID,
        workerHeadersWithoutCHGUNIQUEWRKID,
        workerHeadersWithTRANSFERSTAFFRECORD,
        workerHeadersWithCHGUNIQUEWRKIDAndTRANSFERSTAFFRECORD,
      ];

      testCases.forEach((workerHeaders) => {
        it('should return true when headings match with headers for one extra QUAL', async () => {
          const headersWithExtraQuals = workerHeaders.concat(',QUALACH04,QUALACH04NOTES');

          expect(validateWorkerHeaders(headersWithExtraQuals)).to.deep.equal(true);
        });

        it('should return true when headings match with headers for two extra QUALs', async () => {
          const headersWithExtraQuals = workerHeaders.concat(',QUALACH04,QUALACH04NOTES,QUALACH05,QUALACH05NOTES');

          expect(validateWorkerHeaders(headersWithExtraQuals)).to.deep.equal(true);
        });

        it('should return false when invalid extra QUALs headers (wrong qual number)', async () => {
          const headersWithExtraQuals = workerHeaders.concat(',QUALACH04,QUALACH04NOTES,QUALACH04,QUALACH05NOTES');

          expect(validateWorkerHeaders(headersWithExtraQuals)).to.deep.equal(false);
        });

        it('should return false when invalid extra QUALs headers (wrong qualNotes number)', async () => {
          const headersWithExtraQuals = workerHeaders.concat(',QUALACH04,QUALACH04NOTES,QUALACH05,QUALACH03NOTES');

          expect(validateWorkerHeaders(headersWithExtraQuals)).to.deep.equal(false);
        });
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
