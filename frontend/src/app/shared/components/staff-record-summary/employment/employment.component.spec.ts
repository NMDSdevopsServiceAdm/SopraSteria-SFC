import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { SummaryRecordChangeComponent } from '@shared/components/summary-record-change/summary-record-change.component';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';

import { EmploymentComponent } from './employment.component';

describe('EmploymentComponent', () => {
  async function setup() {
    const { fixture, getByText, getByTestId } = await render(EmploymentComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [SummaryRecordChangeComponent],
      providers: [
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canEditWorker']),
          deps: [HttpClient],
        },
      ],
      componentProperties: {
        canEditWorker: true,
        workplace: establishmentBuilder() as Establishment,
        worker: workerBuilder() as Worker,
        wdfView: false,
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

  it('should render an EmploymentComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Health and Social Care visa', () => {
    it('should render Add link with the staff-record-summary/health-and-social-care url when health and care visa question not answered', async () => {
      const { fixture, component, getByTestId } = await setup();

      component.worker.healthAndCareVisa = undefined;
      fixture.detectChanges();

      const healthAndCareVisaSection = within(getByTestId('health-and-care-visa-section'));
      const addLink = healthAndCareVisaSection.getByText('Add');

      expect(addLink.getAttribute('href')).toBe(
        `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/health-and-care-visa`,
      );
    });

    it('should render Yes and a Change link with the staff-record-summary/health-and-social-care url when health and care visa question answered Yes', async () => {
      const { fixture, component, getByTestId } = await setup();

      component.worker.healthAndCareVisa = 'Yes';
      fixture.detectChanges();

      const healthAndCareVisaSection = within(getByTestId('health-and-care-visa-section'));
      const yesMessage = healthAndCareVisaSection.getByText('Yes');
      const changeLink = healthAndCareVisaSection.getByText('Change');

      expect(yesMessage).toBeTruthy();
      expect(changeLink.getAttribute('href')).toBe(
        `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/health-and-care-visa`,
      );
    });

    it("should display Not known when health and care visa question answered as Don't know", async () => {
      const { fixture, component, getByTestId } = await setup();

      component.worker.healthAndCareVisa = "Don't know";
      fixture.detectChanges();

      const healthAndCareVisaSection = within(getByTestId('health-and-care-visa-section'));
      const notKnownMessage = healthAndCareVisaSection.getByText('Not known');
      const changeLink = healthAndCareVisaSection.getByText('Change');

      expect(notKnownMessage).toBeTruthy();
      expect(changeLink.getAttribute('href')).toBe(
        `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/health-and-care-visa`,
      );
    });
  });
});
