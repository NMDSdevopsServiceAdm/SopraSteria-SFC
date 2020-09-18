const expect = require('chai').expect;
const sinon = require('sinon');
const models = require('../../../models/index');

const lockFile = require('../../../utils/fileLock');
const httpMocks = require('node-mocks-http');

describe('fileLock util', () => {
  afterEach(() => {
    sinon.restore();
  });
  const MockS3Json = {
    url: '/report',
    startTime: '2020-07-07T12:04:24.747Z',
    endTime: '2020-07-07T12:04:25.225Z',
    responseCode: 200,
    responseHeaders: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-disposition': 'attachment; filename=2020-07-07-SFC-Local-Authority-Report.xlsx',
    },
    responseBody: {
      type: 'Buffer',
      data: [80, 75, 3, 4, 10, 0, 0, 0, 8, 0],
    },
  };

  describe('acquireLock()', () => {
    it('returns 200 when everything works fine', async () => {
      // Arrange
      sinon.stub(models.establishment, 'closeLock').callsFake(async (args) => {
        return true;
      });
      sinon.stub(models.establishment, 'openLock').callsFake(async (args) => {
        return true;
      });

      // Act
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/reports/localAuthority/establishment/5c03fe27-c69a-4d6c-a740-1f7b5d4b9dbe/user/',
        establishmentId: 2292,
      });
      const res = httpMocks.createResponse();
      await lockFile.acquireLock('la', {}, false, req, res);

      //Assert
      expect(res.statusCode).to.equal(200);
    });

    it('should close and open the lock on establishment', async () => {
      // Arrange
      var closeLock = sinon.stub(models.establishment, 'closeLock').callsFake(async (args) => {
        return true;
      });
      var openLock = sinon.stub(models.establishment, 'openLock').callsFake(async (args) => {
        return true;
      });

      // Act
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/reports/localAuthority/establishment/5c03fe27-c69a-4d6c-a740-1f7b5d4b9dbe/user/',
        establishmentId: 2292,
      });
      const res = httpMocks.createResponse();
      await lockFile.acquireLock('la', {}, false, req, res);

      // Assert
      sinon.assert.calledOnce(closeLock);
      sinon.assert.calledOnce(openLock);
    });
    it('should close and open the lock on user', async () => {
      // Arrange
      var closeLock = sinon.stub(models.user, 'closeLock').callsFake(async (args) => {
        return true;
      });
      var openLock = sinon.stub(models.user, 'openLock').callsFake(async (args) => {
        return true;
      });

      // Act
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/reports/localAuthority/establishment/5c03fe27-c69a-4d6c-a740-1f7b5d4b9dbe/user/',
        establishmentId: 2292,
      });
      const res = httpMocks.createResponse();
      await lockFile.acquireLock('la', {}, true, req, res);

      // Assert
      sinon.assert.calledOnce(closeLock);
      sinon.assert.calledOnce(openLock);
    });
    it('should not close and open the lock on user when report type wrong', async () => {
      // Arrange
      var closeLock = sinon.stub(models.user, 'closeLock').callsFake(async (args) => {
        return true;
      });
      var openLock = sinon.stub(models.user, 'openLock').callsFake(async (args) => {
        return true;
      });

      // Act
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/reports/localAuthority/establishment/5c03fe27-c69a-4d6c-a740-1f7b5d4b9dbe/user/',
        establishmentId: 2292,
      });
      const res = httpMocks.createResponse();
      await lockFile.acquireLock('fakename', {}, true, req, res);

      // Assert
      sinon.assert.notCalled(closeLock);
      sinon.assert.notCalled(openLock);
      expect(res.statusCode).to.equal(500);
    });
    it('should not close and open the lock on Establishment when report type wrong', async () => {
      // Arrange
      var closeLock = sinon.stub(models.establishment, 'closeLock').callsFake(async (args) => {
        return true;
      });
      var openLock = sinon.stub(models.establishment, 'openLock').callsFake(async (args) => {
        return true;
      });

      // Act
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/reports/localAuthority/establishment/5c03fe27-c69a-4d6c-a740-1f7b5d4b9dbe/user/',
        establishmentId: 2292,
      });
      const res = httpMocks.createResponse();
      await lockFile.acquireLock('fakename', {}, false, req, res);

      // Assert
      sinon.assert.notCalled(closeLock);
      sinon.assert.notCalled(openLock);
      expect(res.statusCode).to.equal(500);
    });
  });

  describe('responseGet()', () => {
    it('returns 200 when everything works fine', async () => {
      // Arrange
      sinon.stub(lockFile, 'getS3').callsFake((args) => {
        return MockS3Json;
      });

      // Act
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/reports/localAuthority/establishment/5c03fe27-c69a-4d6c-a740-1f7b5d4b9dbe/user/',
        params: {
          buRequestId: '516d82df-4e4c-4e37-a82c-cecd5915d474',
        },
        establishmentId: 2292,
      });

      const res = httpMocks.createResponse();
      await lockFile.responseGet(req, res);

      // Assert
      expect(res.statusCode).to.equal(200);
      expect(res._headers).to.deep.equal({
        'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'content-disposition': 'attachment; filename=2020-07-07-SFC-Local-Authority-Report.xlsx',
      });
    });
    it("returns 500 when buRequestId isn't formatted correct", async () => {
      // Act
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/reports/localAuthority/establishment/5c03fe27-c69a-4d6c-a740-1f7b5d4b9dbe/user/',
        params: {
          buRequestId: '516d825d474',
        },
        establishmentId: 2292,
      });

      const res = httpMocks.createResponse();
      await lockFile.responseGet(req, res);

      //Assert
      expect(res.statusCode).to.equal(400);
    });
    it("returns 500 when buRequestId isn't formatted correct", async () => {
      // Act
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/reports/localAuthority/establishment/5c03fe27-c69a-4d6c-a740-1f7b5d4b9dbe/user/',
        params: {
          buRequestId: '516d825d474',
        },
        establishmentId: 2292,
      });

      const res = httpMocks.createResponse();
      await lockFile.responseGet(req, res);

      // Assert
      expect(res.statusCode).to.equal(400);
    });
  });
  describe('releaseLock()', () => {
    it('returns 500 when reportType not in accepted list', async () => {
      // Arrange
      var openLock = sinon.stub(models.establishment, 'openLock').callsFake(async (args) => {
        return true;
      });

      // Act
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/reports/localAuthority/establishment/5c03fe27-c69a-4d6c-a740-1f7b5d4b9dbe/user/',
        params: {
          buRequestId: '516d825d474',
        },
        establishmentId: 2292,
      });

      const res = httpMocks.createResponse();
      await lockFile.releaseLock('fakename', false, req, res);

      //Assert
      sinon.assert.notCalled(openLock);
      expect(res.statusCode).to.equal(500);
    });
    it('returns 500 when reportType not in accepted list even without res', async () => {
      // Arrange
      var openLock = sinon.stub(models.establishment, 'openLock').callsFake(async (args) => {
        return true;
      });

      // Act
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/reports/localAuthority/establishment/5c03fe27-c69a-4d6c-a740-1f7b5d4b9dbe/user/',
        params: {
          buRequestId: '516d825d474',
        },
        establishmentId: 2292,
      });

      const res = null;
      await lockFile.releaseLock('fakename', false, req, res);

      // Assert
      sinon.assert.notCalled(openLock);
    });
    it('should work with LA report even without res', async () => {
      // Arrange
      var openLock = sinon.stub(models.establishment, 'openLock').callsFake(async (args) => {
        return true;
      });

      // Act
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/reports/localAuthority/establishment/5c03fe27-c69a-4d6c-a740-1f7b5d4b9dbe/user/',
        params: {
          buRequestId: '516d825d474',
        },
        establishmentId: 2292,
      });

      const res = null;
      await lockFile.releaseLock('la', false, req, res);

      // Assert
      sinon.assert.calledOnce(openLock);
    });
    it('should work with LA admin report even without res', async () => {
      // Arrange
      var openLock = sinon.stub(models.user, 'openLock').callsFake(async (args) => {
        return true;
      });

      // ACt
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/reports/localAuthority/establishment/5c03fe27-c69a-4d6c-a740-1f7b5d4b9dbe/user/',
        params: {
          buRequestId: '516d825d474',
        },
        establishmentId: 2292,
      });

      const res = null;
      await lockFile.releaseLock('la', true, req, res);

      //Assert
      sinon.assert.calledOnce(openLock);
    });
    it('should work with LA report with res', async () => {
      // Arrange
      var openLock = sinon.stub(models.establishment, 'openLock').callsFake(async (args) => {
        return true;
      });

      // Act
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/reports/localAuthority/establishment/5c03fe27-c69a-4d6c-a740-1f7b5d4b9dbe/user/',
        params: {
          buRequestId: '516d825d474',
        },
        establishmentId: 2292,
      });

      const res = httpMocks.createResponse();
      await lockFile.releaseLock('la', false, req, res);
      sinon.assert.calledOnce(openLock);

      // Assert
      expect(res.statusCode).to.equal(200);
    });
    it('should work with LA admin report with res', async () => {
      // Arrange
      var openLock = sinon.stub(models.user, 'openLock').callsFake(async (args) => {
        return true;
      });

      // Act
      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/reports/localAuthority/establishment/5c03fe27-c69a-4d6c-a740-1f7b5d4b9dbe/user/',
        params: {
          buRequestId: '516d825d474',
        },
        establishmentId: 2292,
      });

      const res = httpMocks.createResponse();
      await lockFile.releaseLock('la', true, req, res);

      // Assert
      sinon.assert.calledOnce(openLock);
      expect(res.statusCode).to.equal(200);
    });
  });
});
