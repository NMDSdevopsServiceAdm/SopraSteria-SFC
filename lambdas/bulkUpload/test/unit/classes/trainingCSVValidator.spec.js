const expect = require('chai').expect;
const sinon = require('sinon');

const dbmodels = require('../../../../../server/models');
sinon.stub(dbmodels.status, 'ready').value(false);
const TrainingCsvValidator = require('../../../classes/trainingCSVValidator').TrainingCsvValidator;
const mappings = require('../../../../../reference/BUDIMappings').mappings;

describe('trainingCSVValidator', () => {
  describe('validate()', () => {
    describe('accredited', () => {
      let trainingCsv;

      beforeEach(() => {
        trainingCsv = {
          LOCALESTID: 'foo',
          UNIQUEWORKERID: 'bar',
          CATEGORY: 1,
          DESCRIPTION: 'training',
          DATECOMPLETED: '',
          EXPIRYDATE: '',
          ACCREDITED: '',
          NOTES: '',
        };
      });

      it('should pass validation if no ACCREDITED is provided', async () => {
        const validator = new TrainingCsvValidator(trainingCsv, 2, mappings);

        await validator.validate();

        expect(validator._validationErrors).to.deep.equal([]);
      });

      it('should pass validation and set accredited to Yes if ACCREDITED is 1', async () => {
        trainingCsv.ACCREDITED = '1';

        const validator = new TrainingCsvValidator(trainingCsv, 2, mappings);

        await validator.validate();

        expect(validator._validationErrors).to.deep.equal([]);
        expect(validator.accredited).to.equal('Yes');
      });

      it('should pass validation and set accredited to No if ACCREDITED is 0', async () => {
        trainingCsv.ACCREDITED = '0';

        const validator = new TrainingCsvValidator(trainingCsv, 2, mappings);

        await validator.validate();

        expect(validator._validationErrors).to.deep.equal([]);
        expect(validator.accredited).to.equal('No');
      });

      it("should pass validation and set ACCREDITED to Don't know if ACCREDITED is 999", async () => {
        trainingCsv.ACCREDITED = '999';

        const validator = new TrainingCsvValidator(trainingCsv, 2, mappings);

        await validator.validate();

        expect(validator._validationErrors).to.deep.equal([]);
        expect(validator.accredited).to.equal("Don't know");
      });

      it('should add ACCREDITED_ERROR to validationErrors if invalid ACCREDITED is provided', async () => {
        trainingCsv.ACCREDITED = '3';

        const validator = new TrainingCsvValidator(trainingCsv, 1, mappings);

        await validator.validate();

        expect(validator._validationErrors).to.deep.equal([
          {
            errCode: 1060,
            errType: 'ACCREDITED_ERROR',
            error: 'ACCREDITED is invalid',
            lineNumber: 1,
            name: 'foo',
            source: '3',
            column: 'ACCREDITED',
            worker: 'bar',
          },
        ]);
      });
    });
  });
});
