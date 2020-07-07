const expect = require('chai').expect;
const sinon = require('sinon');
const {inspect} = require('util');
const AWS = require('aws-sdk-mock');
const models = require('../../../models/index');

const lockFile = require('../../../utils/fileLock');
const httpMocks = require('node-mocks-http');

describe('fileLock util', () => {

  const MockS3Json =
    {
      url: '/report',
      startTime: '2020-07-07T12:04:24.747Z',
       endTime: '2020-07-07T12:04:25.225Z',
      responseCode: 200,
      responseHeaders: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-disposition': 'attachment; filename=2020-07-07-SFC-Local-Authority-Report.xlsx'
      },
      responseBody: {
      type: 'Buffer',
        data: [
          80,75,3,4,10,0,0,0,8,0
        ]
      },

 };

  describe('acquireLock()', () => {
    it("returns 200 when everything works fine", async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/reports/localAuthority/establishment/5c03fe27-c69a-4d6c-a740-1f7b5d4b9dbe/user/',
        establishmentId: 2292
      });
      const res = httpMocks.createResponse();
      await lockFile.acquireLock("la",{},false,req,res);
      expect(res.statusCode).to.equal(200);
    });

    it("should close and open the lock", async () => {
      //var closeLock =sinon.stub(models.establishment,"closeLock");
     // var openLock = sinon.stub(models.establishment,"openLock");
      var closeLock = sinon.spy(models.establishment,"closeLock");
      var openLock = sinon.spy(models.establishment,"openLock");

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/reports/localAuthority/establishment/5c03fe27-c69a-4d6c-a740-1f7b5d4b9dbe/user/',
        establishmentId: 2292
      });
      const res = httpMocks.createResponse();
      await lockFile.acquireLock("la",{},false,req,res);
      sinon.assert.calledOnce(closeLock);
      sinon.assert.calledOnce(openLock);
    });
  });

  describe('responseGet()', () => {

    it("returns 200 when everything works fine", async () => {
      sinon.stub(lockFile, 'getS3').callsFake((args) => {
        return  MockS3Json;
      });
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/reports/localAuthority/establishment/5c03fe27-c69a-4d6c-a740-1f7b5d4b9dbe/user/',
        params: {
          buRequestId: "516d82df-4e4c-4e37-a82c-cecd5915d474"
        },
        establishmentId: 2292
      });

      const res = httpMocks.createResponse();
      await lockFile.responseGet(req,res);
      expect(res.statusCode).to.equal(200);
      expect(res._headers).to.deep.equal({
          'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'content-disposition': 'attachment; filename=2020-07-07-SFC-Local-Authority-Report.xlsx'
        }
      );
    });
    it("returns 500 when buRequestId isn't formated correct", async () => {
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/reports/localAuthority/establishment/5c03fe27-c69a-4d6c-a740-1f7b5d4b9dbe/user/',
        params: {
          buRequestId: "516d825d474"
        },
        establishmentId: 2292
      });

      const res = httpMocks.createResponse();
      await lockFile.responseGet(req,res);
      expect(res.statusCode).to.equal(400);
    });
  });
});
