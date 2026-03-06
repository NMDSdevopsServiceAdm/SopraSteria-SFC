const expect = require('chai').expect;
const sinon = require('sinon');
const httpMocks = require('node-mocks-http');
const { UserResearchInviteResponsesDataService } = require('../../../../../routes/reports/userResearchInviteResponsesReport/data');
const { generateUserResearchInviteResponsesReport }= require('../../../../../routes/reports/userResearchInviteResponsesReport/report.js');
const { printRow }= require('../../../../../routes/reports/userResearchInviteResponsesReport/report.js');

describe('UserResearchInviteResponsesDataService', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('generateUserResearchInviteResponsesReport', () => {
    it('should return status 200 and an excel format', async () => {
      const reportData = [
        {
          dataValues: {
            FullNameValue: 'Test User',
            EmailValue: 'me@example.com',
            JobTitleValue: 'job',
            UserResearchInviteResponseValue: 'Yes',
            created: '2026-02-19T15:53:53.895Z',
            updated: '2026-02-19T15:53:53.895Z',
            establishment: {
              establishment: {
                dataValues: {
                  nmdsId: 'G1005301',
                  NumberOfStaffValue: 10,
                  mainService: {
                    dataValues: {
                      name: 'Carers support'
                    }
                  },
                },
              },
            },
          },
        },
      ];

      sinon.stub(UserResearchInviteResponsesDataService, 'getReportData').callsFake(async () => {
        return reportData;
      });

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/report/userResearchInviteResponsesReport',
      });
      const res = httpMocks.createResponse();

      await generateUserResearchInviteResponsesReport(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._headers['content-type']).to.equal(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      expect(UserResearchInviteResponsesDataService.getReportData.calledOnce).to.equal(true);
    });

    it('should return status 200 and an excel format when user data is empty', async () => {
      const reportData = [{}];

      sinon.stub(UserResearchInviteResponsesDataService, 'getReportData').callsFake(async () => {
        return reportData;
      });

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/report/userResearchInviteResponsesReport',
      });
      const res = httpMocks.createResponse();

      await generateUserResearchInviteResponsesReport(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._headers['content-type']).to.equal(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });

    it('should return status 200 and an excel format when user data is missing', async () => {
      const reportData = [];

      sinon.stub(UserResearchInviteResponsesDataService, 'getReportData').callsFake(async () => {
        return reportData;
      });

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/report/userResearchInviteResponsesReport',
      });
      const res = httpMocks.createResponse();

      await generateUserResearchInviteResponsesReport(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._headers['content-type']).to.equal(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });

    it('should return status 200 and an excel format when establishment data is empty', async () => {
      const reportData = [
        {
          dataValues: {
            FullNameValue: 'Test User',
            EmailValue: 'me@example.com',
            JobTitleValue: 'job',
            UserResearchInviteResponseValue: 'Yes',
            created: '2026-02-19T15:53:53.895Z',
            updated: '2026-02-19T15:53:53.895Z',
            establishment: {},
          },
        },
      ];

      sinon.stub(UserResearchInviteResponsesDataService, 'getReportData').callsFake(async () => {
        return reportData;
      });

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/report/userResearchInviteResponsesReport',
      });
      const res = httpMocks.createResponse();

      await generateUserResearchInviteResponsesReport(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._headers['content-type']).to.equal(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });

    it('should return status 200 and an excel format when establishment data is missing', async () => {
      const reportData = [
        {
          dataValues: {
            FullNameValue: 'Test User',
            EmailValue: 'me@example.com',
            JobTitleValue: 'job',
            UserResearchInviteResponseValue: 'Yes',
            created: '2026-02-19T15:53:53.895Z',
            updated: '2026-02-19T15:53:53.895Z',
          },
        },
      ];

      sinon.stub(UserResearchInviteResponsesDataService, 'getReportData').callsFake(async () => {
        return reportData;
      });

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/report/userResearchInviteResponsesReport',
      });
      const res = httpMocks.createResponse();

      await generateUserResearchInviteResponsesReport(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._headers['content-type']).to.equal(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });

    it('should return status 200 and an excel format when services data is empty', async () => {
      const reportData = [
        {
          dataValues: {
            FullNameValue: 'Test User',
            EmailValue: 'me@example.com',
            JobTitleValue: 'job',
            UserResearchInviteResponseValue: 'Yes',
            created: '2026-02-19T15:53:53.895Z',
            updated: '2026-02-19T15:53:53.895Z',
            establishment: {
              establishment: {
                dataValues: {
                  nmdsId: 'G1005301',
                  NumberOfStaffValue: 10,
                  mainService: {},
                },
              },
            },
          },
        },
      ];

      sinon.stub(UserResearchInviteResponsesDataService, 'getReportData').callsFake(async () => {
        return reportData;
      });

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/report/userResearchInviteResponsesReport',
      });
      const res = httpMocks.createResponse();

      await generateUserResearchInviteResponsesReport(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._headers['content-type']).to.equal(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });

    it('should return status 200 and an excel format when services data is missing', async () => {
      const reportData = [
        {
          dataValues: {
            FullNameValue: 'Test User',
            EmailValue: 'me@example.com',
            JobTitleValue: 'job',
            UserResearchInviteResponseValue: 'Yes',
            created: '2026-02-19T15:53:53.895Z',
            updated: '2026-02-19T15:53:53.895Z',
            establishment: {
              establishment: {
                dataValues: {
                  nmdsId: 'G1005301',
                  NumberOfStaffValue: 10,
                },
              },
            },
          },
        },
      ];

      sinon.stub(UserResearchInviteResponsesDataService, 'getReportData').callsFake(async () => {
        return reportData;
      });

      const req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/report/userResearchInviteResponsesReport',
      });
      const res = httpMocks.createResponse();

      await generateUserResearchInviteResponsesReport(req, res);

      expect(res.statusCode).to.equal(200);
      expect(res._headers['content-type']).to.equal(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
    });
  });

  describe('printRow', () => {
    describe('When all data is present', () => {
      it('calls addRow with the correct parameters', async () => {
        const mockWorksheet = {
          addRow: () => {}
        };

        const data = {
          FullNameValue: 'Test User',
          EmailValue: 'me@example.com',
          JobTitleValue: 'job',
          UserResearchInviteResponseValue: 'Yes',
          created: '2026-02-19T15:53:53.895Z',
          updated: '2026-02-19T15:53:53.895Z',
          establishment: {
            dataValues: {
              nmdsId: 'G1005301',
              NumberOfStaffValue: 10,
              mainService: {
                dataValues: {
                  name: 'Carers support'
                }
              },
            },
          },
        };

        const addRowSpy = sinon.spy(mockWorksheet, 'addRow');

        printRow(mockWorksheet, data);

        expect(addRowSpy.calledOnce).to.equal(true);
        expect(addRowSpy.args[0][0].workplaceID).to.equal('G1005301');
        expect(addRowSpy.args[0][0].name).to.equal('Test User');
        expect(addRowSpy.args[0][0].emailAddress).to.equal('me@example.com');
        expect(addRowSpy.args[0][0].jobRole).to.equal('job');
        expect(addRowSpy.args[0][0].mainService).to.equal('Carers support');
        expect(addRowSpy.args[0][0].totalStaff).to.equal(10);
        expect(addRowSpy.args[0][0].userResearchInviteResponse).to.equal('Yes');
        expect(addRowSpy.args[0][0].createdDate).to.equal('2026-02-19T15:53:53.895Z');
        expect(addRowSpy.args[0][0].updatedDate).to.equal('');
      });
    });

    describe('When some data is missing', () => {
      it('calls addRow with the correct parameters', async () => {
        const mockWorksheet = {
          addRow: () => {}
        };

        const data = {
          FullNameValue: 'Test User',
          EmailValue: 'me@example.com',
          JobTitleValue: 'job',
          UserResearchInviteResponseValue: 'Yes',
          created: '2026-02-19T15:53:53.895Z',
          updated: '2026-02-19T15:53:53.895Z',
          establishment: {
            dataValues: {
              nmdsId: 'G1005301',
              NumberOfStaffValue: 10,
            },
          },
        };

        const addRowSpy = sinon.spy(mockWorksheet, 'addRow');

        printRow(mockWorksheet, data);

        expect(addRowSpy.calledOnce).to.equal(true);
        expect(addRowSpy.args[0][0].mainService).to.equal('');
      });
    });

    describe('When some data is empty', () => {
      it('calls addRow with the correct parameters', async () => {
        const mockWorksheet = {
          addRow: () => {}
        };

        const data = {
          FullNameValue: 'Test User',
          EmailValue: 'me@example.com',
          JobTitleValue: 'job',
          UserResearchInviteResponseValue: 'Yes',
          created: '2026-02-19T15:53:53.895Z',
          updated: '2026-02-19T15:53:53.895Z',
          establishment: {
            dataValues: {
              nmdsId: 'G1005301',
              NumberOfStaffValue: 10,
              mainService: {},
            },
          },
        };
        const addRowSpy = sinon.spy(mockWorksheet, 'addRow');

        printRow(mockWorksheet, data);

        expect(addRowSpy.calledOnce).to.equal(true);
        expect(addRowSpy.args[0][0].mainService).to.equal('');
      });
    });

    describe('When there is no data', () => {
      it('calls addRow with the correct parameters', async () => {
        const mockWorksheet = {
          addRow: () => {
          }
        };

        const data = null;
        const addRowSpy = sinon.spy(mockWorksheet, 'addRow');

        printRow(mockWorksheet, data);

        expect(addRowSpy.calledOnce).to.equal(true);
        expect(addRowSpy.args[0][0].workplaceID).to.equal('');
        expect(addRowSpy.args[0][0].name).to.equal('');
        expect(addRowSpy.args[0][0].emailAddress).to.equal('');
        expect(addRowSpy.args[0][0].jobRole).to.equal('');
        expect(addRowSpy.args[0][0].mainService).to.equal('');
        expect(addRowSpy.args[0][0].totalStaff).to.equal('');
        expect(addRowSpy.args[0][0].userResearchInviteResponse).to.equal('');
        expect(addRowSpy.args[0][0].createdDate).to.equal('');
        expect(addRowSpy.args[0][0].updatedDate).to.equal('');
      });
    });

    describe('When all data is empty', () => {
      it('calls addRow with the correct parameters', async () => {
        const mockWorksheet = {
          addRow: () => {
          }
        };

        const data = {};
        const addRowSpy = sinon.spy(mockWorksheet, 'addRow');

        printRow(mockWorksheet, data);

        expect(addRowSpy.calledOnce).to.equal(true);
        expect(addRowSpy.args[0][0].workplaceID).to.equal('');
        expect(addRowSpy.args[0][0].name).to.equal('');
        expect(addRowSpy.args[0][0].emailAddress).to.equal('');
        expect(addRowSpy.args[0][0].jobRole).to.equal('');
        expect(addRowSpy.args[0][0].mainService).to.equal('');
        expect(addRowSpy.args[0][0].totalStaff).to.equal('');
        expect(addRowSpy.args[0][0].userResearchInviteResponse).to.equal('');
        expect(addRowSpy.args[0][0].createdDate).to.equal('');
        expect(addRowSpy.args[0][0].updatedDate).to.equal('');
      });
    });
  });
});
