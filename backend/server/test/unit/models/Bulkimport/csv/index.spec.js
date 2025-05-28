const expect = require('chai').expect;
const sinon = require('sinon');
const moment = require('moment');

const dbmodels = require('../../../../../models');

const { BUDI } = require('../../../../../models/BulkImport/BUDI/index');

describe('/server/models/Bulkimport/BUDI/index.js', () => {
  afterEach(() => {
    sinon.restore();
  });

  // describe('Care Workforce Pathway Category', async () => {
  //   const careWorkforcePathwayRoleCategory = [
  //     {
  //       id: 1,
  //       seq: 10,
  //       title: 'New to care',
  //       description: "Is in a care-providing role that's a start point for a career in social care",
  //       analysisFileCode: 1,
  //       bulkUploadCode: 1,
  //     },
  //     {
  //       id: 7,
  //       seq: 70,
  //       title: 'Registered manager',
  //       description: 'Is focussed on regulatory and legal requirements, and runs the service',
  //       analysisFileCode: 7,
  //       bulkUploadCode: 7,
  //     },
  //   ];

  //   it('should return bulk upload code for the care workforce pathway category', async () => {
  //     sinon.stub(dbmodels.careWorkforcePathwayRoleCategory, 'findAll').resolves(careWorkforcePathwayRoleCategory);

  //     await BUDI.initialize();

  //     const roleCategory = 1;
  //     const bulkUploadCode = BUDI.careWorkforcePathwayRoleCategory(BUDI.FROM_ASC, roleCategory);
  //     expect(bulkUploadCode).to.equal(1);
  //   });
  // });
});
