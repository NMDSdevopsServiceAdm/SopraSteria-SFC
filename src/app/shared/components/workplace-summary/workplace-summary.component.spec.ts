import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NumericAnswerPipe } from '@shared/pipes/numeric-answer.pipe';
import { render, within } from '@testing-library/angular';

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
        EligibilityIconComponent
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkplaceSummaryComponent);
    component = fixture.componentInstance;
    component.workplace = Establishment;
    component.requestedServiceName = "Requested service name";
    component.canEditEstablishment = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show Pending on main service when non-CQC to CQC main service change has been requested', async () => {
    component.cqcStatusRequested = true;
    fixture.detectChanges();

    const mainServiceChangeOrPending = await within(document.body).findByTestId('main-service-change-or-pending');
    expect(mainServiceChangeOrPending.innerHTML).toContain("Pending");
  });

  it('should show Change on main service when non-CQC to CQC main service change has NOT been requested', async () => {
    component.cqcStatusRequested = false;
    fixture.detectChanges();

    const mainServiceChangeOrPending = await within(document.body).findByTestId('main-service-change-or-pending');
    expect(mainServiceChangeOrPending.innerHTML).toContain("Change");
  });

  it('should show requested service name when non-CQC to CQC main service change has been requested', async () => {
    component.cqcStatusRequested = true;
    fixture.detectChanges();

    const mainServiceName = await within(document.body).findByTestId('main-service-name');
    expect(mainServiceName.innerHTML).toContain(component.requestedServiceName);
    expect(mainServiceName.innerHTML).not.toContain(component.workplace.mainService.name);
  });

  it('should show existing service name when non-CQC to CQC main service change has NOT been requested', async () => {
    component.cqcStatusRequested = false;
    fixture.detectChanges();

    const mainServiceName = await within(document.body).findByTestId('main-service-name');
    expect(mainServiceName.innerHTML).toContain(component.workplace.mainService.name);
    expect(mainServiceName.innerHTML).not.toContain(component.requestedServiceName);
  });
});
