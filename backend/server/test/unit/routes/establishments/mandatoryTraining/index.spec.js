const expect = require('chai').expect;

const httpMocks = require('node-mocks-http');
const sinon = require('sinon');

const {
  createAndUpdateMandatoryTraining,
  deleteMandatoryTrainingById,
  viewMandatoryTraining,
} = require('../../../../../routes/establishments/mandatoryTraining/index.js');

const MandatoryTraining = require('../../../../../models/classes/mandatoryTraining').MandatoryTraining;

describe('mandatoryTraining/index.js', () => {
  afterEach(() => {
    sinon.restore();
  });
  describe('deleteMandatoryTrainingById', () => {
    it('should delete a mandatory training category when it exists for an establishemnt', async () => {
      sinon.stub(MandatoryTraining.prototype, 'deleteMandatoryTrainingById');

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await deleteMandatoryTrainingById(req, res);
      expect(res.statusCode).to.deep.equal(200);
    });
    it('should throw an error if it fails to delete the training', async () => {
      sinon.stub(MandatoryTraining.prototype, 'deleteMandatoryTrainingById').throws();

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await deleteMandatoryTrainingById(req, res);
      expect(res.statusCode).to.deep.equal(500);
    });
  });

  describe('createAndUpdateMandatoryTraining', () => {
    it('should save the record for mandatory training if isvalid , not exists and all job role is selected', async () => {
      sinon.stub(MandatoryTraining.prototype, 'load').callsFake(() => {
        return [
          {
            trainingCategoryId: 1,
            allJobRoles: true,
            jobs: [],
          },
        ];
      });
      sinon.stub(MandatoryTraining.prototype, 'save').callsFake(() => {
        return true;
      });

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await createAndUpdateMandatoryTraining(req, res);
      expect(res.statusCode).to.deep.equal(200);
    });

    it('should save the record for mandatory training if isvalid , not exists and one job role is selected', async () => {
      sinon.stub(MandatoryTraining.prototype, 'load').callsFake(() => {
        return [{ trainingCategoryId: 2, allJobRoles: false, jobs: [{ id: '8' }] }];
      });
      sinon.stub(MandatoryTraining.prototype, 'save').callsFake(() => {
        return true;
      });

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await createAndUpdateMandatoryTraining(req, res);
      expect(res.statusCode).to.deep.equal(200);
    });

    it('should not save the record for mandatory training if the record is not valid', async () => {
      sinon.stub(MandatoryTraining.prototype, 'load').throws();
      var save = sinon.stub(MandatoryTraining.prototype, 'save').callsFake();

      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();

      await createAndUpdateMandatoryTraining(req, res);

      sinon.assert.notCalled(save);
      expect(res.statusCode).to.deep.equal(500);
    });
  });

  describe('viewMandatoryTraining', () => {
    let req;
    let res;

    beforeEach(() => {
      req = httpMocks.createRequest();
      req.establishmentId = 'mockId';
      req.userUid = 'abc123';
      res = httpMocks.createResponse();
    });

    const createMockFetchData = () => {
      return {
        allJobRolesCount: 37,
        lastUpdated: '2025-01-03T11:55:55.734Z',
        mandatoryTraining: [
          {
            category: 'Activity provision, wellbeing',
            establishmentId: 100,
            jobs: [{ id: 22, title: 'Registered manager' }],
            trainingCategoryId: 1,
          },
        ],
        mandatoryTrainingCount: 1,
      };
    };

    it('should fetch all mandatory training for establishment passed in request', async () => {
      const fetchSpy = sinon.stub(MandatoryTraining, 'fetch').callsFake(() => createMockFetchData());

      await viewMandatoryTraining(req, res);
      expect(res.statusCode).to.deep.equal(200);
      expect(fetchSpy).to.have.been.calledWith(req.establishmentId);
    });

    it('should return data from fetch and 200 status if fetch successful', async () => {
      const mockFetchData = createMockFetchData();
      sinon.stub(MandatoryTraining, 'fetch').callsFake(() => mockFetchData);

      await viewMandatoryTraining(req, res);
      expect(res.statusCode).to.equal(200);
      expect(res._getJSONData()).to.deep.equal(mockFetchData);
    });

    it('should return 500 status if error when fetching data', async () => {
      sinon.stub(MandatoryTraining, 'fetch').throws('Unexpected error');

      await viewMandatoryTraining(req, res);
      expect(res.statusCode).to.equal(500);
    });

    describe('Handling duplicate job roles', () => {
      it('should not call load or save for mandatory training when no duplicate job roles in retrieved mandatory training', async () => {
        const loadSpy = sinon.stub(MandatoryTraining.prototype, 'load');
        const saveSpy = sinon.stub(MandatoryTraining.prototype, 'save');

        sinon.stub(MandatoryTraining, 'fetch').callsFake(() => createMockFetchData());

        await viewMandatoryTraining(req, res);
        expect(loadSpy).not.to.have.been.called;
        expect(saveSpy).not.to.have.been.called;
      });

      const previousAllJobsLengths = [29, 31, 32];

      previousAllJobsLengths.forEach((allJobsLength) => {
        it(`should call load and save for mandatory training instance when duplicate job roles in retrieved mandatory training and has length of previous all job roles (${allJobsLength})`, async () => {
          const loadSpy = sinon.stub(MandatoryTraining.prototype, 'load');
          const saveSpy = sinon.stub(MandatoryTraining.prototype, 'save');

          const mockFetchData = createMockFetchData();

          const mockJobRoles = Array.from({ length: allJobsLength - 1 }, (_, index) => ({
            id: index + 1,
            title: `Job role ${index + 1}`,
          }));
          mockJobRoles.push({ id: 1, title: 'Job role 1' });
          mockFetchData.mandatoryTraining[0].jobs = mockJobRoles;

          sinon.stub(MandatoryTraining, 'fetch').callsFake(() => mockFetchData);

          await viewMandatoryTraining(req, res);

          expect(loadSpy).to.have.been.calledWith({
            trainingCategoryId: mockFetchData.mandatoryTraining[0].trainingCategoryId,
            allJobRoles: true,
            jobs: [],
          });
          expect(saveSpy).to.have.been.calledWith(req.userUid);
        });
      });

      it('should not call load or save for mandatory training when number of jobs is previous all job roles length (29) but no duplicate job roles', async () => {
        const loadSpy = sinon.stub(MandatoryTraining.prototype, 'load');
        const saveSpy = sinon.stub(MandatoryTraining.prototype, 'save');

        const mockFetchData = createMockFetchData();

        const mockJobRoles = Array.from({ length: 29 }, (_, index) => ({
          id: index + 1,
          title: `Job role ${index + 1}`,
        }));

        mockFetchData.mandatoryTraining[0].jobs = mockJobRoles;

        sinon.stub(MandatoryTraining, 'fetch').callsFake(() => mockFetchData);

        await viewMandatoryTraining(req, res);

        expect(loadSpy).not.to.have.been.called;
        expect(saveSpy).not.to.have.been.called;
      });
    });
  });
});
