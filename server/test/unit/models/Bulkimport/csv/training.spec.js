const expect = require('chai').expect;
const workers = require('../../../mockdata/workers').data;
const establishmentId = require('../../../mockdata/workers').establishmentId;
const apprenticeshipTypes = require('../../../mockdata/workers').apprenticeshipTypes;
const maxquals = require('../../../mockdata/workers').maxquals;
const knownHeaders = require('../../../mockdata/workers').knownHeaders;
const moment = require('moment');
const filename = 'server/models/BulkImport/csv/workers.js';
const rfr = require('rfr');
const sinon = require('sinon');
const dbmodels = rfr('server/models');
sinon.stub(dbmodels.status, 'ready').value(false);
const BUDI = rfr('server/models/Bulkimport/BUDI').BUDI;
const TrainingCsvValidator = rfr('server/models/BulkImport/csv/training').Training;
const testUtils = require('../../../../../utils/testUtils');
const csv = require('csvtojson');

describe('/server/models/Bulkimport/csv/training.js', () => {
  describe('validations', () => {
    it('should pass validation if no ACCREDITED is provided', async () => {
      const validator = new TrainingCsvValidator({
        LOCALESTID: 'foo',
        UNIQUEWORKERID: 'bar',
        CATEGORY: 1,
        DESCRIPTION: 'training',
        DATECOMPLETED: '',
        EXPIRYDATE: '',
        ACCREDITED: '',
        NOTES: ''
      });

      // Regular validation has to run first for the establishment to populate the internal properties correctly
      await validator.validate();

      // call the method
      await validator.transform();

      // assert a error was returned
      expect(validator._validationErrors).to.deep.equal([]);
      expect(validator._validationErrors.length).to.equal(0);
    });

    it('should pass validation if ACCREDITED is provided', async () => {
      const validator = new TrainingCsvValidator({
        LOCALESTID: 'foo',
        UNIQUEWORKERID: 'bar',
        CATEGORY: 1,
        DESCRIPTION: 'training',
        DATECOMPLETED: '',
        EXPIRYDATE: '',
        ACCREDITED: '1',
        NOTES: ''
      });

      // Regular validation has to run first for the establishment to populate the internal properties correctly
      await validator.validate();

      // call the method
      await validator.transform();

      // assert a error was returned
      expect(validator._validationErrors).to.deep.equal([]);
      expect(validator._validationErrors.length).to.equal(0);
      expect(validator.accredited).to.equal('Yes')
    });

    it('should fail validation if invalid ACCREDITED is provided', async () => {
      const validator = new TrainingCsvValidator({
        LOCALESTID: 'foo',
        UNIQUEWORKERID: 'bar',
        CATEGORY: 1,
        DESCRIPTION: 'training',
        DATECOMPLETED: '',
        EXPIRYDATE: '',
        ACCREDITED: '3',
        NOTES: ''
      }, 1);

      // Regular validation has to run first for the establishment to populate the internal properties correctly
      await validator.validate();

      // call the method
      await validator.transform();

      // assert a error was returned
      expect(validator._validationErrors).to.deep.equal(
        [
          {
            'errCode': 1060,
            'errType': 'ACCREDITED_ERROR',
            'error': 'ACCREDITED is invalid',
            'lineNumber': 1,
            'name': 'foo',
            'source': '3',
            'worker': 'bar'
          }
        ]
      );
      expect(validator._validationErrors.length).to.equal(1);
    });
  });
});
