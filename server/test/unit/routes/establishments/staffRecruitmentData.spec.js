const expect = require('chai').expect;
const httpMocks = require('node-mocks-http');
const sinon = require('sinon');
const models = require('../../../../models');

const {
  postStaffRecruitmentData,
  updateRecruitmentForExistingUser,
} = require('../../../../routes/establishments/staffRecruitmentData');

describe('server/routes/establishments/staffRecruitmentData', () => {
  afterEach(async () => {
    sinon.restore();
  });

  describe('postStaffRecruitmentData', () => {
    let req;
    let res;
    const establishmentId = 'a131313dasd123325453bac';

    const setup = async (body) => {
      const request = {
        method: 'POST',
        url: `/api/establishment/${establishmentId}/staffRecruitmentData`,
        params: { establishmentId },
        body,
      };

      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();
    };

    it('should return 200 when the amountSpent has been updated', async () => {
      const body = { staffRecruitmentData: { amountSpent: 100.4 } };
      await setup(body);

      sinon.stub(models.establishment, 'update').returns(null);

      await postStaffRecruitmentData(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return 200 when the numberOfInterviews has been updated', async () => {
      const body = { staffRecruitmentData: { numberOfInterviews: 100 } };
      await setup(body);

      sinon.stub(models.establishment, 'update').returns(null);

      await postStaffRecruitmentData(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return 500 when the body is an empty object', async () => {
      const body = {};
      await setup(body);

      await postStaffRecruitmentData(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });

    it('should return 500 when the update throws an error', async () => {
      const body = { staffRecruitmentData: { amountSpent: 100.4 } };
      await setup(body);

      sinon.stub(models.establishment, 'update').throws(() => new Error());

      await postStaffRecruitmentData(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });

  describe('updateRecruitmentForExistingUser', () => {
    let req;
    let res;
    const establishmentId = 'a131313dasd123325453bac';

    const setup = async (body) => {
      const request = {
        method: 'POST',
        url: `/api/establishment/${establishmentId}/staffRecruitmentData/updateRecruitmentForExistingUser`,
        establishment: { id: establishmentId },
        body,
      };

      req = httpMocks.createRequest(request);
      res = httpMocks.createResponse();
    };

    it('should return 200 when the recruitmentJourneyExistingUserBanner has been updated', async () => {
      const body = { recruitmentJourneyExistingUserBanner: true };
      await setup(body);
      sinon.stub(models.establishment, 'updatREcuritmentBannerForExistingUser').returns(null);

      await updateRecruitmentForExistingUser(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should return 500 when the update throws an error', async () => {
      const body = { recruitmentJourneyExistingUserBanner: false };
      await setup(body);

      sinon.stub(models.establishment, 'updatREcuritmentBannerForExistingUser').throws(() => new Error());

      await updateRecruitmentForExistingUser(req, res);

      expect(res.statusCode).to.deep.equal(500);
    });
  });
});
