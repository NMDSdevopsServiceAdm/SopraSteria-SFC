// const expect = require('chai').expect;
// const sinon = require('sinon');
// const httpMocks = require('node-mocks-http');

// const Training = require('../../../../../models/classes/training').Training;
// const { mockTrainingRecords } = require('../../../mockdata/training');
// const {
//   getAllTrainingByStatus,
// } = require('../../../../../routes/establishments/trainingSummary/getAllWorkersTrainingByStatus');

// describe('server/routes/establishments/trainingAndQualifications/getAllTrainingAndQualifications.js', () => {
//   afterEach(() => {
//     sinon.restore();
//   });

//   describe('getAllTrainingAndQualifications', () => {
//     let req;
//     let res;

//     beforeEach(() => {
//       const request = {
//         method: 'GET',
//         url: '/api/establishment/mocked-uid/trainingAndQualifications/expired',
//         params: { status: 'expired' },
//         establishmentId: 'mocked-uid',
//       };

//       req = httpMocks.createRequest(request);
//       res = httpMocks.createResponse();
//     });

//     it('should return a status of 200 when retrieving expired training', async () => {
//       sinon.stub(Training, 'getAllEstablishmentTrainingByStatus').returns(mockTrainingRecords);

//       await getAllTrainingByStatus(req, res);

//       expect(res.statusCode).to.deep.equal(200);
//       expect(res._getJSONData()).to.deep.equal({ training: mockTrainingRecords });
//     });

//     it('should return a status of 200 when retrieving expiring training', async () => {
//       req.params.status = 'expiring';
//       sinon.stub(Training, 'getAllEstablishmentTrainingByStatus').returns(mockTrainingRecords);

//       await getAllTrainingByStatus(req, res);

//       expect(res.statusCode).to.deep.equal(200);
//       expect(res._getJSONData()).to.deep.equal({ training: mockTrainingRecords });
//     });

//     it('should return a status of 400 and error message if there is no establishment id', async () => {
//       req.establishmentId = null;

//       await getAllTrainingByStatus(req, res);

//       expect(res.statusCode).to.deep.equal(400);
//       expect(res._getData()).to.deep.equal('The establishment id and status must be given');
//     });

//     it('should return a status of 400 and error message if there is no status', async () => {
//       req.params = { status: null };

//       await getAllTrainingByStatus(req, res);

//       expect(res.statusCode).to.deep.equal(400);
//       expect(res._getData()).to.deep.equal('The establishment id and status must be given');
//     });

//     it('should return a status of 500 when an error is thrown', async () => {
//       sinon.stub(Training, 'getAllEstablishmentTrainingByStatus').throws(new Error());

//       await getAllTrainingByStatus(req, res);

//       expect(res.statusCode).to.deep.equal(500);
//       expect(res._getData()).to.deep.equal(
//         'Failed to get expired training and qualifications for establishment mocked-uid',
//       );
//     });
//   });
// });
