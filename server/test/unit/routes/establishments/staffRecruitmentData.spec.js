const models = require('../../../../models');
const sinon = require('sinon');
const expect = require('chai').expect;
const staffRecruitmentData = require('../../../../routes/establishments/staffRecruitmentData');
const httpMocks = require('node-mocks-http');

describe('staffRecruitmentData route', () => {
  describe('postStaffRecruitmentData', () => {
    let request;
    let postStaffRecruitmentDataStub;

    beforeEach(() => {
      postStaffRecruitmentDataStub = sinon.stub(models.establishment, 'update').returns(null);
      request = {
        method: 'POST',
        url: '/api/establishment/85b2a783-ff2d-4c83-adba-c25378afa19c/staffRecruitmentData',
        establishmentId: 1234,
        body: {
          staffRecruitmentColumn: 'peopleInterviewedInTheLastFourWeeks',
          staffRecruitmentData: 'example data',
        },
      };
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return 200 when a staffRecruitmentData has succesfully updated the appropriate data', async () => {
      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await staffRecruitmentData.postStaffRecruitmentData(req, res);

      expect(res.statusCode).to.deep.equal(200);
    });

    it('should call update on establishment model with passed staffRecruitmentColumn, staffRecruitmentData and establishment id from request', async () => {
      const req = httpMocks.createRequest(request);
      const res = httpMocks.createResponse();

      await staffRecruitmentData.postStaffRecruitmentData(req, res);

      const updateParam = postStaffRecruitmentDataStub.getCall(0).args[0];
      const whereClauseParam = postStaffRecruitmentDataStub.getCall(0).args[1].where;

      expect(updateParam[request.body.staffRecruitmentColumn]).to.deep.equal(request.body.staffRecruitmentData);
      expect(whereClauseParam.id).to.deep.equal(request.establishmentId);
    });
  });

  // describe('getStaffRecruitmentData', () => {
  //   let getStaffRecruitmentDataStub;
  //   let request;
  //   let fakeStaffRecruitmentData;

  //   beforeEach(() => {
  //     fakeStaffRecruitmentData = {
  //       id: '1234',
  //       PeopleInterviewedInTheLastFourWeeks: '5',
  //       MoneySpentOnAdvertisingInTheLastFourWeeks: '3750.00',
  //       DoNewStartersRepeatMandatoryTrainingFromPreviousEmployment: 'Yes, always',
  //       WouldYouAcceptCareCertificatesFromPreviousEmployment: 'No, never',
  //     };

  //     getStaffRecruitmentDataStub = sinon.stub(models.establishment, 'findOne').returns(fakeStaffRecruitmentData);

  //     request = {
  //       method: 'GET',
  //       url: '/api/establishment/85b2a783-ff2d-4c83-adba-c25378afa19c/staffRecruitmentData',
  //       establishmentId: 1234,
  //     };
  //   });

  //   afterEach(() => {
  //     sinon.restore();
  //   });

  //   it.only('should return 200 when getStaffRecruitmentData has fetched the appropriate StaffRecruitmentData', async () => {
  //     const req = httpMocks.createRequest(request);
  //     const res = httpMocks.createResponse();

  //     await staffRecruitmentData.getStaffRecruitmentData(req, res);

  //     expect(res.statusCode).to.deep.equal(200);
  //   });
  // });
});
