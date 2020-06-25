'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const Excel = require('exceljs');
const moment = require('moment');


const { establishmentBuilder } = require('../../../../factories/models');
const { LocalAuthorityReportDataBuilder } = require('../../../../factories/LocalAuthorityReportData/LocalAuthority');
const  {getReport, LAReport} = require( '../../../../../routes/reports/localAuthorityReport/user');
describe('/server/routes/reports/LocalAuthorityReport/user.js', () => {
  beforeEach(() => {
    const LAreportValues = async (args) => {
      return LocalAuthorityReportDataBuilder();
    };
    sinon.stub(LAReport, 'run').callsFake(LAreportValues);
  });
  afterEach(() => {
    sinon.restore();
  });


  describe('get report', () => {
    it("should return a report", async () => {
      const reportData = await getReport(new Date(), establishmentBuilder());
      expect(reportData).to.exist;
    });
    it("should have the right worksheet names", async () => {
      const reportData = await getReport(new Date(), establishmentBuilder());
      const workbook = new Excel.Workbook();
      await workbook.xlsx.load(reportData);
      expect(workbook.worksheets[0].name).to.equal('Workplaces');
      expect(workbook.worksheets[1].name).to.equal('Staff Records');
    });
    describe("Workplace Sheet", () => {
      it("should have the right header data",async () => {
        //arrange
        sinon.restore();
        const LAreportData = LocalAuthorityReportDataBuilder()
        const LAreportValues = async (args) => {
          return LAreportData;
        };
        sinon.stub(LAReport, 'run').callsFake(LAreportValues);


        const establishment = establishmentBuilder();
        //act
        const XLSXData = await getReport(new Date(),establishment );
        const workbook = new Excel.Workbook();
        await workbook.xlsx.load(XLSXData);
        const workplaceWS = workbook.worksheets[0];

        //assert
        expect(workplaceWS.getCell('B5').value).to.equal(moment(LAreportData.date).format('DD/MM/YYYY'));
        expect(workplaceWS.getCell('B6').value).to.equal(LAreportData.reportEstablishment.localAuthority);
        expect(workplaceWS.getCell('B7').value).to.equal(LAreportData.reportEstablishment.name);
      });
      it("should have the right number of workplace rows",async () => {
        //arrange
        sinon.restore();
        const LAreportData = LocalAuthorityReportDataBuilder();
        const LAreportValues = async (args) => {
          return LAreportData;
        };
        sinon.stub(LAReport, 'run').callsFake(LAreportValues);


        const establishment = establishmentBuilder();
        //act
        const XLSXData = await getReport(new Date(),establishment );
        const workbook = new Excel.Workbook();
        await workbook.xlsx.load(XLSXData);
        const workplaceWS = workbook.worksheets[0];

        //assert
        expect(workplaceWS.getCell('A13').value).to.equal(LAreportData.establishments[0].workplaceName);
        expect(workplaceWS.getCell('A14').value).to.equal(LAreportData.establishments[1].workplaceName);
        expect(workplaceWS.getCell('A15').value).to.be.null;

      });
      it("should have the right data",async () => {
        //arrange
        sinon.restore();
        const LAreportData = LocalAuthorityReportDataBuilder();
        const LAreportValues = async (args) => {
          return LAreportData;
        };
        sinon.stub(LAReport, 'run').callsFake(LAreportValues);


        const establishment = establishmentBuilder();
        //act
        const XLSXData = await getReport(new Date(),establishment );
        const workbook = new Excel.Workbook();
        await workbook.xlsx.load(XLSXData);
        const workplaceWS = workbook.worksheets[0];
        const testWorkplace = LAreportData.establishments[0];
        //assert
        expect(workplaceWS.getCell('A13').value).to.equal(testWorkplace.workplaceName);
        expect(workplaceWS.getCell('B13').value).to.equal(testWorkplace.workplaceId);
        expect(workplaceWS.getCell('E13').value).to.equal(testWorkplace.establishmentType);
        expect(workplaceWS.getCell('H13').value).to.equal(testWorkplace.capacityOfMainService);
        expect(workplaceWS.getCell('S13').value).to.equal(testWorkplace.numberOfStaffRecordsNotAgency);
      });
      it("should have the correct data in the total rows",async () => {
        //arrange
        sinon.restore();
        const LAreportData = LocalAuthorityReportDataBuilder();
        const LAreportValues = async (args) => {
          return LAreportData;
        };
        sinon.stub(LAReport, 'run').callsFake(LAreportValues);


        const establishment = establishmentBuilder();
        //act
        const XLSXData = await getReport(new Date(),establishment );
        const workbook = new Excel.Workbook();
        await workbook.xlsx.load(XLSXData);
        const workplaceWS = workbook.worksheets[0];
        const testWorkplace = LAreportData.establishments[0];
        //assert
        expect(workplaceWS.getCell('A13').value).to.equal(testWorkplace.workplaceName);
        expect(workplaceWS.getCell('B13').value).to.equal(testWorkplace.workplaceId);
        expect(workplaceWS.getCell('E13').value).to.equal(testWorkplace.establishmentType);
        expect(workplaceWS.getCell('H13').value).to.equal(testWorkplace.capacityOfMainService);
        expect(workplaceWS.getCell('S13').value).to.equal(testWorkplace.numberOfStaffRecordsNotAgency);
      });

    });
    describe("Staff Record Sheet", () => {
      it("should have the right amount of rows", async () => {
        //arrange
        sinon.restore();
        const LAreportData = LocalAuthorityReportDataBuilder()
        const LAreportValues = async (args) => {
          console.log("running stub");
          console.log(LAreportData);
          return LAreportData;
        };
        sinon.stub(LAReport, 'run').callsFake(LAreportValues);


        const establishment = establishmentBuilder();
        //act
        const XLSXData = await getReport(new Date(), establishment);
        const workbook = new Excel.Workbook();
        await workbook.xlsx.load(XLSXData);
        const workplaceWS = workbook.worksheets[1];

        //assert
        expect(workplaceWS.getCell('A11').value).to.equal(LAreportData.workers[0].localId);
        expect(workplaceWS.getCell('A12').value).to.equal(LAreportData.workers[1].localId);
        expect(workplaceWS.getCell('A13').value).to.equal(LAreportData.workers[2].localId);
        expect(workplaceWS.getCell('A14').value).to.equal(LAreportData.workers[3].localId);
        expect(workplaceWS.getCell('A15').value).to.equal(LAreportData.workers[4].localId);
        expect(workplaceWS.getCell('A16').value).to.be.null;
      });

      it("rows should have data dependent on worker data", async () => {
        //arrange
        sinon.restore();
        const LAreportData = LocalAuthorityReportDataBuilder()
        const LAreportValues = async (args) => {

          return LAreportData;
        };
        sinon.stub(LAReport, 'run').callsFake(LAreportValues);


        const establishment = establishmentBuilder();
        //act
        const XLSXData = await getReport(new Date(), establishment);
        const workbook = new Excel.Workbook();
        await workbook.xlsx.load(XLSXData);
        const workplaceWS = workbook.worksheets[1];

        //assert
        expect(workplaceWS.getCell('E11').value).to.equal(LAreportData.workers[0].gender);
        expect(workplaceWS.getCell('E12').value).to.equal(LAreportData.workers[1].gender);
        expect(workplaceWS.getCell('E13').value).to.equal(LAreportData.workers[2].gender);
        expect(workplaceWS.getCell('E14').value).to.equal(LAreportData.workers[3].gender);
        expect(workplaceWS.getCell('E15').value).to.equal(LAreportData.workers[4].gender);
      });
    });
  });
})
