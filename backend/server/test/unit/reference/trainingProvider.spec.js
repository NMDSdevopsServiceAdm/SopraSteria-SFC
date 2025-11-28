const sinon = require('sinon');
const expect = require('chai').expect;

const { build_training_provider_mappings } = require('../../../../reference/trainingProvider');
const models = require('../../../models/index');

describe('build_training_provider_mappings', () => {
  it('should return a list of ASC code and bulk upload code in pairs', async () => {
    sinon.stub(models.trainingProvider, 'findAll').resolves([
      { id: 1, bulkUploadCode: 1 },
      { id: 2, bulkUploadCode: 2 },
      { id: 63, bulkUploadCode: 999 },
    ]);

    const actual = await build_training_provider_mappings();

    expect(actual).to.deep.equal([
      { ASC: 1, BUDI: 1 },
      { ASC: 2, BUDI: 2 },
      { ASC: 63, BUDI: 999 },
    ]);
  });
});
