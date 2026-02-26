// import { provideHttpClient } from '@angular/common/http';
// import { provideHttpClientTesting } from '@angular/common/http/testing';
// import { getTestBed, TestBed } from '@angular/core/testing';
// import { ReportService } from '@core/services/report.service';
// import { SharedModule } from '@shared/shared.module';
// import { fireEvent, render } from '@testing-library/angular';
// import { of } from 'rxjs';
//
// import { AdminModule } from '../admin.module';
// import { ReportComponent } from './admin-report.component';
//
// describe('ReportComponent', () => {
//   async function setup() {
//     const setupTools = await render(ReportComponent, {
//       imports: [SharedModule, AdminModule],
//       providers: [provideHttpClient(), provideHttpClientTesting()],
//     });
//
//     const component = setupTools.fixture.componentInstance;
//     const reportService = TestBed.inject(ReportService);
//     const getRegistrationReport = spyOn(reportService, 'getRegistrationSurveyReport').and.callFake(() => of(null));
//     const getSatisfactionReport = spyOn(reportService, 'getSatisfactionSurveyReport').and.callFake(() => of(null));
//     const getDeleteReport = spyOn(reportService, 'getDeleteReport').and.callFake(() => of(null));
//     const getLAProgressReport = spyOn(reportService, 'getLocalAuthorityAdminReport').and.callFake(() => of(null));
//     const getWDFSummaryReport = spyOn(reportService, 'getWdfSummaryReport').and.callFake(() => of(null));
//     const getUserResearchInviteResponseReport = spyOn(reportService, 'getUserResearchInviteResponseReport').and.callFake(() => of(null));
//     const saveAs = spyOn(component, 'saveFile').and.callFake(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function
//
//     return {
//       ...setupTools,
//       component,
//       getRegistrationReport,
//       getSatisfactionReport,
//       getDeleteReport,
//       getLAProgressReport,
//       getWDFSummaryReport,
//       getUserResearchInviteResponseReport,
//       saveAs,
//     }
//   }
//
//   it('should create', async () => {
//     const component = await setup();
//     expect(component).toBeTruthy();
//   });
//
//   it('should download a registration survey report when the "Registration survey" button is clicked', async () => {
//     const { getByText, getRegistrationReport, saveAs } = await setup();
//
//     fireEvent.click(getByText('Registration survey', { exact: false }));
//
//     expect(getRegistrationReport).toHaveBeenCalled();
//     expect(saveAs).toHaveBeenCalled();
//   });
//
//   it('should download a satisfaction survey report when the "Satisfaction survey" button is clicked', async () => {
//     const { getByText, getSatisfactionReport, saveAs } = await setup();
//
//     fireEvent.click(getByText('Satisfaction survey', { exact: false }));
//
//     expect(getSatisfactionReport).toHaveBeenCalled();
//     expect(saveAs).toHaveBeenCalled();
//   });
//
//   it('should download a delete report when the "Delete report" button is clicked', async () => {
//     const { getByText, getDeleteReport, saveAs } = await setup();
//
//     fireEvent.click(getByText('Deletion report', { exact: false }));
//
//     expect(getDeleteReport).toHaveBeenCalled();
//     expect(saveAs).toHaveBeenCalled();
//   });
//
//   it('should download a local authority progress report when the "Local admin authority progress" button is clicked', async () => {
//     const { getByText, getLAProgressReport, saveAs } = await setup();
//
//     fireEvent.click(getByText('Admin local authority progress', { exact: false }));
//
//     expect(getLAProgressReport).toHaveBeenCalled();
//     expect(saveAs).toHaveBeenCalled();
//   });
//
//   it('should download a WDF Summary report when the "WDF Summary Report" button is clicked', async () => {
//     const { getByText, getWDFSummaryReport, saveAs } = await setup();
//
//     fireEvent.click(getByText('WDF summary report', { exact: false }));
//
//     expect(getWDFSummaryReport).toHaveBeenCalled();
//     expect(saveAs).toHaveBeenCalled();
//   });
//
//   it('should download a User Research Invite Response report when the "User Research Invite Response Report" button is clicked', async () => {
//     const { getByText, getUserResearchInviteResponseReport, saveAs } = await setup();
//
//     fireEvent.click(getByText('User research invite response report', { exact: false }));
//
//     expect(getUserResearchInviteResponseReport).toHaveBeenCalled();
//     expect(saveAs).toHaveBeenCalled();
//   });
// });
