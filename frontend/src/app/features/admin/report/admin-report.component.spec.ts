import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReportService } from '@core/services/report.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { AdminModule } from '../admin.module';
import { ReportComponent } from './admin-report.component';

describe('ReportComponent', () => {
  let component: ReportComponent;
  let fixture: ComponentFixture<ReportComponent>;

  async function setup() {
    return render(ReportComponent, {
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, AdminModule],
    });
  }

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  it('should download a registration survey report when the "Registration survey" button is clicked', async () => {
    const component = await setup();

    const reportService = TestBed.inject(ReportService);
    const getReport = spyOn(reportService, 'getRegistrationSurveyReport').and.callFake(() => of(null));
    const saveAs = spyOn(component.fixture.componentInstance, 'saveFile').and.callFake(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function

    fireEvent.click(component.getByText('Registration survey', { exact: false }));

    expect(getReport).toHaveBeenCalled();
    expect(saveAs).toHaveBeenCalled();
  });

  it('should download a satisfaction survey report when the "Satisfaction survey" button is clicked', async () => {
    const component = await setup();

    const reportService = TestBed.inject(ReportService);
    const getReport = spyOn(reportService, 'getSatisfactionSurveyReport').and.callFake(() => of(null));
    const saveAs = spyOn(component.fixture.componentInstance, 'saveFile').and.callFake(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function

    fireEvent.click(component.getByText('Satisfaction survey', { exact: false }));

    expect(getReport).toHaveBeenCalled();
    expect(saveAs).toHaveBeenCalled();
  });

  it('should download a delete report when the "Delete report" button is clicked', async () => {
    const component = await setup();

    const reportService = TestBed.inject(ReportService);
    const getReport = spyOn(reportService, 'getDeleteReport').and.callFake(() => of(null));
    const saveAs = spyOn(component.fixture.componentInstance, 'saveFile').and.callFake(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function

    fireEvent.click(component.getByText('Deletion report', { exact: false }));

    expect(getReport).toHaveBeenCalled();
    expect(saveAs).toHaveBeenCalled();
  });

  it('should download a local authority progress report when the "Local admin authority progress" button is clicked', async () => {
    const component = await setup();

    const reportService = TestBed.inject(ReportService);
    const getReport = spyOn(reportService, 'getLocalAuthorityAdminReport').and.callFake(() => of(null));
    const saveAs = spyOn(component.fixture.componentInstance, 'saveFile').and.callFake(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function

    fireEvent.click(component.getByText('Admin local authority progress', { exact: false }));

    expect(getReport).toHaveBeenCalled();
    expect(saveAs).toHaveBeenCalled();
  });

  it('should download a WDF Summary report when the "WDF Summary Report" button is clicked', async () => {
    const component = await setup();

    const reportService = TestBed.inject(ReportService);
    const getReport = spyOn(reportService, 'getWdfSummaryReport').and.callFake(() => of(null));
    const saveAs = spyOn(component.fixture.componentInstance, 'saveFile').and.callFake(() => {}); // eslint-disable-line @typescript-eslint/no-empty-function

    fireEvent.click(component.getByText('WDF summary report', { exact: false }));

    expect(getReport).toHaveBeenCalled();
    expect(saveAs).toHaveBeenCalled();
  });
});
