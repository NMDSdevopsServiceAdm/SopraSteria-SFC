const expect = require('chai').expect;
const {
  getMetadata,
  isNotMetadata,
  generateJSONFromCSV,
} = require('../../../../../../routes/establishments/bulkUpload/validate/validatePut');

describe('validatePut', () => {
  describe('getMetadata', () => {
    const file = { filename: 'file1', username: 'testuser' };

    it('should return metadata object with filename and userName set to data passed in', async () => {
      const returnedMetadata = getMetadata(file, 'Establishment');

      expect(returnedMetadata.filename).to.equal(file.filename);
      expect(returnedMetadata.userName).to.equal(file.username);
    });

    it('should return metadata object with fileType set to type passed in', async () => {
      const returnedMetadata = getMetadata(file, 'Establishment');

      expect(returnedMetadata.fileType).to.equal('Establishment');
    });

    it('should return metadata object with other fields set to null', async () => {
      const returnedMetadata = getMetadata(file, 'Establishment');

      expect(returnedMetadata.id).to.equal(null);
      expect(returnedMetadata.warnings).to.equal(null);
      expect(returnedMetadata.errors).to.equal(null);
      expect(returnedMetadata.records).to.equal(null);
      expect(returnedMetadata.deleted).to.equal(null);
    });
  });

  describe('isNotMetadata', () => {
    it('should return true when file key does not include metadata.json', async () => {
      const notMetadata = isNotMetadata('2354/latest/test-workplace.csv');

      expect(notMetadata).to.be.true;
    });

    it('should return false when file key does include metadata.json', async () => {
      const notMetadata = isNotMetadata('2354/latest/test-workplace.csv.metadata.json');

      expect(notMetadata).to.be.false;
    });
  });

  describe('generateJSONFromCSV', () => {
    const mockWorkerFile = `LOCALESTID,UNIQUEWORKERID,STATUS,DISPLAYID,NINUMBER,POSTCODE,DOB,GENDER,ETHNICITY,NATIONALITY,BRITISHCITIZENSHIP,COUNTRYOFBIRTH,YEAROFENTRY,DISABLED,CARECERT,RECSOURCE,STARTDATE,STARTINSECT,APPRENTICE,EMPLSTATUS,ZEROHRCONT,DAYSSICK,SALARYINT,SALARY,HOURLYRATE,MAINJOBROLE,MAINJRDESC,CONTHOURS,AVGHOURS,OTHERJOBROLE,OTHERJRDESC,NMCREG,NURSESPEC,AMHP,SCQUAL,NONSCQUAL,QUALACH01,QUALACH01NOTES,QUALACH02,QUALACH02NOTES,QUALACH03,QUALACH03NOTES
bu,a,UPDATE,12345 WDF,BB323123C,ABC123,01/01/1980,1,31,826,,826,,0,2,16,01/01/2020,2010,2,1,2,999,1,30000.00,,25,,999,,,,,,,2,2,,,,,,`;

    it('should convert CSV to JSON object', async () => {
      const workersAsJson = await generateJSONFromCSV(mockWorkerFile);

      expect(typeof workersAsJson).to.deep.equal('object'); // It's not actually an object, it's an array :)
      expect(workersAsJson.length).to.deep.equal(1);
    });

    it('should convert CSV to JSON object with the correct parameters', async () => {
      const workersAsJson = await generateJSONFromCSV(mockWorkerFile);

      expect(workersAsJson[0].LOCALESTID).to.deep.equal('bu');
      expect(workersAsJson[0].UNIQUEWORKERID).to.deep.equal('a');
      expect(workersAsJson[0].STATUS).to.deep.equal('UPDATE');
      expect(workersAsJson[0].DISPLAYID).to.deep.equal('12345 WDF');
      expect(workersAsJson[0].NINUMBER).to.deep.equal('BB323123C');
      expect(workersAsJson[0].POSTCODE).to.deep.equal('ABC123');
      expect(workersAsJson[0].DOB).to.deep.equal('01/01/1980');
      expect(workersAsJson[0].GENDER).to.deep.equal('1');
      expect(workersAsJson[0].ETHNICITY).to.deep.equal('31');
      expect(workersAsJson[0].NATIONALITY).to.deep.equal('826');
      expect(workersAsJson[0].BRITISHCITIZENSHIP).to.deep.equal('');
      expect(workersAsJson[0].COUNTRYOFBIRTH).to.deep.equal('826');
      expect(workersAsJson[0].YEAROFENTRY).to.deep.equal('');
      expect(workersAsJson[0].DISABLED).to.deep.equal('0');
      expect(workersAsJson[0].CARECERT).to.deep.equal('2');
      expect(workersAsJson[0].RECSOURCE).to.deep.equal('16');
      expect(workersAsJson[0].STARTDATE).to.deep.equal('01/01/2020');
      expect(workersAsJson[0].STARTINSECT).to.deep.equal('2010');
      expect(workersAsJson[0].APPRENTICE).to.deep.equal('2');
      expect(workersAsJson[0].EMPLSTATUS).to.deep.equal('1');
      expect(workersAsJson[0].ZEROHRCONT).to.deep.equal('2');
      expect(workersAsJson[0].DAYSSICK).to.deep.equal('999');
      expect(workersAsJson[0].SALARYINT).to.deep.equal('1');
      expect(workersAsJson[0].SALARY).to.deep.equal('30000.00');
      expect(workersAsJson[0].HOURLYRATE).to.deep.equal('');
      expect(workersAsJson[0].MAINJOBROLE).to.deep.equal('25');
      expect(workersAsJson[0].MAINJRDESC).to.deep.equal('');
      expect(workersAsJson[0].CONTHOURS).to.deep.equal('999');
      expect(workersAsJson[0].AVGHOURS).to.deep.equal('');
      expect(workersAsJson[0].OTHERJOBROLE).to.deep.equal('');
      expect(workersAsJson[0].OTHERJRDESC).to.deep.equal('');
      expect(workersAsJson[0].NMCREG).to.deep.equal('');
      expect(workersAsJson[0].NURSESPEC).to.deep.equal('');
      expect(workersAsJson[0].AMHP).to.deep.equal('');
      expect(workersAsJson[0].SCQUAL).to.deep.equal('2');
      expect(workersAsJson[0].NONSCQUAL).to.deep.equal('2');
      expect(workersAsJson[0].QUALACH01).to.deep.equal('');
      expect(workersAsJson[0].QUALACH01NOTES).to.deep.equal('');
      expect(workersAsJson[0].QUALACH02).to.deep.equal('');
      expect(workersAsJson[0].QUALACH02NOTES).to.deep.equal('');
      expect(workersAsJson[0].QUALACH03).to.deep.equal('');
      expect(workersAsJson[0].QUALACH03NOTES).to.deep.equal('');
    });
  });
});
