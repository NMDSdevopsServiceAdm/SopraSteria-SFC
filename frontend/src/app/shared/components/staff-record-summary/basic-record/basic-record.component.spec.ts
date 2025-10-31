import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule, provideRouter } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { workerWithWdf } from '@core/test-utils/MockWorkerService';
import { SummaryRecordChangeComponent } from '@shared/components/summary-record-change/summary-record-change.component';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';

import { BasicRecordComponent } from './basic-record.component';

describe('BasicRecordComponent', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function setup(overrides: any = {}) {
    const setupTools = await render(BasicRecordComponent, {
      imports: [SharedModule, RouterModule],
      declarations: [SummaryRecordChangeComponent],
      providers: [
        InternationalRecruitmentService,
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canEditWorker']),
          deps: [HttpClient],
        },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      componentProperties: {
        canEditWorker: true,
        mandatoryDetailsPage: false,
        workplace: establishmentBuilder() as Establishment,
        worker: workerWithWdf() as Worker,
        ...overrides,
      },
    });

    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance,
    };
  }

  it('should render a BasicRecordComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the change link with the staff-record-summary/staff-details url when not on the mandatory details page', async () => {
    const { component, getByTestId } = await setup();

    const nameSection = within(getByTestId('name-and-contract-section'));
    const changeLink = nameSection.getByText('Change');

    expect(changeLink.getAttribute('href')).toBe(
      `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/staff-details`,
    );
  });

  it('should render the change link with the staff-record-summary/main-job-role url when not on the mandatory details page', async () => {
    const { component, getByTestId } = await setup();

    const mainJobRoleSection = within(getByTestId('main-job-role-section'));
    const changeLink = mainJobRoleSection.getByText('Change');

    expect(changeLink.getAttribute('href')).toBe(
      `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/main-job-role`,
    );
  });

  it('should render the change link with the mandatory-details/staff-details url when on the mandatory details page', async () => {
    const { component, getByTestId } = await setup({ mandatoryDetailsPage: true });

    const nameSection = within(getByTestId('name-and-contract-section'));
    const changeLink = nameSection.getByText('Change');

    expect(changeLink.getAttribute('href')).toBe(
      `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/mandatory-details/staff-details`,
    );
  });

  it('should render the change link with the mandatory-details/main-job-role url when on the mandatory details page', async () => {
    const { component, getByTestId } = await setup({ mandatoryDetailsPage: true });

    const mainJobRoleSection = within(getByTestId('main-job-role-section'));
    const changeLink = mainJobRoleSection.getByText('Change');

    expect(changeLink.getAttribute('href')).toBe(
      `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/mandatory-details/main-job-role`,
    );
  });

  describe('Continue button', () => {
    it('should not be rendered when no route passed in', async () => {
      const { queryByText } = await setup();

      const continueButton = queryByText('Continue');

      expect(continueButton).toBeFalsy();
    });

    it('should be rendered with link to route passed in', async () => {
      const { queryByText } = await setup({
        continueRoute: ['/workplace', 'workplaceUid', 'staff-record', 'add-another-staff-record'],
      });

      const continueButton = queryByText('Continue');

      expect(continueButton).toBeTruthy();
      expect(continueButton.getAttribute('href')).toEqual(
        '/workplace/workplaceUid/staff-record/add-another-staff-record',
      );
    });
  });
});
