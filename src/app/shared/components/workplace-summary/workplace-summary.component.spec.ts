import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { NumericAnswerPipe } from '@shared/pipes/numeric-answer.pipe';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { within } from '@testing-library/angular';

import { Establishment } from '../../../../mockdata/establishment';
import { EligibilityIconComponent } from '../eligibility-icon/eligibility-icon.component';
import { InsetTextComponent } from '../inset-text/inset-text.component';
import { SummaryRecordValueComponent } from '../summary-record-value/summary-record-value.component';
import { WorkplaceSummaryComponent } from './workplace-summary.component';

describe('WorkplaceSummaryComponent', () => {
  let component: WorkplaceSummaryComponent;
  let fixture: ComponentFixture<WorkplaceSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [
        WorkplaceSummaryComponent,
        InsetTextComponent,
        SummaryRecordValueComponent,
        NumericAnswerPipe,
        EligibilityIconComponent,
      ],
      providers: [
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(),
          deps: [HttpClient, Router, UserService],
        },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkplaceSummaryComponent);
    component = fixture.componentInstance;
    component.workplace = Establishment;
    component.requestedServiceName = 'Requested service name';
    component.canEditEstablishment = true;
    component.canViewListOfWorkers = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show Pending on main service when non-CQC to CQC main service change has been requested', async () => {
    component.cqcStatusRequested = true;
    component.canEditEstablishment = true;
    fixture.detectChanges();

    const mainServiceChangeOrPending = within(document.body).queryByTestId('main-service-change-or-pending');
    expect(mainServiceChangeOrPending.innerHTML).toContain('Pending');
  });

  it('should show Change on main service when non-CQC to CQC main service change has NOT been requested', async () => {
    component.cqcStatusRequested = false;
    component.canEditEstablishment = true;
    fixture.detectChanges();

    const mainServiceChangeOrPending = within(document.body).queryByTestId('main-service-change-or-pending');
    expect(mainServiceChangeOrPending.innerHTML).toContain('Change');
  });

  it('should show requested service name when non-CQC to CQC main service change has been requested', async () => {
    component.cqcStatusRequested = true;
    fixture.detectChanges();

    const mainServiceName = within(document.body).queryByTestId('main-service-name');
    expect(mainServiceName.innerHTML).toContain(component.requestedServiceName);
    expect(mainServiceName.innerHTML).not.toContain(component.workplace.mainService.name);
  });

  it('should show existing service name when non-CQC to CQC main service change has NOT been requested', async () => {
    component.cqcStatusRequested = false;
    fixture.detectChanges();

    const mainServiceName = within(document.body).queryByTestId('main-service-name');
    expect(mainServiceName.innerHTML).toContain(component.workplace.mainService.name);
    expect(mainServiceName.innerHTML).not.toContain(component.requestedServiceName);
  });
  it('should show banner if you have more staff records', async () => {
    component.workerCount = 10;
    component.workplace.numberOfStaff = 9;
    component.wdfView = false;
    component.canViewListOfWorkers = true;
    fixture.detectChanges();
    const moreRecords = within(document.body).queryByTestId('morerecords');
    expect(moreRecords.innerHTML).toContain("You've more staff records than staff");
    expect(moreRecords.innerHTML).toContain('View staff records');
  });

  it('should show banner if you have more total staff', async () => {
    component.workerCount = 8;
    component.workplace.numberOfStaff = 9;
    component.wdfView = false;
    component.canViewListOfWorkers = true;
    fixture.detectChanges();
    const moreRecords = within(document.body).queryByTestId('morerecords');
    expect(moreRecords.innerHTML).toContain("You've more staff than staff records");
  });

  it("should not show banner if you don't have permission to list workers", async () => {
    component.workerCount = 10;
    component.workplace.numberOfStaff = 9;
    component.wdfView = false;
    component.canViewListOfWorkers = false;
    fixture.detectChanges();
    const moreRecords = within(document.body).queryByTestId('morerecords');
    expect(moreRecords).toBe(null);
  });

  it('should not show banner if it is the WDF View', async () => {
    component.workerCount = 10;
    component.workplace.numberOfStaff = 9;
    component.wdfView = true;
    component.canViewListOfWorkers = true;
    fixture.detectChanges();
    const moreRecords = within(document.body).queryByTestId('morerecords');
    expect(moreRecords).toBe(null);
  });
});
