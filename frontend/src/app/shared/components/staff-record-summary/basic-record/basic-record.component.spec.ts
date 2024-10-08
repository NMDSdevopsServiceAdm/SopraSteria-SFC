import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { workerWithWdf } from '@core/test-utils/MockWorkerService';
import { SummaryRecordChangeComponent } from '@shared/components/summary-record-change/summary-record-change.component';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';

import { BasicRecordComponent } from './basic-record.component';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';

describe('BasicRecordComponent', () => {
  async function setup(mandatoryDetailsPage = false) {
    const { fixture, getByText, getByTestId } = await render(BasicRecordComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [SummaryRecordChangeComponent],
      providers: [
        InternationalRecruitmentService,
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canEditWorker']),
          deps: [HttpClient],
        },
      ],
      componentProperties: {
        canEditWorker: true,
        mandatoryDetailsPage,
        workplace: establishmentBuilder() as Establishment,
        worker: workerWithWdf() as Worker,
      },
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
      getByTestId,
    };
  }

  it('should render a BasicRecordComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the change link with the staff-record-summary/staff-details url when not on the mandatory details page', async () => {
    const { component, getByText, getByTestId } = await setup();

    const nameSection = within(getByTestId('name-and-contract-section'));
    const changeLink = nameSection.getByText('Change');

    expect(changeLink.getAttribute('href')).toBe(
      `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/staff-details`,
    );
  });

  it('should render the change link with the staff-record-summary/main-job-role url when not on the mandatory details page', async () => {
    const { component, getByText, getByTestId } = await setup();

    const mainJobRoleSection = within(getByTestId('main-job-role-section'));
    const changeLink = mainJobRoleSection.getByText('Change');

    expect(changeLink.getAttribute('href')).toBe(
      `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/main-job-role`,
    );
  });

  it('should render the change link with the mandatory-details/staff-details url when on the mandatory details page', async () => {
    const { component, getByText, getByTestId } = await setup(true);

    const nameSection = within(getByTestId('name-and-contract-section'));
    const changeLink = nameSection.getByText('Change');

    expect(changeLink.getAttribute('href')).toBe(
      `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/mandatory-details/staff-details`,
    );
  });

  it('should render the change link with the mandatory-details/main-job-role url when on the mandatory details page', async () => {
    const { component, getByText, getByTestId } = await setup(true);

    const mainJobRoleSection = within(getByTestId('main-job-role-section'));
    const changeLink = mainJobRoleSection.getByText('Change');

    expect(changeLink.getAttribute('href')).toBe(
      `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/mandatory-details/main-job-role`,
    );
  });
});
